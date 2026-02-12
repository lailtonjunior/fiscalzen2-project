import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { PrismaService } from '../prisma/prisma.service';
import { Reflector } from '@nestjs/core';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            findById: jest.fn(),
            findByCompany: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            deactivate: jest.fn(),
          },
        },
        {
          provide: PrismaService,
          useValue: {
            user: {
              findMany: jest.fn(),
              findUnique: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
        Reflector,
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
