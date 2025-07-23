import { Router } from 'express';
import { AddressController } from '../../controllers/api/AddressController';
import { ValidateAddressUseCase } from '../../../usecase/ValidateAddressUseCase';
import { AddressValidationService } from '../../../infra/services/AddressValidationService';
import { GroqAddressValidationService } from '../../../infra/services/GroqAddressValidationService';

const router = Router();

const regexService = new AddressValidationService();
const grokService = new GroqAddressValidationService();
const validateAddressUseCase = new ValidateAddressUseCase(regexService, grokService);
const addressController = new AddressController(validateAddressUseCase);

router.post('/validate-address', (req, res) => {
  addressController.exec(req, res);
});

export default router; 