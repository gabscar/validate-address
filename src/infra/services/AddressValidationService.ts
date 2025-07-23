import { Address, AddressValidationResult, AddressValidationRequest } from '../../domain/entities/Address';
import { IAddressValidationService } from '../../domain/services/AddressValidationService';

export class AddressValidationService implements IAddressValidationService {


  async validateAddress(request: AddressValidationRequest): Promise<AddressValidationResult> {
    try {

      const parsedAddress = this.parseAddress(request.address);
      
      if (!parsedAddress) {
        return {
          isValid: false,
          isCorrected: false,
          
          originalAddress: request.address,
          confidence: 0
        };
      }

      const isValid = this.isValidAddress(parsedAddress);
      const corrections = this.suggestCorrections(parsedAddress);
      const isCorrected = corrections.length > 0;

      return {
        isValid,
        isCorrected,
        originalAddress: request.address,
        validatedAddress: parsedAddress,
        corrections: corrections.length > 0 ? corrections : undefined,
        confidence: this.calculateConfidence(parsedAddress, corrections)
      };
    } catch (error) {
      console.error('Address validation error:', error);
      return {
        isValid: false,
        isCorrected: false,
        originalAddress: request.address,
        confidence: 0
      };
    }
  }

  private parseAddress(addressText: string): Address | null {
    
    const address = addressText.trim();
    if (!address) return null;


    const zipCodePattern = /\b\d{5}(?:-\d{4})?\b/;
    const statePattern = /\b[A-Z]{2}\b/;
    
    const zipMatch = address.match(zipCodePattern);
    const stateMatch = address.match(statePattern);
    
    if (!zipMatch || !stateMatch) return null;

    const zipCode = zipMatch[0];
    const state = stateMatch[0];
    
    const parts = address.split(',').map(part => part.trim());
    
    if (parts.length < 2) return null;

    const streetPart = parts[0];
    const cityPart = parts[1];
    
    const streetMatch = streetPart.match(/^(\d+)\s+(.+)$/);
    if (!streetMatch) return null;

    const number = streetMatch[1];
    const street = streetMatch[2];

    return {
      street,
      number,
      city: cityPart,
      state,
      zipCode,
      country: 'US'
    };
  }

  private isValidAddress(address: Address): boolean {
    return !!(
      address.street &&
      address.number &&
      address.city &&
      address.state &&
      address.zipCode &&
      address.state.length === 2 &&
      /^\d{5}(-\d{4})?$/.test(address.zipCode)
    );
  }

  private suggestCorrections(address: Address): string[] {
    const corrections: string[] = [];
    
    if (address.state.length !== 2) {
      corrections.push('State should be a 2-letter abbreviation');
    }
    
    if (!/^\d{5}(-\d{4})?$/.test(address.zipCode)) {
      corrections.push('ZIP code should be 5 digits or 5+4 format');
    }
    
    return corrections;
  }

  private calculateConfidence(address: Address, corrections: string[]): number {
    let confidence = 100;
    
    confidence -= corrections.length * 10;
    
    return Math.max(0, Math.min(100, confidence));
  }
} 