import { AddressValidationResult } from '../../src/domain/entities/Address';

export const addressMock: AddressValidationResult = {
  isValid: true,
  isCorrected: true,
  originalAddress: 'apt 5b, 123 n. main st, new york ny 10001',
  validatedAddress: {
    street: 'North Main Street',
    number: '123',
    city: 'New York',
    state: 'NY',
    zipCode: '10001',
    country: 'US'
  },
  corrections: [
    "Expanded 'St.' to 'Street'",
    "Expanded 'N.' to 'North'",
    "Standardized apartment number 'apt5b' to '5B'"
  ],
  confidence: 90
};

export const simpleAddressMock: AddressValidationResult = {
  isValid: true,
  isCorrected: false,
  originalAddress: '123 Main St, New York, NY 10001',
  validatedAddress: {
    street: 'Main St',
    number: '123',
    city: 'New York',
    state: 'NY',
    zipCode: '10001',
    country: 'US'
  },
  confidence: 100
};

export const invalidAddressMock: AddressValidationResult = {
  isValid: false,
  isCorrected: false,
  originalAddress: 'invalid address format',
  confidence: 0
};

export const validateAddressMock = jest.fn();

jest.mock('../../src/infra/services/GroqAddressValidationService', () => {
  return {
    GroqAddressValidationService: jest.fn().mockImplementation(() => ({
      validateAddress: validateAddressMock
    }))
  };
});