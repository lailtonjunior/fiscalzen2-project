import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt', () => ({
  compare: jest.fn().mockResolvedValue(true),
  hash: jest.fn().mockResolvedValue('hashed'),
}));

const mockUsersService = {
  findOne: jest.fn(),
  create: jest.fn(),
};

const mockJwtService = {
  sign: jest.fn(() => 'mockToken'),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return user data if validation succeeds of user found and password matches', async () => {
      const mockUser = { id: 1, email: 'test@test.com', senhaHash: 'hashedPass' };
      mockUsersService.findOne.mockResolvedValue(mockUser);

      const result = await service.validateUser('test@test.com', 'pass');
      expect(result).toEqual({ id: 1, email: 'test@test.com' });
    });

    it('should return null if user not found', async () => {
      mockUsersService.findOne.mockResolvedValue(null);
      const result = await service.validateUser('test@test.com', 'pass');
      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('should return access_token', async () => {
      const result = await service.login({ email: 'test@test.com', id: 1 });
      expect(result).toHaveProperty('access_token', 'mockToken');
    });
  });
});
