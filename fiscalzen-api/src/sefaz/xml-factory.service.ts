import { Injectable } from '@nestjs/common';
import { create } from 'xmlbuilder2';

@Injectable()
export class XmlFactoryService {

  createStatusCheckXml(uf: string = 'RS', environment: '1' | '2' = '2'): string {
    // 1 = Produção, 2 = Homologação
    // CUF RS = 43
    // Ref: Manual Orientação Contribuinte

    const xml = create()
      .ele('consStatServ', {
        versao: '4.00',
        xmlns: 'http://www.portalfiscal.inf.br/nfe'
      })
      .ele('tpAmb').txt(environment).up()
      .ele('cUF').txt('43').up() // 43 = RS
      .ele('xServ').txt('STATUS').up()
      .up();

    return xml.end({ prettyPrint: false, headless: true });
  }

  createDistributionXml(cnpj: string, uf: string, lastNSU: string = '0', environment: '1' | '2' = '2'): string {
    // 1 = Produção, 2 = Homologação
    // distNSU = Distribuição por NSU (sequencial único)

    const ufCode = this.getUFCode(uf);

    const xml = create()
      .ele('distDFeInt', {
        versao: '1.01',
        xmlns: 'http://www.portalfiscal.inf.br/nfe'
      })
      .ele('tpAmb').txt(environment).up()
      .ele('cUFAutor').txt(ufCode).up()
      .ele('CNPJ').txt(cnpj.replace(/\D/g, '')).up()
      .ele('distNSU')
      .ele('ultNSU').txt(lastNSU.padStart(15, '0')).up()
      .up()
      .up();

    return xml.end({ prettyPrint: false, headless: true });
  }

  private getUFCode(uf: string): string {
    const codes: Record<string, string> = {
      AC: '12', AL: '27', AP: '16', AM: '13', BA: '29',
      CE: '23', DF: '53', ES: '32', GO: '52', MA: '21',
      MT: '51', MS: '50', MG: '31', PA: '15', PB: '25',
      PR: '41', PE: '26', PI: '22', RJ: '33', RN: '24',
      RS: '43', RO: '11', RR: '14', SC: '42', SP: '35',
      SE: '28', TO: '17',
    };
    return codes[uf.toUpperCase()] || '43'; // Default to RS/43 if unknown
  }

  wrapInSoapEnvelope(xmlBody: string, method: 'status' | 'distribution' = 'status'): string {
    const isDistribution = method === 'distribution';

    // Namespace varies
    // Status: http://www.portalfiscal.inf.br/nfe/wsdl/NFeStatusServico4
    // Distribution: http://www.portalfiscal.inf.br/nfe/wsdl/NFeDistribuicaoDFe

    const namespace = isDistribution
      ? 'http://www.portalfiscal.inf.br/nfe/wsdl/NFeDistribuicaoDFe'
      : 'http://www.portalfiscal.inf.br/nfe/wsdl/NFeStatusServico4';

    let content = `<nfeDadosMsg xmlns="${namespace}">${xmlBody}</nfeDadosMsg>`;

    if (isDistribution) {
      content = `<nfeDistDFeInteresse xmlns="${namespace}">${content}</nfeDistDFeInteresse>`;
    }

    return `<?xml version="1.0" encoding="utf-8"?><soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope"><soap12:Body>${content}</soap12:Body></soap12:Envelope>`;
  }
}
