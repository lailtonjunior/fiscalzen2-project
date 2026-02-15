import * as https from 'https';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import * as forge from 'node-forge';

async function testConnection() {
    console.log('--- Teste de Conexão SEFAZ Isolado ---');

    // 1. Configurações
    // Note: Correct RS URL found: nfe-homologacao.sefazrs.rs.gov.br
    const url = 'https://nfe-homologacao.sefazrs.rs.gov.br/ws/NfeStatusServico/NfeStatusServico4.asmx';
    const action = 'http://www.portalfiscal.inf.br/nfe/wsdl/NfeStatusServico4/nfeStatusServicoNF';

    // Substitua pelo caminho do seu arquivo .pfx manualmente se necessário para teste local
    // Exemplo: const pfxPath = './meu-certificado.pfx';
    const pfxPath = process.argv[2];
    const password = process.argv[3];

    if (!pfxPath || !password) {
        console.error('Uso: npx ts-node scripts/test-sefaz-connection.ts <caminho-pfx> <senha>');
        process.exit(1);
    }

    console.log(`Carregando certificado: ${pfxPath}`);

    try {
        const pfxBuffer = fs.readFileSync(pfxPath);

        // 2. Parse Certificado
        console.log('Parseando PFX...');
        const p12Asn1 = forge.asn1.fromDer(pfxBuffer.toString('binary'));
        const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, password);

        const certBags = p12.getBags({ bagType: forge.pki.oids.certBag });
        const keyBags = p12.getBags({ bagType: forge.pki.oids.pkcs8ShroudedKeyBag });

        const certBag = certBags[forge.pki.oids.certBag]?.[0];
        const keyBag = keyBags[forge.pki.oids.pkcs8ShroudedKeyBag]?.[0];

        if (!certBag || !keyBag) {
            throw new Error('Certificado ou chave privada não encontrados no PFX');
        }

        const certPem = forge.pki.certificateToPem(certBag.cert!);
        const keyPem = forge.pki.privateKeyToPem(keyBag.key!);

        console.log('Certificado extraído com sucesso.');

        // 3. Configurar Agente HTTPS
        const agent = new https.Agent({
            cert: certPem,
            key: keyPem,
            rejectUnauthorized: false,
            minVersion: 'TLSv1.2',
        });

        // 4. Criar XML Body (Minificado, sem espaços entre tags)
        const xmlBody = `<?xml version="1.0" encoding="utf-8"?><soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope"><soap12:Body><nfeDadosMsg xmlns="http://www.portalfiscal.inf.br/nfe/wsdl/NFeStatusServico4"><consStatServ xmlns="http://www.portalfiscal.inf.br/nfe" versao="4.00"><tpAmb>2</tpAmb><cUF>43</cUF><xServ>STATUS</xServ></consStatServ></nfeDadosMsg></soap12:Body></soap12:Envelope>`;

        console.log(`Enviando requisição para: ${url}`);
        console.log(`Action: ${action}`);

        const response = await axios.post(url, xmlBody, {
            headers: {
                'Content-Type': `application/soap+xml; charset=utf-8; action="${action}"`,
            },
            httpsAgent: agent,
            timeout: 30000,
        });

        console.log('--- RESPOSTA RECEBIDA ---');
        console.log(`Status: ${response.status}`);
        console.log('Data:');
        console.log(response.data);
        console.log('-------------------------');

    } catch (error: any) {
        console.error('--- ERRO ---');
        if (axios.isAxiosError(error)) {
            console.error(`Status: ${error.response?.status}`);
            console.error(`Data: ${error.response?.data}`);
            console.error(`Mensagem: ${error.message}`);
        } else {
            console.error(error);
        }
    }
}

testConnection();
