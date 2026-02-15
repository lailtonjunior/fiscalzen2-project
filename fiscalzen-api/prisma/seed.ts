import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
    console.log('Seeding database...')

    // 1. Create or update Company
    const empresa = await prisma.empresa.upsert({
        where: { cnpj: '12345678000199' },
        update: {},
        create: {
            cnpj: '12345678000199',
            razaoSocial: 'FiscalZen Demo Ltda',
            nomeFantasia: 'FiscalZen',
            logradouro: 'Av. Paulista',
            numero: '1000',
            bairro: 'Bela Vista',
            cidade: 'São Paulo',
            estado: 'SP',
            cep: '01310-100',
            ambienteSefaz: 'homologacao'
        }
    })

    console.log('Company created:', empresa.razaoSocial)

    // 2. Create or update Admin User
    const password = await bcrypt.hash('123456', 10)

    const user = await prisma.usuario.upsert({
        where: { email: 'admin@fiscalzen.com.br' },
        update: {
            senhaHash: password // Update password if user exists
        },
        create: {
            email: 'admin@fiscalzen.com.br',
            nome: 'Administrador',
            senhaHash: password,
            cargo: 'CEO',
            perfil: 'admin',
            empresaId: empresa.id
        }
    })

    console.log('User created:', user.email)
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
