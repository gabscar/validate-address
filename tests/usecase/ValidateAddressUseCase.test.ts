import { AddressValidationService } from '../../src/infra/services/AddressValidationService';
import { GroqAddressValidationService } from '../../src/infra/services/GroqAddressValidationService';
import { ValidateAddressUseCase } from '../../src/usecase/ValidateAddressUseCase';
import { addressMock, simpleAddressMock, invalidAddressMock } from '../mock/address';

Object.defineProperty(process, 'env', {
  value: {
    GROQ_API_KEY: 'test_groq_api_key',
    GROQ_API_URL: 'https://api.groq.com/openai/v1/chat/completions'
  },
  writable: true
});

jest.mock('../../src/infra/services/AddressValidationService');
jest.mock('../../src/infra/services/GroqAddressValidationService');

describe('ValidateAddressUseCase', () => {
  let validateAddressUseCase: ValidateAddressUseCase;
  let mockRegexService: jest.Mocked<AddressValidationService>;
  let mockGroqService: jest.Mocked<GroqAddressValidationService>;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockRegexService = new AddressValidationService() as jest.Mocked<AddressValidationService>;
    mockGroqService = new GroqAddressValidationService() as jest.Mocked<GroqAddressValidationService>;
    
    validateAddressUseCase = new ValidateAddressUseCase(mockRegexService, mockGroqService);
  });

  describe('Basic Address Validation', () => {
    it('should validate a correct US address', async () => {
      mockRegexService.validateAddress = jest.fn().mockResolvedValue(simpleAddressMock);

      const request = { address: '123 Main St, New York, NY 10001' };
      const result = await validateAddressUseCase.execute(request);

      expect(mockRegexService.validateAddress).toHaveBeenCalledWith(request);
      expect(result.isValid).toBe(true);
      expect(result.validationMethod).toBe('regex');
      expect(result.validatedAddress).toBeDefined();
      expect(result.validatedAddress?.street).toBe('Main St');
      expect(result.validatedAddress?.number).toBe('123');
      expect(result.validatedAddress?.city).toBe('New York');
      expect(result.validatedAddress?.state).toBe('NY');
      expect(result.validatedAddress?.zipCode).toBe('10001');
    });

    it('should handle invalid address format', async () => {
      mockRegexService.validateAddress = jest.fn().mockResolvedValue(invalidAddressMock);
      mockGroqService.validateAddress = jest.fn().mockResolvedValue(invalidAddressMock);

      const request = { address: 'invalid address' };
      const result = await validateAddressUseCase.execute(request);

      expect(mockRegexService.validateAddress).toHaveBeenCalledWith(request);
      expect(result.isValid).toBe(false);
      expect(result.validationMethod).toBe('failed');
      expect(result.validatedAddress).toBeUndefined();
    });

    it('should handle empty address', async () => {
      mockRegexService.validateAddress = jest.fn().mockResolvedValue(invalidAddressMock);
      mockGroqService.validateAddress = jest.fn().mockResolvedValue(invalidAddressMock);

      const request = { address: '' };
      const result = await validateAddressUseCase.execute(request);

      expect(mockRegexService.validateAddress).toHaveBeenCalledWith(request);
      expect(result.isValid).toBe(false);
      expect(result.validationMethod).toBe('failed');
    });
  });

  describe('Fallback Strategy', () => {
    it('should use regex for simple valid addresses', async () => {
      mockRegexService.validateAddress = jest.fn().mockResolvedValue(simpleAddressMock);

      const request = { address: '123 Main St, New York, NY 10001' };
      const result = await validateAddressUseCase.execute(request);

      expect(mockRegexService.validateAddress).toHaveBeenCalledWith(request);
      expect(result.isValid).toBe(true);
      expect(result.validationMethod).toBe('regex');
      expect(result.validatedAddress).toBeDefined();
      expect(result.validatedAddress?.street).toBe('Main St');
      expect(result.validatedAddress?.number).toBe('123');
    });

    it('should use Groq for complex addresses with abbreviations', async () => {
      mockRegexService.validateAddress = jest.fn().mockResolvedValue({
        isValid: false,
        isCorrected: false,
        originalAddress: 'apt 5b, 123 n. main st, new york ny 10001',
        confidence: 0
      });
      
      mockGroqService.validateAddress = jest.fn().mockResolvedValue(addressMock);

      const request = { address: 'apt 5b, 123 n. main st, new york ny 10001' };
      const result = await validateAddressUseCase.execute(request);

      expect(mockRegexService.validateAddress).toHaveBeenCalledWith(request);
      expect(mockGroqService.validateAddress).toHaveBeenCalledWith(request);
      expect(result.isValid).toBe(true);
      expect(result.validationMethod).toBe('grok');
      expect(result.validatedAddress?.street).toBe('North Main Street');
      expect(result.validatedAddress?.number).toBe('123');
      expect(result.isCorrected).toBe(true);
      expect(result.corrections).toBeDefined();
      expect(result.corrections).toHaveLength(3);
    });

    it('should handle invalid addresses gracefully', async () => {
      mockRegexService.validateAddress = jest.fn().mockResolvedValue(invalidAddressMock);
      mockGroqService.validateAddress = jest.fn().mockResolvedValue(invalidAddressMock);

      const request = { address: 'invalid address format' };
      const result = await validateAddressUseCase.execute(request);

      expect(mockRegexService.validateAddress).toHaveBeenCalledWith(request);
      expect(result.isValid).toBe(false);
      expect(result.validationMethod).toBe('failed');
      expect(result.confidence).toBe(0);
    });
  });

  describe('Error Handling', () => {
    it('should handle regex service errors', async () => {
      mockRegexService.validateAddress = jest.fn().mockRejectedValue(new Error('Regex service error'));
      mockGroqService.validateAddress = jest.fn().mockResolvedValue(simpleAddressMock);

      const request = { address: '123 Main St, New York, NY 10001' };
      const result = await validateAddressUseCase.execute(request);

      expect(mockRegexService.validateAddress).toHaveBeenCalledWith(request);
      expect(mockGroqService.validateAddress).toHaveBeenCalledWith(request);
      expect(result.isValid).toBe(true);
      expect(result.validationMethod).toBe('grok');
    });

    it('should handle both services failing', async () => {
      mockRegexService.validateAddress = jest.fn().mockRejectedValue(new Error('Regex service error'));
      mockGroqService.validateAddress = jest.fn().mockRejectedValue(new Error('Groq service error'));

      const request = { address: '123 Main St, New York, NY 10001' };
      const result = await validateAddressUseCase.execute(request);

      expect(mockRegexService.validateAddress).toHaveBeenCalledWith(request);
      expect(result.isValid).toBe(false);
      expect(result.validationMethod).toBe('failed');
      expect(result.confidence).toBe(0);
    });
  });
}); 