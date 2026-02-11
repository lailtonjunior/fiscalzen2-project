import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Prisma } from '@prisma/client';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
    ) { }

    async validateUser(email: string, pass: string): Promise<any> {
        const user = await this.usersService.findOne(email);
        if (user && (await bcrypt.compare(pass, user.senhaHash))) {
            const { senhaHash, ...result } = user;
            return result;
        }
        return null;
    }

    async login(user: any) {
        const payload = { email: user.email, sub: user.id, empresaId: user.empresaId };
        return {
            access_token: this.jwtService.sign(payload),
            user: user,
        };
    }

    async getProfile(userId: string) {
        const user = await this.usersService.findById(userId);
        if (!user) {
            throw new UnauthorizedException('Usuário não encontrado');
        }
        const { senhaHash, ...result } = user;
        return result;
    }

    async register(data: RegisterDto) {
        // Check if user exists
        const existingUser = await this.usersService.findOne(data.email);
        if (existingUser) {
            throw new BadRequestException('User already exists');
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(data.password, 10);

        // Prepare user data
        // Assuming data includes company info or we create a dummy one for now if needed.
        // For MVF as per plan: "Create both a Company (simplified) and a User"
        // So we expect data to have companyName, etc.

        // We will create the user AND the company transactionally using UsersService or Prisma directly via UsersService.
        // UsersService.create takes Prisma.UsuarioCreateInput which allows nested create.

        // Simple default for company if not provided (though FE should provide)
        const companyData = {
            cnpj: data.cnpj || `GENERATED-${Date.now()}`, // Temporary fallback
            razaoSocial: data.companyName || 'Minha Empresa',
            // other required fields? 'ambienteSefaz' has default.
        };

        const userData: Prisma.UsuarioCreateInput = {
            email: data.email,
            senhaHash: hashedPassword,
            nome: data.name,
            empresa: {
                create: companyData
            }
        };

        const newUser = await this.usersService.createWithPrismaInput(userData);
        const { senhaHash, ...result } = newUser;
        return this.login(result); // Auto login after register
    }
}
