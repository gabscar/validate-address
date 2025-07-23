import { Request, Response } from 'express';
import { ValidateAddressUseCase } from '../../../usecase/ValidateAddressUseCase';
import { BaseController } from '../BaseController';
import { RequestValidator } from '../../validators/baseValidator';
import { addressValidationSchema } from '../../validators/address/addressValidator';

export class AddressController extends BaseController {
  constructor(private validateAddressUseCase: ValidateAddressUseCase) {
    super();
    this.validateAddressUseCase = validateAddressUseCase;
  }

  async executeRoute(req: Request, res: Response): Promise<void> {

    const validatedData = RequestValidator.validate(addressValidationSchema, req.body);

    const result = await this.validateAddressUseCase.execute(validatedData);

    res.status(200).json({
      success: true,
      data: result
    });
  }
} 