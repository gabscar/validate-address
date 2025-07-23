import axios from 'axios';
import {
  Address,
  AddressValidationResult,
  AddressValidationRequest
} from '../../domain/entities/Address';
import { IAddressValidationService } from '../../domain/services/AddressValidationService';

interface GroqResponse {
  address?: {
    street: string;
    number: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    apartment?: string;
  };
  confidence: number;
  isValid: boolean;
  corrections?: string[];
}

export class GroqAddressValidationService implements IAddressValidationService {
  private readonly groqApiUrl = process.env.GROQ_API_URL || 'https://api.groq.com/openai/v1/chat/completions';
  private readonly groqApiKey = process.env.GROQ_API_KEY;

  async validateAddress(request: AddressValidationRequest): Promise<AddressValidationResult> {
    try {
      if (!this.groqApiKey) throw new Error('Groq API key not configured');

      const prompt = this.buildPrompt(request.address);
      const response = await this.callGroqAPI(prompt);

      if (!response.address || !this.isValidStructuredAddress(response.address)) {
        return {
          isValid: false,
          isCorrected: false,
          originalAddress: request.address,
          confidence: 0
        };
      }

      const validatedAddress: Address = {
        street: response.address.street,
        number: response.address.number,
        city: response.address.city,
        state: response.address.state,
        zipCode: response.address.zipCode,
        country: response.address.country
      };

      return {
        isValid: response.isValid,
        isCorrected: (response.corrections?.length || 0) > 0,
        originalAddress: request.address,
        validatedAddress,
        corrections: response.corrections,
        confidence: response.confidence
      };
          } catch {
        return {
          isValid: false,
          isCorrected: false,
          originalAddress: request.address,
          confidence: 0,
          validationMethod: 'grok'
        };
      }
  }

  private isValidStructuredAddress(addr: GroqResponse["address"]): boolean {
    return !!(
      addr &&
      addr.street &&
      addr.number &&
      addr.city &&
      addr.state?.length === 2 &&
      /^\d{5}(-\d{4})?$/.test(addr.zipCode)
    );
  }

  private buildPrompt(address: string): string {
    return `Extract and validate this US address. Return ONLY a valid JSON object with this exact structure:

{
  "address": {
    "street": "street name",
    "number": "street number",
    "city": "city name",
    "state": "2-letter state code",
    "zipCode": "5-digit zip code",
    "country": "US",
    "apartment": "apartment/unit if present"
  },
  "confidence": 0-100,
  "isValid": true or false,
  "corrections": ["list of corrections made"]
}

Address to parse: "${address}"

Rules:
- Handle abbreviations (e.g., "St." → "Street", "N." → "North", "NYC" → "New York")
- Extract apartment/unit numbers (e.g., "#4B" → apartment)
- If address is invalid or unparseable, set "address" to null
- Confidence should reflect parsing certainty
- Respond with ONLY the JSON object, no additional text or formatting`;
  }

  private async callGroqAPI(prompt: string): Promise<GroqResponse> {
    try {
      const response = await axios.post(
        this.groqApiUrl,
        {
          model: 'meta-llama/llama-4-scout-17b-16e-instruct',
          messages: [
            {
              role: 'system',
              content: 'You are a helpful assistant for US address parsing. Always respond with valid JSON only.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.1,
          max_tokens: 1000
        },
        {
          headers: {
            Authorization: `Bearer ${this.groqApiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );
      const content = response.data.choices?.[0]?.message?.content;

      if (!content) throw new Error('Empty response from Groq');

      let jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        const codeBlockMatch = content.match(/```json\s*(\{[\s\S]*?\})\s*```/);
        if (codeBlockMatch) {
          jsonMatch = [codeBlockMatch[1]];
        }
      }

      if (!jsonMatch) {
        throw new Error('No JSON detected in Groq response');
      }

      try {
        const parsed = JSON.parse(jsonMatch[0]);
        
        if (typeof parsed !== 'object' || parsed === null) {
          throw new Error('Response is not a valid object');
        }
        
        return parsed;
      } catch {
        throw new Error('Invalid JSON in Groq response');
      }
    } catch {
      throw new Error('Error calling Groq API');
    }
  }
}
