import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

const mockAuthService = {
  validateUser: jest.fn(),
  login: jest.fn(),
  register: jest.fn(),
};

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should return token on successful login', async () => {
      const loginDto = { email: 'test@test.com', password: 'password' };
      const result = { access_token: 'token', user: { email: 'test@test.com' } };

      mockAuthService.validateUser.mockResolvedValue({ email: 'test@test.com' });
      mockAuthService.login.mockResolvedValue(result);

      expect(await controller.login(loginDto)).toEqual(result);
    });
  });

  describe('register', () => {
    it('should register a new user', async () => {
      const registerDto = { name: 'Test', email: 'test@test.com', password: 'pass', companyName: 'Comp' };
      const result = { access_token: 'token', user: registerDto };

      mockAuthService.register.mockResolvedValue(result);

      expect(await controller.register(registerDto)).toEqual(result);
    });
  });
});
