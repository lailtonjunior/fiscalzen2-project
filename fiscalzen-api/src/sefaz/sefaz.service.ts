import { Injectable, Logger } from '@nestjs/common';
import { XmlFactoryService } from './xml-factory.service';
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

            // MOCK MODE Check - if no companyId or in dev without cert
            if (!companyId || process.env.NODE_ENV !== 'production') {
                return {
                    success: true,
                    httpStatus: 200,
                    responseXml: '<mock>Sefaz Status OK (Mock)</mock>',
                };
            }

            // 3. Send
            const response = await this.soapService.sendStatusCheck(soapEnvelope, companyId);

            return {
                success: true,
                httpStatus: response.status,
                responseXml: response.data,
            };
        } catch (error) {
            this.logger.error('Status check failed:', error.message);
            return {
                success: false,
                error: error.message,
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
