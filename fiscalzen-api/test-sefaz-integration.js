/**
 * SEFAZ Homologação Integration Test V3
 * Uses PEM conversion from node-forge for HTTPS mTLS
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const crypto = require('crypto');
const forge = require('node-forge');
const { create } = require('xmlbuilder2');

// Format datetime for Brazil timezone (UTC-3) in NFe format
function formatBrazilDateTime(date) {
    // Get Brazil time (UTC-3 hours)
    const brazilOffset = -3 * 60 * 60 * 1000; // -3 hours in milliseconds
    const brazilTime = new Date(date.getTime() + brazilOffset);

    // Format as YYYY-MM-DDTHH:MM:SS-03:00 (without milliseconds)
    const year = brazilTime.getUTCFullYear();
    const month = String(brazilTime.getUTCMonth() + 1).padStart(2, '0');
    const day = String(brazilTime.getUTCDate()).padStart(2, '0');
    const hours = String(brazilTime.getUTCHours()).padStart(2, '0');
    const minutes = String(brazilTime.getUTCMinutes()).padStart(2, '0');
    const seconds = String(brazilTime.getUTCSeconds()).padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}-03:00`;
}

// Configuration
const CERT_PATH = path.join(__dirname, 'certificates', '4d512601195ecd62.pfx');
const CERT_PASSWORD = process.env.CERT_PASSWORD || '';

// Disable SSL verification for SEFAZ homologação
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// SEFAZ RS Homologação endpoints
const SEFAZ_ENDPOINTS = {
    RS: {
        autorizacao: 'https://nfe-homologacao.sefazrs.rs.gov.br/ws/NfeAutorizacao/NFeAutorizacao4.asmx',
    }
};


function log(msg, data = null) {
    console.log(`[${new Date().toISOString()}] ${msg}`);
    if (data) console.log(JSON.stringify(data, null, 2));
}

function loadCertificateAsPem(pfxPath, password) {
    log(`Loading certificate from ${pfxPath}`);

    const pfxBuffer = fs.readFileSync(pfxPath);
    const pfxAsn1 = forge.asn1.fromDer(pfxBuffer.toString('binary'));
    const pfx = forge.pkcs12.pkcs12FromAsn1(pfxAsn1, password);

    // Extract all certificates and keys
    const certBags = pfx.getBags({ bagType: forge.pki.oids.certBag });
    const keyBags = pfx.getBags({ bagType: forge.pki.oids.pkcs8ShroudedKeyBag });

    const allCerts = certBags[forge.pki.oids.certBag];
    const keyBag = keyBags[forge.pki.oids.pkcs8ShroudedKeyBag][0];

    if (!allCerts || allCerts.length === 0 || !keyBag) {
        throw new Error('Could not extract certificate or private key from PFX');
    }

    // Get the first certificate (end-entity) and private key
    const cert = allCerts[0].cert;
    const privateKey = keyBag.key;

    // Convert to PEM format for Node.js https
    const certPem = forge.pki.certificateToPem(cert);
    const keyPem = forge.pki.privateKeyToPem(privateKey);

    // Build CA chain (all certs except the first one)
    const caPems = [];
    for (let i = 1; i < allCerts.length; i++) {
        caPems.push(forge.pki.certificateToPem(allCerts[i].cert));
    }

    const subject = cert.subject.attributes.reduce((acc, attr) => {
        acc[attr.shortName] = attr.value;
        return acc;
    }, {});

    log('Certificate loaded and converted to PEM', {
        subject: subject.CN || subject.O,
        validFrom: cert.validity.notBefore,
        validTo: cert.validity.notAfter,
        serialNumber: cert.serialNumber,
        chainLength: allCerts.length,
    });

    return { cert, privateKey, subject, certPem, keyPem, caPems };
}

function calculateMod11(base) {
    let sum = 0;
    let weight = 2;

    for (let i = base.length - 1; i >= 0; i--) {
        sum += parseInt(base[i]) * weight;
        weight = weight >= 9 ? 2 : weight + 1;
    }

    const remainder = sum % 11;
    const digit = 11 - remainder;

    return digit >= 10 ? '0' : digit.toString();
}

function generateChaveAcesso(cUF, aamm, cnpj, mod, serie, nNF, tpEmis, cNF) {
    const base = `${cUF}${aamm}${cnpj.replace(/\D/g, '').padStart(14, '0')}` +
        `${mod}${serie.padStart(3, '0')}${nNF.padStart(9, '0')}` +
        `${tpEmis}${cNF.padStart(8, '0')}`;

    const dv = calculateMod11(base);
    return base + dv;
}

function buildNFeXml(data, chaveAcesso) {
    const now = new Date();
    const ide = data.ide;
    const emit = data.emit;
    const prod = data.produtos[0];

    const doc = create()
        .ele('NFe', { xmlns: 'http://www.portalfiscal.inf.br/nfe' })
        .ele('infNFe', { versao: '4.00', Id: `NFe${chaveAcesso}` })
        .ele('ide')
        .ele('cUF').txt(ide.cUF).up()
        .ele('cNF').txt(chaveAcesso.substring(35, 43)).up()
        .ele('natOp').txt(ide.natOp).up()
        .ele('mod').txt('55').up()
        .ele('serie').txt(ide.serie).up()
        .ele('nNF').txt(ide.nNF).up()
        .ele('dhEmi').txt(formatBrazilDateTime(now)).up()
        .ele('tpNF').txt('1').up()
        .ele('idDest').txt('1').up()
        .ele('cMunFG').txt(ide.cMunFG).up()
        .ele('tpImp').txt('1').up()
        .ele('tpEmis').txt('1').up()
        .ele('cDV').txt(chaveAcesso.slice(-1)).up()
        .ele('tpAmb').txt('2').up()
        .ele('finNFe').txt('1').up()
        .ele('indFinal').txt('1').up()
        .ele('indPres').txt('1').up()
        .ele('procEmi').txt('0').up()
        .ele('verProc').txt('FiscalZen 1.0').up()
        .up()
        .ele('emit')
        .ele('CNPJ').txt(emit.cnpj.replace(/\D/g, '')).up()
        .ele('xNome').txt(emit.razaoSocial).up()
        .ele('enderEmit')
        .ele('xLgr').txt(emit.logradouro).up()
        .ele('nro').txt(emit.numero).up()
        .ele('xBairro').txt(emit.bairro).up()
        .ele('cMun').txt(emit.cMunicipio).up()
        .ele('xMun').txt(emit.municipio).up()
        .ele('UF').txt(emit.uf).up()
        .ele('CEP').txt(emit.cep.replace(/\D/g, '')).up()
        .ele('cPais').txt('1058').up()
        .ele('xPais').txt('BRASIL').up()
        .up()
        .ele('IE').txt(emit.ie.replace(/\D/g, '')).up()
        .ele('CRT').txt(emit.crt || '1').up()
        .up()
        .ele('det', { nItem: '1' })
        .ele('prod')
        .ele('cProd').txt(prod.codigo).up()
        .ele('cEAN').txt('SEM GTIN').up()
        .ele('xProd').txt('NOTA FISCAL EMITIDA EM AMBIENTE DE HOMOLOGACAO - SEM VALOR FISCAL').up()
        .ele('NCM').txt('00000000').up()
        .ele('CFOP').txt(prod.cfop).up()
        .ele('uCom').txt(prod.unidade).up()
        .ele('qCom').txt(prod.quantidade.toFixed(4)).up()
        .ele('vUnCom').txt(prod.valorUnitario.toFixed(10)).up()
        .ele('vProd').txt(prod.valorTotal.toFixed(2)).up()
        .ele('cEANTrib').txt('SEM GTIN').up()
        .ele('uTrib').txt(prod.unidade).up()
        .ele('qTrib').txt(prod.quantidade.toFixed(4)).up()
        .ele('vUnTrib').txt(prod.valorUnitario.toFixed(10)).up()
        .ele('indTot').txt('1').up()
        .up()
        .ele('imposto')
        .ele('ICMS')
        .ele('ICMSSN102')
        .ele('orig').txt('0').up()
        .ele('CSOSN').txt('102').up()
        .up()
        .up()
        .ele('PIS')
        .ele('PISNT')
        .ele('CST').txt('07').up()
        .up()
        .up()
        .ele('COFINS')
        .ele('COFINSNT')
        .ele('CST').txt('07').up()
        .up()
        .up()
        .up()
        .up()
        .ele('total')
        .ele('ICMSTot')
        .ele('vBC').txt('0.00').up()
        .ele('vICMS').txt('0.00').up()
        .ele('vICMSDeson').txt('0.00').up()
        .ele('vFCP').txt('0.00').up()
        .ele('vBCST').txt('0.00').up()
        .ele('vST').txt('0.00').up()
        .ele('vFCPST').txt('0.00').up()
        .ele('vFCPSTRet').txt('0.00').up()
        .ele('vProd').txt(prod.valorTotal.toFixed(2)).up()
        .ele('vFrete').txt('0.00').up()
        .ele('vSeg').txt('0.00').up()
        .ele('vDesc').txt('0.00').up()
        .ele('vII').txt('0.00').up()
        .ele('vIPI').txt('0.00').up()
        .ele('vIPIDevol').txt('0.00').up()
        .ele('vPIS').txt('0.00').up()
        .ele('vCOFINS').txt('0.00').up()
        .ele('vOutro').txt('0.00').up()
        .ele('vNF').txt(prod.valorTotal.toFixed(2)).up()
        .up()
        .up()
        .ele('transp')
        .ele('modFrete').txt('9').up()
        .up()
        .ele('pag')
        .ele('detPag')
        .ele('tPag').txt('01').up()
        .ele('vPag').txt(prod.valorTotal.toFixed(2)).up()
        .up()
        .up();

    return doc.end({ headless: true });
}

function signXml(xml, privateKey, certificate) {
    const { SignedXml } = require('xml-crypto');
    const { DOMParser } = require('@xmldom/xmldom');

    const keyPem = forge.pki.privateKeyToPem(privateKey);
    const certPem = forge.pki.certificateToPem(certificate);
    const certBase64 = certPem
        .replace('-----BEGIN CERTIFICATE-----', '')
        .replace('-----END CERTIFICATE-----', '')
        .replace(/\s/g, '');

    // Parse XML to find infNFe ID
    const doc = new DOMParser().parseFromString(xml, 'text/xml');
    const infNFe = doc.getElementsByTagName('infNFe')[0];
    if (!infNFe) throw new Error('infNFe not found in XML');

    const referenceId = infNFe.getAttribute('Id');
    if (!referenceId) throw new Error('Id attribute not found');

    // Create SignedXml instance with KeyInfo function
    const sig = new SignedXml({
        privateKey: keyPem,
        publicCert: certPem,
        signatureAlgorithm: 'http://www.w3.org/2000/09/xmldsig#rsa-sha1',
        canonicalizationAlgorithm: 'http://www.w3.org/TR/2001/REC-xml-c14n-20010315',
        getKeyInfoContent: () => `<X509Data><X509Certificate>${certBase64}</X509Certificate></X509Data>`
    });

    // Add reference to infNFe
    sig.addReference({
        xpath: `//*[@Id='${referenceId}']`,
        transforms: [
            'http://www.w3.org/2000/09/xmldsig#enveloped-signature',
            'http://www.w3.org/TR/2001/REC-xml-c14n-20010315'
        ],
        digestAlgorithm: 'http://www.w3.org/2000/09/xmldsig#sha1'
    });

    // Compute signature
    sig.computeSignature(xml, {
        location: { reference: '//*[local-name()="infNFe"]', action: 'after' }
    });

    return sig.getSignedXml();
}

function buildEnviNFe(signedNFe, idLote) {
    return `<enviNFe xmlns="http://www.portalfiscal.inf.br/nfe" versao="4.00">` +
        `<idLote>${idLote}</idLote>` +
        `<indSinc>1</indSinc>` +
        signedNFe +
        `</enviNFe>`;
}

function buildSoapEnvelope(xmlBody) {
    return `<?xml version="1.0" encoding="utf-8"?>` +
        `<soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" ` +
        `xmlns:xsd="http://www.w3.org/2001/XMLSchema" ` +
        `xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">` +
        `<soap12:Body>` +
        `<nfeDadosMsg xmlns="http://www.portalfiscal.inf.br/nfe/wsdl/NFeAutorizacao4">` +
        xmlBody +
        `</nfeDadosMsg>` +
        `</soap12:Body>` +
        `</soap12:Envelope>`;
}

async function sendToSefaz(endpoint, soapEnvelope, certPem, keyPem, caPems) {
    return new Promise((resolve, reject) => {
        const url = new URL(endpoint);

        // Create HTTPS agent with PEM certificates
        const agentOptions = {
            cert: certPem,
            key: keyPem,
            rejectUnauthorized: false,
        };

        // Add CA chain if available
        if (caPems && caPems.length > 0) {
            agentOptions.ca = caPems;
        }

        const agent = new https.Agent(agentOptions);

        const options = {
            hostname: url.hostname,
            port: 443,
            path: url.pathname,
            method: 'POST',
            headers: {
                'Content-Type': 'application/soap+xml; charset=utf-8',
                'Content-Length': Buffer.byteLength(soapEnvelope),
                'SOAPAction': 'http://www.portalfiscal.inf.br/nfe/wsdl/NFeAutorizacao4/nfeAutorizacaoLote',
            },
            agent: agent,
        };

        log('Making HTTPS request with PEM certificates...', { hostname: url.hostname, path: url.pathname });

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                resolve({
                    statusCode: res.statusCode,
                    headers: res.headers,
                    data: data,
                });
            });
        });

        req.on('error', (err) => {
            log('Request error', { code: err.code, message: err.message });
            reject(err);
        });

        req.write(soapEnvelope);
        req.end();
    });
}

async function runIntegrationTest() {
    console.log('='.repeat(60));
    console.log('SEFAZ HOMOLOGAÇÃO INTEGRATION TEST V3 (PEM)');
    console.log('='.repeat(60));
    console.log();

    try {
        if (!CERT_PASSWORD) {
            throw new Error('CERT_PASSWORD environment variable not set');
        }

        // Load certificate and convert to PEM format
        const { cert, privateKey, subject, certPem, keyPem, caPems } = loadCertificateAsPem(CERT_PATH, CERT_PASSWORD);

        // Save PEM files for debugging
        fs.writeFileSync('test-cert.pem', certPem);
        fs.writeFileSync('test-key.pem', keyPem);
        log('Saved PEM files for debugging');

        const cnValue = subject.CN || '';
        const cnpjMatch = cnValue.match(/\d{14}/);
        const cnpj = cnpjMatch ? cnpjMatch[0] : '00000000000000';

        log('Extracted CNPJ from certificate', { cnpj });

        const now = new Date();
        const aamm = `${now.getFullYear().toString().substring(2)}${(now.getMonth() + 1).toString().padStart(2, '0')}`;
        const cNF = Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
        const nNF = Math.floor(Math.random() * 999999999).toString();

        const nfeData = {
            ide: {
                cUF: '43',
                natOp: 'VENDA DE MERCADORIA',
                serie: '1',
                nNF: nNF,
                cMunFG: '4314902',
            },
            emit: {
                cnpj: cnpj,
                razaoSocial: subject.O || 'EMPRESA TESTE',
                logradouro: 'RUA TESTE',
                numero: '100',
                bairro: 'CENTRO',
                cMunicipio: '4314902',
                municipio: 'PORTO ALEGRE',
                uf: 'RS',
                cep: '90000000',
                ie: '1234567890',
                crt: '1',
            },
            produtos: [{
                codigo: '001',
                descricao: 'PRODUTO TESTE',
                ncm: '00000000',
                cfop: '5102',
                unidade: 'UN',
                quantidade: 1,
                valorUnitario: 10.00,
                valorTotal: 10.00,
            }],
        };

        const chaveAcesso = generateChaveAcesso(
            nfeData.ide.cUF,
            aamm,
            cnpj,
            '55',
            nfeData.ide.serie,
            nNF,
            '1',
            cNF
        );

        log('Generated chave de acesso', { chaveAcesso, length: chaveAcesso.length });

        const nfeXml = buildNFeXml(nfeData, chaveAcesso);
        log('Built NFe XML');

        const signedXml = signXml(nfeXml, privateKey, cert);
        log('Signed NFe XML');

        const enviNFe = buildEnviNFe(signedXml, '1');
        log('Built enviNFe envelope');

        const soapEnvelope = buildSoapEnvelope(enviNFe);
        log('Built SOAP envelope');

        fs.writeFileSync('test-nfe-signed.xml', signedXml);
        fs.writeFileSync('test-soap-envelope.xml', soapEnvelope);
        log('Saved XML files for debugging');

        log('Sending to SEFAZ RS Homologação...');

        // Use PEM format for HTTPS connection
        const response = await sendToSefaz(
            SEFAZ_ENDPOINTS.RS.autorizacao,
            soapEnvelope,
            certPem,
            keyPem,
            caPems
        );

        log('SEFAZ Response', {
            statusCode: response.statusCode,
            dataLength: response.data.length,
        });

        const cStatMatch = response.data.match(/<cStat>(\d+)<\/cStat>/);
        const xMotivoMatch = response.data.match(/<xMotivo>([^<]+)<\/xMotivo>/);

        const status = cStatMatch ? cStatMatch[1] : 'unknown';
        const motivo = xMotivoMatch ? xMotivoMatch[1] : 'unknown';

        console.log();
        console.log('='.repeat(60));
        console.log('RESULT');
        console.log('='.repeat(60));
        console.log(`Status Code: ${status}`);
        console.log(`Motivo: ${motivo}`);
        console.log(`Chave Acesso: ${chaveAcesso}`);
        console.log();

        fs.writeFileSync('test-sefaz-response.xml', response.data);
        log('Saved response to test-sefaz-response.xml');

        if (status === '100' || status === '104') {
            console.log('✅ SUCCESS: NFe foi autorizada em ambiente de homologação!');
        } else if (status === '105') {
            console.log('⏳ PROCESSING: Lote em processamento, consultar recibo depois.');
        } else {
            console.log('⚠️ REJECTION/ERROR: Verifique a resposta para detalhes.');
        }

    } catch (error) {
        console.error();
        console.error('❌ ERROR:', error.message);
        console.error();
        if (error.stack) console.error(error.stack);
        process.exit(1);
    }
}

runIntegrationTest().catch(console.error);
