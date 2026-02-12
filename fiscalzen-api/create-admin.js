
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
    const email = 'admin@fiscalzen.com.br';
    const password = 'admin123';
    const hashedPassword = await bcrypt.hash(password, 10);

    // 1. Criar empresa com dados mínimos
    const empresa = await prisma.empresa.upsert({
        where: { cnpj: '12345678000199' },
        update: {},
        create: {
            razaoSocial: 'FiscalZen Demo Ltda',
            cnpj: '12345678000199',
            ambienteSefaz: 'homologacao'
        }
    });

    console.log('Empresa criada/encontrada:', empresa.id);

    // 2. Criar usuário vinculado
    const user = await prisma.usuario.upsert({
        where: { email },
        update: {
            senhaHash: hashedPassword // Atualiza senha se já existir
        },
        create: {
            email,
            nome: 'Admin FiscalZen',
            senhaHash: hashedPassword,
            perfil: 'admin',
            empresaId: empresa.id
        },
    });

    console.log('Usuário admin criado:', user);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
