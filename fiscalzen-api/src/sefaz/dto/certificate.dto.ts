import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CertificateInfoDto {
    @ApiProperty({ description: 'Certificate serial number' })
    serialNumber: string;

    @ApiProperty({ description: 'Certificate subject (company name)' })
    subject: string;

    @ApiProperty({ description: 'Certificate issuer (CA name)' })
    issuer: string;

    @ApiProperty({ description: 'Certificate validity start date' })
    validFrom: Date;

    @ApiProperty({ description: 'Certificate expiry date' })
    validTo: Date;

    @ApiProperty({ description: 'Whether certificate is currently valid' })
    isValid: boolean;

    @ApiPropertyOptional({ description: 'Days until expiration' })
    daysUntilExpiry?: number;

    @ApiPropertyOptional({ description: 'CNPJ extracted from certificate' })
    cnpj?: string;
}

export class CertificateUploadResponseDto {
    @ApiProperty()
    success: boolean;

    @ApiProperty()
    message: string;

    @ApiPropertyOptional()
    info?: CertificateInfoDto;

    @ApiPropertyOptional()
    storageKey?: string;
}
