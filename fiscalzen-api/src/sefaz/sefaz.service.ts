import { Injectable, Logger } from '@nestjs/common';
import { XmlFactoryService } from './xml-factory.service';
import { PrismaService } from '../prisma/prisma.service';
import { SoapService } from './soap.service';
import { CertificateService } from './certificate.service';
import { CertificateInfoDto } from './dto';

export interface StatusCheckResult {
    success: boolean;
    httpStatus?: number;
    responseXml?: string;
    error?: string;
}

@Injectable()
export class SefazService {
    private readonly logger = new Logger(SefazService.name);

    constructor(
        private readonly xmlFactory: XmlFactoryService,
        private readonly soapService: SoapService,
        private readonly certificateService: CertificateService,
        private readonly prisma: PrismaService,
    ) { }

    /**
     * Check SEFAZ service status
     */
    async checkStatus(uf: string, companyId?: string): Promise<StatusCheckResult> {
        try {
            // 1. Generate XML
            const innerXml = this.xmlFactory.createStatusCheckXml(uf, '2'); // 2 = Homologacao

            // 2. Wrap in Envelope
            const soapEnvelope = this.xmlFactory.wrapInSoapEnvelope(innerXml);

            let certPassword = '';
            if (companyId) {
                const company = await this.prisma.empresa.findUnique({ where: { id: companyId } });
                certPassword = (company as any)?.certPassword || process.env.CERT_PASSWORD || '';
            }

            // MOCK MODE Check 
            // If no companyId, or if we are in dev AND don't have a specific cert password (optional logic)
            // For now, let's try real if companyId is present.
            if (!companyId) {
                return {
                    success: true,
                    httpStatus: 200,
                    responseXml: '<mock>Sefaz Status OK (Mock - No Company)</mock>',
                };
            }

            // 3. Send
            // We pass the password to soapService (which we will update next)
            const response = await this.soapService.sendStatusCheck(soapEnvelope, companyId, certPassword);

            return {
                success: true,
                httpStatus: response.status,
                responseXml: response.data,
            };
        } catch (error) {
            this.logger.error(`Status check failed for company ${companyId}`);
            try {
                this.logger.error(`Error details: ${JSON.stringify(error, Object.getOwnPropertyNames(error))}`);
            } catch (e) {
                this.logger.error(`Could not stringify error: ${error}`);
            }

            return {
                success: false,
                error: (error as any).message || 'Erro desconhecido ao consultar Sefaz',
            };
        }
    }

    /**
     * Validate and get certificate info for a company
     */
    async getCertificateInfo(
        companyId: string,
    ): Promise<CertificateInfoDto | null> {
        try {
            const password = this.certificateService.getPassword();
            const parsed = await this.certificateService.loadFromStorage(companyId, password);
            return parsed.info;
        } catch {
            return null;
        }
    }

    /**
     * Upload and validate certificate
     */
    async uploadCertificate(
        companyId: string,
        pfxBuffer: Buffer,
        password: string,
    ) {
        return this.certificateService.uploadAndValidate(companyId, pfxBuffer, password);
    }
}
