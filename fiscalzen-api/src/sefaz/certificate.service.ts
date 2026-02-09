import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import * as forge from 'node-forge';
import { StorageService } from '../common/storage';
import { CertificateInfoDto } from './dto';

export interface ParsedCertificate {
    certificate: forge.pki.Certificate;
    privateKey: forge.pki.PrivateKey;
    info: CertificateInfoDto;
}

@Injectable()
export class CertificateService {
    private readonly logger = new Logger(CertificateService.name);
    private cachedCertificates: Map<string, ParsedCertificate> = new Map();

    constructor(private readonly storage: StorageService) { }

    /**
     * Parse a .pfx/.p12 certificate buffer and extract metadata
     */
    parseCertificate(pfxBuffer: Buffer, password: string): ParsedCertificate {
        try {
            // Decode the P12/PFX file
            const p12Asn1 = forge.asn1.fromDer(pfxBuffer.toString('binary'));
            const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, password);

            // Extract certificate and private key
            const certBags = p12.getBags({ bagType: forge.pki.oids.certBag });
            const keyBags = p12.getBags({ bagType: forge.pki.oids.pkcs8ShroudedKeyBag });

            const certBag = certBags[forge.pki.oids.certBag];
            const keyBag = keyBags[forge.pki.oids.pkcs8ShroudedKeyBag];

            if (!certBag || certBag.length === 0) {
                throw new BadRequestException('Certificado não encontrado no arquivo .pfx');
            }

            if (!keyBag || keyBag.length === 0) {
                throw new BadRequestException('Chave privada não encontrada no arquivo .pfx');
            }

            const certificate = certBag[0].cert;
            const privateKey = keyBag[0].key;

            if (!certificate || !privateKey) {
                throw new BadRequestException('Falha ao extrair certificado ou chave privada');
            }

            // Extract certificate information
            const info = this.extractCertificateInfo(certificate);

            this.logger.log(`Certificate parsed: ${info.subject}, valid until ${info.validTo}`);

            return { certificate, privateKey, info };
        } catch (error) {
            if (error instanceof BadRequestException) {
                throw error;
            }
            this.logger.error('Failed to parse certificate:', error.message);
            throw new BadRequestException(
                'Falha ao processar certificado. Verifique se a senha está correta.',
            );
        }
    }

    /**
     * Extract human-readable info from a certificate
     */
    private extractCertificateInfo(cert: forge.pki.Certificate): CertificateInfoDto {
        const now = new Date();
        const validFrom = cert.validity.notBefore;
        const validTo = cert.validity.notAfter;
        const isValid = now >= validFrom && now <= validTo;

        // Calculate days until expiry
        const daysUntilExpiry = Math.floor(
            (validTo.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
        );

        // Extract subject fields
        const subjectAttrs = cert.subject.attributes;
        const subject = this.getAttributeValue(subjectAttrs, 'commonName') ||
            this.getAttributeValue(subjectAttrs, 'organizationName') ||
            'Unknown';

        // Extract issuer fields
        const issuerAttrs = cert.issuer.attributes;
        const issuer = this.getAttributeValue(issuerAttrs, 'commonName') ||
            this.getAttributeValue(issuerAttrs, 'organizationName') ||
            'Unknown';

        // Try to extract CNPJ from subject (common in Brazilian certificates)
        const cnpj = this.extractCnpjFromSubject(subjectAttrs);

        // Serial number as hex
        const serialNumber = cert.serialNumber;

        return {
            serialNumber,
            subject,
            issuer,
            validFrom,
            validTo,
            isValid,
            daysUntilExpiry: isValid ? daysUntilExpiry : 0,
            cnpj,
        };
    }

    /**
     * Get attribute value from certificate attributes
     */
    private getAttributeValue(
        attrs: forge.pki.CertificateField[],
        shortName: string,
    ): string | undefined {
        const attr = attrs.find((a) => a.shortName === shortName);
        return attr?.value as string | undefined;
    }

    /**
     * Extract CNPJ from certificate subject (Brazilian e-CNPJ certificates)
     */
    private extractCnpjFromSubject(attrs: forge.pki.CertificateField[]): string | undefined {
        // Brazilian certificates often have CNPJ in CN or serialNumber attribute
        const cn = this.getAttributeValue(attrs, 'commonName') || '';

        // Common patterns: "EMPRESA LTDA:12345678000199" or contains CNPJ in name
        const cnpjMatch = cn.match(/(\d{14})/);
        if (cnpjMatch) {
            return this.formatCnpj(cnpjMatch[1]);
        }

        // Check other possible locations
        const serialNum = this.getAttributeValue(attrs, 'serialNumber');
        if (serialNum) {
            const match = serialNum.match(/(\d{14})/);
            if (match) {
                return this.formatCnpj(match[1]);
            }
        }

        return undefined;
    }

    /**
     * Format CNPJ with punctuation
     */
    private formatCnpj(cnpj: string): string {
        return cnpj.replace(
            /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
            '$1.$2.$3/$4-$5',
        );
    }

    /**
     * Load certificate for a company from Minio storage
     */
    async loadFromStorage(companyId: string, password: string): Promise<ParsedCertificate> {
        const cacheKey = `${companyId}`;

        // Check cache first
        if (this.cachedCertificates.has(cacheKey)) {
            return this.cachedCertificates.get(cacheKey)!;
        }

        const storageKey = `certificates/${companyId}/cert.pfx`;

        // Check if exists in storage
        const exists = await this.storage.exists(storageKey);
        if (!exists) {
            throw new BadRequestException(
                'Certificado não encontrado. Faça o upload do certificado digital.',
            );
        }

        // Download from storage
        const pfxBuffer = await this.storage.download(storageKey);

        // Parse certificate
        const parsed = this.parseCertificate(pfxBuffer, password);

        // Cache it
        this.cachedCertificates.set(cacheKey, parsed);

        return parsed;
    }

    /**
     * Upload and validate a certificate for a company
     */
    async uploadAndValidate(
        companyId: string,
        pfxBuffer: Buffer,
        password: string,
    ): Promise<{ info: CertificateInfoDto; storageKey: string }> {
        // First, try to parse to validate
        const parsed = this.parseCertificate(pfxBuffer, password);

        // Check if expired
        if (!parsed.info.isValid) {
            throw new BadRequestException('Certificado expirado. Por favor, envie um certificado válido.');
        }

        // Store in Minio
        const storageKey = `certificates/${companyId}/cert.pfx`;
        await this.storage.upload(storageKey, pfxBuffer, 'application/x-pkcs12');

        // Clear cache for this company
        this.cachedCertificates.delete(companyId);

        this.logger.log(`Certificate uploaded for company ${companyId}`);

        return {
            info: parsed.info,
            storageKey,
        };
    }

    /**
     * Get cached certificate info without password (for display)
     */
    getCachedInfo(companyId: string): CertificateInfoDto | null {
        const cached = this.cachedCertificates.get(companyId);
        return cached?.info || null;
    }

    /**
     * Clear certificate cache for a company
     */
    clearCache(companyId: string): void {
        this.cachedCertificates.delete(companyId);
    }

    /**
     * Get certificate password from environment (for now)
     * TODO: Store encrypted password per company
     */
    getPassword(): string {
        return process.env.CERT_PASSWORD || '';
    }
}
