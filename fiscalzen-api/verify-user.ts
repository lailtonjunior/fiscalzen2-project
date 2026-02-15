import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
    console.log('Verifying user...')

    const email = 'admin@fiscalzen.com.br'
    const user = await prisma.usuario.findUnique({
        where: { email },
        include: { empresa: true }
    })

    if (!user) {
        console.error(`User ${email} NOT FOUND!`)
        console.log('Please run the seed script: npx ts-node prisma/seed.ts')
        return
    }

    console.log(`User found: ${user.nome} (${user.email})`)
    console.log(`Company: ${user.empresa?.razaoSocial}`)
    console.log(`Role: ${user.perfil}`)
    console.log(`Active: ${user.ativo}`)

    // Verify password '123456'
    const isMatch = await bcrypt.compare('123456', user.senhaHash)
    console.log(`Password '123456' match: ${isMatch}`)

    if (!isMatch) {
        console.log('Resetting password to 123456...')
        const newHash = await bcrypt.hash('123456', 10)
        await prisma.usuario.update({
            where: { email },
            data: { senhaHash: newHash }
        })
        console.log('Password reset successfully.')
    }
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
