import { AddressValidationResult, AddressValidationRequest } from '../entities/Address';

export interface IAddressValidationService {
  validateAddress(request: AddressValidationRequest): Promise<AddressValidationResult>;
} 