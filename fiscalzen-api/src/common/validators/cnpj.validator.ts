import {
    registerDecorator,
    ValidationOptions,
    ValidatorConstraint,
    ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'isCnpj', async: false })
export class IsCnpjConstraint implements ValidatorConstraintInterface {
    validate(value: any): boolean {
        if (typeof value !== 'string') return false;

        const cnpj = value.replace(/\D/g, '');
        if (cnpj.length !== 14) return false;

        // Reject all-same digits
        if (/^(\d)\1{13}$/.test(cnpj)) return false;

        // First check digit
        const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
        let sum = 0;
        for (let i = 0; i < 12; i++) {
            sum += parseInt(cnpj[i]) * weights1[i];
        }
        let remainder = sum % 11;
        const digit1 = remainder < 2 ? 0 : 11 - remainder;
        if (parseInt(cnpj[12]) !== digit1) return false;

        // Second check digit
        const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
        sum = 0;
        for (let i = 0; i < 13; i++) {
            sum += parseInt(cnpj[i]) * weights2[i];
        }
        remainder = sum % 11;
        const digit2 = remainder < 2 ? 0 : 11 - remainder;
        if (parseInt(cnpj[13]) !== digit2) return false;

        return true;
    }

    defaultMessage(): string {
        return 'CNPJ inválido. Forneça um CNPJ com 14 dígitos e dígitos verificadores corretos.';
    }
}

export function IsCnpj(validationOptions?: ValidationOptions) {
    return function (object: object, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName,
            options: validationOptions,
            constraints: [],
            validator: IsCnpjConstraint,
        });
    };
}
