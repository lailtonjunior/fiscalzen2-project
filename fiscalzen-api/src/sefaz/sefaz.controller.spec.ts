import { Test, TestingModule } from '@nestjs/testing';
import { SefazController } from './sefaz.controller';

describe('SefazController', () => {
  let controller: SefazController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SefazController],
    }).compile();

    controller = module.get<SefazController>(SefazController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
