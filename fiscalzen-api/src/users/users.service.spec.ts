import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';

const mockPrismaService = {
  usuario: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
};

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOne', () => {
    it('should find user by email', async () => {
      const email = 'test@test.com';
      const user = { id: '1', email };
      mockPrismaService.usuario.findUnique.mockResolvedValue(user);

      expect(await service.findOne(email)).toEqual(user);
      expect(mockPrismaService.usuario.findUnique).toHaveBeenCalledWith({ where: { email } });
    });
  });
});
