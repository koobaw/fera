import { Test, TestingModule } from '@nestjs/testing';
import { CheckoutCommonValidation } from './checkout-common-validation';

describe('CheckoutCommonValidationService', () => {
  let service: CheckoutCommonValidation;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CheckoutCommonValidation],
    }).compile();

    service = module.get<CheckoutCommonValidation>(CheckoutCommonValidation);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
