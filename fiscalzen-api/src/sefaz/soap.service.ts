import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosError } from 'axios';
import * as https from 'https';
import * as forge from 'node-forge';
import { CertificateService, ParsedCertificate } from './certificate.service';

interface SoapResponse {
    status: number;
    data: string;
    error?: string;
}

@Injectable()
export class SoapService {
    private readonly logger = new Logger(SoapService.name);

    constructor(private readonly certificateService: CertificateService) { }

    /**
     * Create HTTPS agent with certificate for mTLS
     */
    private createHttpsAgent(parsed: ParsedCertificate, password: string): https.Agent {
        // Convert certificate and key to PEM format
        const certPem = forge.pki.certificateToPem(parsed.certificate);
        const keyPem = forge.pki.privateKeyToPem(parsed.privateKey);

        return new https.Agent({
            cert: certPem,
            key: keyPem,
            rejectUnauthorized: false, // SEFAZ chains often not in root store
            minVersion: 'TLSv1.2',
        });
    }

    /**
     * Send status check request to SEFAZ
     */
    async sendStatusCheck(
        xmlBody: string,
        companyId: string,
        password?: string,
    ): Promise<SoapResponse> {
        const certPassword = password || this.certificateService.getPassword();
        const parsed = await this.certificateService.loadFromStorage(companyId, certPassword);
        const agent = this.createHttpsAgent(parsed, certPassword);

        // URL SVRS Homologacao (Status Servico)
        // Correct RS URL: nfe-homologacao.sefazrs.rs.gov.br
        const url = 'https://nfe-homologacao.sefazrs.rs.gov.br/ws/NfeStatusServico/NfeStatusServico4.asmx';
        const action = 'http://www.portalfiscal.inf.br/nfe/wsdl/NfeStatusServico4/nfeStatusServicoNF';

        return this.sendSoapRequest(url, xmlBody, agent, action);
    }

    /**
     * Send NFe authorization request to SEFAZ
     */
    async sendNFeAutorizacao(
        xmlBody: string,
        companyId: string,
        production = false,
    ): Promise<SoapResponse> {
        const password = this.certificateService.getPassword();
        const parsed = await this.certificateService.loadFromStorage(companyId, password);
        const agent = this.createHttpsAgent(parsed, password);

        // URL based on environment
        const url = production
            ? 'https://nfe.svrs.rs.gov.br/ws/NfeAutorizacao/NFeAutorizacao4.asmx'
            : 'https://nfe-homologacao.svrs.rs.gov.br/ws/NfeAutorizacao/NFeAutorizacao4.asmx';

        const action = 'http://www.portalfiscal.inf.br/nfe/wsdl/NFeAutorizacao4/nfeAutorizacaoLote';

        return this.sendSoapRequest(url, xmlBody, agent, action);
    }

    /**
     * Consult authorization receipt
     */
    async consultarRecibo(
        xmlBody: string,
        companyId: string,
        production = false,
    ): Promise<SoapResponse> {
        const password = this.certificateService.getPassword();
        const parsed = await this.certificateService.loadFromStorage(companyId, password);
        const agent = this.createHttpsAgent(parsed, password);

        const url = production
            ? 'https://nfe.sefazrs.rs.gov.br/ws/NfeRetAutorizacao/NFeRetAutorizacao4.asmx'
            : 'https://nfe-homologacao.sefazrs.rs.gov.br/ws/NfeRetAutorizacao/NFeRetAutorizacao4.asmx';

        const action = 'http://www.portalfiscal.inf.br/nfe/wsdl/NFeRetAutorizacao4/nfeRetAutorizacaoLote';

        return this.sendSoapRequest(url, xmlBody, agent, action);
    }

    /**
     * Generic SOAP request sender
     */
    public async sendSoapRequest(
        url: string,
        xmlBody: string,
        agent: https.Agent,
        action: string,
    ): Promise<SoapResponse> {
        try {
            this.logger.log(`[SOAP] Sending request to ${url}`);
            this.logger.debug(`[SOAP] Action: ${action}`);

            const response = await axios.post(url, xmlBody, {
                headers: {
                    'Content-Type': `application/soap+xml; charset=utf-8; action="${action}"`,
                },
                httpsAgent: agent,
                timeout: 30000, // 30 second timeout
            });

            this.logger.log(`[SOAP] Response Status: ${response.status}`);
            this.logger.debug(`[SOAP] Response Data: ${response.data}`);

            return {
                status: response.status,
                data: response.data,
            };
        } catch (error) {
            const axiosError = error as AxiosError;
            this.logger.error(`SOAP Error: ${axiosError.message}`);

            if (axiosError.response) {
                return {
                    status: axiosError.response.status,
                    data: axiosError.response.data as string,
                    error: axiosError.message,
                };
            }

            throw error;
        }
    }
}
