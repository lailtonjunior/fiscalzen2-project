import { Injectable } from '@nestjs/common';
import { create } from 'xmlbuilder2';

@Injectable()
export class XmlFactoryService {

    createStatusCheckXml(uf: string = 'RS', environment: '1' | '2' = '2'): string {
        // 1 = Produção, 2 = Homologação
        // CUF RS = 43
        // Ref: Manual Orientação Contribuinte

        const xml = create({ version: '1.0', encoding: 'UTF-8' })
            .ele('consStatServ', {
                versao: '4.00',
                xmlns: 'http://www.portalfiscal.inf.br/nfe'
            })
            .ele('tpAmb').txt(environment).up()
            .ele('cUF').txt('43').up() // 43 = RS (Default for now)
            .ele('xServ').txt('STATUS').up()
            .up();

        return xml.end({ prettyPrint: false });
    }

    wrapInSoapEnvelope(xmlBody: string): string {
        return `<?xml version="1.0" encoding="utf-8"?>
    <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
      <soap12:Body>
        <nfeDadosMsg xmlns="http://www.portalfiscal.inf.br/nfe/wsdl/NFeStatusServico4">
          ${xmlBody}
        </nfeDadosMsg>
      </soap12:Body>
    </soap12:Envelope>`;
    }
}
