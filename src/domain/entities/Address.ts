export interface Address {
  street: string;
  number: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface AddressValidationResult {
  isValid: boolean;
  isCorrected: boolean;
  originalAddress: string;
  validatedAddress?: Address;
  corrections?: string[];
  confidence: number;
  validationMethod?: 'regex' | 'grok' | 'failed';
}

export interface AddressValidationRequest {
  address: string;
} 