import { AddressValidationRequest, AddressValidationResult } from '../domain/entities/Address';
import { AddressValidationService } from '../infra/services/AddressValidationService';
import { GroqAddressValidationService } from '../infra/services/GroqAddressValidationService';

export class ValidateAddressUseCase {
  constructor(
    private readonly regexService: AddressValidationService,
    private readonly grokService: GroqAddressValidationService
  ) { }

  async execute(request: AddressValidationRequest): Promise<AddressValidationResult & { validationMethod: string }> {

    try {
      const regexResult = await this.regexService.validateAddress(request);
      if (regexResult.isValid && regexResult.validatedAddress) {
        return { ...regexResult, validationMethod: 'regex' };
      }
    } catch (error) {
      console.error('[Regex Validation Failed]', error);
    }

    if (process.env.GROQ_API_KEY) {
      try {
        const grokResult = await this.grokService.validateAddress(request);
        if (grokResult.isValid && grokResult.validatedAddress) {
          return { ...grokResult, validationMethod: 'grok' };
        }
      } catch (grokError) {
        console.error('[Groq Validation Failed]', grokError);
      }
    }
    return {
      isValid: false,
      isCorrected: false,
      originalAddress: request.address,
      confidence: 0,
      validationMethod: 'failed'
    };
  }
}
