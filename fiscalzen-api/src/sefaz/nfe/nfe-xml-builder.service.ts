import { Injectable, Logger } from '@nestjs/common';
import { create } from 'xmlbuilder2';
import {
    NFeData,
    NFeIde,
    NFeEmit,
    NFeDest,
    NFeDet,
    NFeTotal,
    NFeTransp,
    NFePag,
    NFeInfAdic,
} from './nfe.interface';

const NFE_NAMESPACE = 'http://www.portalfiscal.inf.br/nfe';
const NFE_VERSION = '4.00';

@Injectable()
export class NFeXmlBuilderService {
    private readonly logger = new Logger(NFeXmlBuilderService.name);

    /**
     * Build complete NFe XML from data structure
     */
    buildNFeXml(data: NFeData, chaveAcesso: string): string {
        const xml = create({ version: '1.0', encoding: 'UTF-8' })
            .ele('NFe', { xmlns: NFE_NAMESPACE });

        // infNFe element
        const infNFe = xml.ele('infNFe', {
            versao: NFE_VERSION,
            Id: `NFe${chaveAcesso}`,
        });

        // Build each section
        this.buildIde(infNFe, data.ide);
        this.buildEmit(infNFe, data.emit);
        if (data.dest) {
            this.buildDest(infNFe, data.dest);
        }
        this.buildDet(infNFe, data.det);
        this.buildTotal(infNFe, data.total);
        this.buildTransp(infNFe, data.transp);
        if (data.cobr) {
            this.buildCobr(infNFe, data.cobr);
        }
        this.buildPag(infNFe, data.pag);
        if (data.infAdic) {
            this.buildInfAdic(infNFe, data.infAdic);
        }

        return xml.end({ prettyPrint: false });
    }

    /**
     * Build IDE (Identificação) section
     */
    private buildIde(parent: any, ide: NFeIde): void {
        const ideEl = parent.ele('ide');

        ideEl.ele('cUF').txt(ide.cUF);
        ideEl.ele('cNF').txt(ide.cNF);
        ideEl.ele('natOp').txt(ide.natOp);
        ideEl.ele('mod').txt(ide.mod);
        ideEl.ele('serie').txt(ide.serie);
        ideEl.ele('nNF').txt(ide.nNF);
        ideEl.ele('dhEmi').txt(ide.dhEmi);
        if (ide.dhSaiEnt) {
            ideEl.ele('dhSaiEnt').txt(ide.dhSaiEnt);
        }
        ideEl.ele('tpNF').txt(ide.tpNF);
        ideEl.ele('idDest').txt(ide.idDest);
        ideEl.ele('cMunFG').txt(ide.cMunFG);
        ideEl.ele('tpImp').txt(ide.tpImp);
        ideEl.ele('tpEmis').txt(ide.tpEmis);
        if (ide.cDV) {
            ideEl.ele('cDV').txt(ide.cDV);
        }
        ideEl.ele('tpAmb').txt(ide.tpAmb);
        ideEl.ele('finNFe').txt(ide.finNFe);
        ideEl.ele('indFinal').txt(ide.indFinal);
        ideEl.ele('indPres').txt(ide.indPres);
        ideEl.ele('procEmi').txt(ide.procEmi);
        ideEl.ele('verProc').txt(ide.verProc);
    }

    /**
     * Build EMIT (Emitente) section
     */
    private buildEmit(parent: any, emit: NFeEmit): void {
        const emitEl = parent.ele('emit');

        emitEl.ele('CNPJ').txt(emit.CNPJ);
        emitEl.ele('xNome').txt(emit.xNome);
        if (emit.xFant) {
            emitEl.ele('xFant').txt(emit.xFant);
        }

        // Endereço do Emitente
        const enderEmit = emitEl.ele('enderEmit');
        this.buildEndereco(enderEmit, emit.enderEmit);

        emitEl.ele('IE').txt(emit.IE);
        if (emit.IEST) {
            emitEl.ele('IEST').txt(emit.IEST);
        }
        if (emit.IM) {
            emitEl.ele('IM').txt(emit.IM);
        }
        if (emit.CNAE) {
            emitEl.ele('CNAE').txt(emit.CNAE);
        }
        emitEl.ele('CRT').txt(emit.CRT);
    }

    /**
     * Build DEST (Destinatário) section
     */
    private buildDest(parent: any, dest: NFeDest): void {
        const destEl = parent.ele('dest');

        if (dest.CNPJ) {
            destEl.ele('CNPJ').txt(dest.CNPJ);
        } else if (dest.CPF) {
            destEl.ele('CPF').txt(dest.CPF);
        } else if (dest.idEstrangeiro) {
            destEl.ele('idEstrangeiro').txt(dest.idEstrangeiro);
        }

        if (dest.xNome) {
            destEl.ele('xNome').txt(dest.xNome);
        }

        if (dest.enderDest) {
            const enderDest = destEl.ele('enderDest');
            this.buildEndereco(enderDest, dest.enderDest);
        }

        destEl.ele('indIEDest').txt(dest.indIEDest);

        if (dest.IE) {
            destEl.ele('IE').txt(dest.IE);
        }
        if (dest.ISUF) {
            destEl.ele('ISUF').txt(dest.ISUF);
        }
        if (dest.IM) {
            destEl.ele('IM').txt(dest.IM);
        }
        if (dest.email) {
            destEl.ele('email').txt(dest.email);
        }
    }

    /**
     * Build DET (Detalhamento) section - products and taxes
     */
    private buildDet(parent: any, detList: NFeDet[]): void {
        for (const det of detList) {
            const detEl = parent.ele('det', { nItem: det.nItem.toString() });

            // Produto
            const prod = detEl.ele('prod');
            prod.ele('cProd').txt(det.prod.cProd);
            prod.ele('cEAN').txt(det.prod.cEAN || 'SEM GTIN');
            prod.ele('xProd').txt(det.prod.xProd);
            prod.ele('NCM').txt(det.prod.NCM);
            if (det.prod.CEST) {
                prod.ele('CEST').txt(det.prod.CEST);
            }
            prod.ele('CFOP').txt(det.prod.CFOP);
            prod.ele('uCom').txt(det.prod.uCom);
            prod.ele('qCom').txt(det.prod.qCom);
            prod.ele('vUnCom').txt(det.prod.vUnCom);
            prod.ele('vProd').txt(det.prod.vProd);
            prod.ele('cEANTrib').txt(det.prod.cEANTrib || 'SEM GTIN');
            prod.ele('uTrib').txt(det.prod.uTrib);
            prod.ele('qTrib').txt(det.prod.qTrib);
            prod.ele('vUnTrib').txt(det.prod.vUnTrib);
            if (det.prod.vFrete) {
                prod.ele('vFrete').txt(det.prod.vFrete);
            }
            if (det.prod.vSeg) {
                prod.ele('vSeg').txt(det.prod.vSeg);
            }
            if (det.prod.vDesc) {
                prod.ele('vDesc').txt(det.prod.vDesc);
            }
            if (det.prod.vOutro) {
                prod.ele('vOutro').txt(det.prod.vOutro);
            }
            prod.ele('indTot').txt(det.prod.indTot);

            // Impostos
            this.buildImposto(detEl, det.imposto);

            if (det.infAdProd) {
                detEl.ele('infAdProd').txt(det.infAdProd);
            }
        }
    }

    /**
     * Build imposto section for a product
     */
    private buildImposto(parent: any, imposto: any): void {
        const impostoEl = parent.ele('imposto');

        if (imposto.vTotTrib) {
            impostoEl.ele('vTotTrib').txt(imposto.vTotTrib);
        }

        // ICMS
        const icmsGroup = impostoEl.ele('ICMS');
        const icms = imposto.ICMS;

        // Determine ICMS group based on CST/CSOSN
        const icmsType = icms.CSOSN ? `ICMSSN${icms.CSOSN.substring(0, 3)}` : `ICMS${icms.CST || '00'}`;
        const icmsEl = icmsGroup.ele(icmsType);

        icmsEl.ele('orig').txt(icms.orig);
        if (icms.CSOSN) {
            icmsEl.ele('CSOSN').txt(icms.CSOSN);
        } else if (icms.CST) {
            icmsEl.ele('CST').txt(icms.CST);
        }
        if (icms.modBC) {
            icmsEl.ele('modBC').txt(icms.modBC);
        }
        if (icms.vBC) {
            icmsEl.ele('vBC').txt(icms.vBC);
        }
        if (icms.pICMS) {
            icmsEl.ele('pICMS').txt(icms.pICMS);
        }
        if (icms.vICMS) {
            icmsEl.ele('vICMS').txt(icms.vICMS);
        }

        // PIS
        const pisGroup = impostoEl.ele('PIS');
        const pis = imposto.PIS;
        const pisType = ['01', '02'].includes(pis.CST) ? 'PISAliq' : 'PISNT';
        const pisEl = pisGroup.ele(pisType);
        pisEl.ele('CST').txt(pis.CST);
        if (pis.vBC) {
            pisEl.ele('vBC').txt(pis.vBC);
        }
        if (pis.pPIS) {
            pisEl.ele('pPIS').txt(pis.pPIS);
        }
        if (pis.vPIS) {
            pisEl.ele('vPIS').txt(pis.vPIS);
        }

        // COFINS
        const cofinsGroup = impostoEl.ele('COFINS');
        const cofins = imposto.COFINS;
        const cofinsType = ['01', '02'].includes(cofins.CST) ? 'COFINSAliq' : 'COFINSNT';
        const cofinsEl = cofinsGroup.ele(cofinsType);
        cofinsEl.ele('CST').txt(cofins.CST);
        if (cofins.vBC) {
            cofinsEl.ele('vBC').txt(cofins.vBC);
        }
        if (cofins.pCOFINS) {
            cofinsEl.ele('pCOFINS').txt(cofins.pCOFINS);
        }
        if (cofins.vCOFINS) {
            cofinsEl.ele('vCOFINS').txt(cofins.vCOFINS);
        }
    }

    /**
     * Build TOTAL section
     */
    private buildTotal(parent: any, total: NFeTotal): void {
        const totalEl = parent.ele('total');
        const icmsTot = totalEl.ele('ICMSTot');
        const t = total.ICMSTot;

        icmsTot.ele('vBC').txt(t.vBC);
        icmsTot.ele('vICMS').txt(t.vICMS);
        icmsTot.ele('vICMSDeson').txt(t.vICMSDeson);
        if (t.vFCPUFDest) icmsTot.ele('vFCPUFDest').txt(t.vFCPUFDest);
        if (t.vICMSUFDest) icmsTot.ele('vICMSUFDest').txt(t.vICMSUFDest);
        if (t.vICMSUFRemet) icmsTot.ele('vICMSUFRemet').txt(t.vICMSUFRemet);
        icmsTot.ele('vFCP').txt(t.vFCP);
        icmsTot.ele('vBCST').txt(t.vBCST);
        icmsTot.ele('vST').txt(t.vST);
        icmsTot.ele('vFCPST').txt(t.vFCPST);
        icmsTot.ele('vFCPSTRet').txt(t.vFCPSTRet);
        icmsTot.ele('vProd').txt(t.vProd);
        icmsTot.ele('vFrete').txt(t.vFrete);
        icmsTot.ele('vSeg').txt(t.vSeg);
        icmsTot.ele('vDesc').txt(t.vDesc);
        icmsTot.ele('vII').txt(t.vII);
        icmsTot.ele('vIPI').txt(t.vIPI);
        icmsTot.ele('vIPIDevol').txt(t.vIPIDevol);
        icmsTot.ele('vPIS').txt(t.vPIS);
        icmsTot.ele('vCOFINS').txt(t.vCOFINS);
        icmsTot.ele('vOutro').txt(t.vOutro);
        icmsTot.ele('vNF').txt(t.vNF);
        if (t.vTotTrib) icmsTot.ele('vTotTrib').txt(t.vTotTrib);
    }

    /**
     * Build TRANSP section
     */
    private buildTransp(parent: any, transp: NFeTransp): void {
        const transpEl = parent.ele('transp');
        transpEl.ele('modFrete').txt(transp.modFrete);

        if (transp.transporta) {
            const transporta = transpEl.ele('transporta');
            const t = transp.transporta;
            if (t.CNPJ) transporta.ele('CNPJ').txt(t.CNPJ);
            if (t.CPF) transporta.ele('CPF').txt(t.CPF);
            if (t.xNome) transporta.ele('xNome').txt(t.xNome);
            if (t.IE) transporta.ele('IE').txt(t.IE);
            if (t.xEnder) transporta.ele('xEnder').txt(t.xEnder);
            if (t.xMun) transporta.ele('xMun').txt(t.xMun);
            if (t.UF) transporta.ele('UF').txt(t.UF);
        }

        if (transp.veicTransp) {
            const veic = transpEl.ele('veicTransp');
            veic.ele('placa').txt(transp.veicTransp.placa);
            veic.ele('UF').txt(transp.veicTransp.UF);
            if (transp.veicTransp.RNTC) {
                veic.ele('RNTC').txt(transp.veicTransp.RNTC);
            }
        }

        if (transp.vol && transp.vol.length > 0) {
            for (const v of transp.vol) {
                const vol = transpEl.ele('vol');
                if (v.qVol) vol.ele('qVol').txt(v.qVol);
                if (v.esp) vol.ele('esp').txt(v.esp);
                if (v.marca) vol.ele('marca').txt(v.marca);
                if (v.nVol) vol.ele('nVol').txt(v.nVol);
                if (v.pesoL) vol.ele('pesoL').txt(v.pesoL);
                if (v.pesoB) vol.ele('pesoB').txt(v.pesoB);
            }
        }
    }

    /**
     * Build COBR section
     */
    private buildCobr(parent: any, cobr: any): void {
        const cobrEl = parent.ele('cobr');

        if (cobr.fat) {
            const fat = cobrEl.ele('fat');
            if (cobr.fat.nFat) fat.ele('nFat').txt(cobr.fat.nFat);
            if (cobr.fat.vOrig) fat.ele('vOrig').txt(cobr.fat.vOrig);
            if (cobr.fat.vDesc) fat.ele('vDesc').txt(cobr.fat.vDesc);
            if (cobr.fat.vLiq) fat.ele('vLiq').txt(cobr.fat.vLiq);
        }

        if (cobr.dup && cobr.dup.length > 0) {
            for (const d of cobr.dup) {
                const dup = cobrEl.ele('dup');
                if (d.nDup) dup.ele('nDup').txt(d.nDup);
                if (d.dVenc) dup.ele('dVenc').txt(d.dVenc);
                if (d.vDup) dup.ele('vDup').txt(d.vDup);
            }
        }
    }

    /**
     * Build PAG section
     */
    private buildPag(parent: any, pag: NFePag): void {
        const pagEl = parent.ele('pag');

        for (const det of pag.detPag) {
            const detPag = pagEl.ele('detPag');
            if (det.indPag) {
                detPag.ele('indPag').txt(det.indPag);
            }
            detPag.ele('tPag').txt(det.tPag);
            detPag.ele('vPag').txt(det.vPag);

            if (det.card) {
                const card = detPag.ele('card');
                card.ele('tpIntegra').txt(det.card.tpIntegra);
                if (det.card.CNPJ) card.ele('CNPJ').txt(det.card.CNPJ);
                if (det.card.tBand) card.ele('tBand').txt(det.card.tBand);
                if (det.card.cAut) card.ele('cAut').txt(det.card.cAut);
            }
        }

        if (pag.vTroco) {
            pagEl.ele('vTroco').txt(pag.vTroco);
        }
    }

    /**
     * Build infAdic section
     */
    private buildInfAdic(parent: any, infAdic: NFeInfAdic): void {
        const infAdicEl = parent.ele('infAdic');

        if (infAdic.infAdFisco) {
            infAdicEl.ele('infAdFisco').txt(infAdic.infAdFisco);
        }
        if (infAdic.infCpl) {
            infAdicEl.ele('infCpl').txt(infAdic.infCpl);
        }
    }

    /**
     * Build endereco elements
     */
    private buildEndereco(parent: any, ender: any): void {
        parent.ele('xLgr').txt(ender.xLgr);
        parent.ele('nro').txt(ender.nro);
        if (ender.xCpl) {
            parent.ele('xCpl').txt(ender.xCpl);
        }
        parent.ele('xBairro').txt(ender.xBairro);
        parent.ele('cMun').txt(ender.cMun);
        parent.ele('xMun').txt(ender.xMun);
        parent.ele('UF').txt(ender.UF);
        parent.ele('CEP').txt(ender.CEP);
        if (ender.cPais) {
            parent.ele('cPais').txt(ender.cPais);
        }
        if (ender.xPais) {
            parent.ele('xPais').txt(ender.xPais);
        }
        if (ender.fone) {
            parent.ele('fone').txt(ender.fone);
        }
    }

    /**
     * Generate chave de acesso (44 digits)
     */
    generateChaveAcesso(
        cUF: string,
        aamm: string,
        cnpj: string,
        mod: string,
        serie: string,
        nNF: string,
        tpEmis: string,
        cNF: string,
    ): string {
        // Remove non-digits
        const cleanCnpj = cnpj.replace(/\D/g, '');

        // Pad values
        const paddedSerie = serie.padStart(3, '0');
        const paddedNNF = nNF.padStart(9, '0');
        const paddedCNF = cNF.padStart(8, '0');

        // Build 43 digits (without check digit)
        const base = `${cUF}${aamm}${cleanCnpj}${mod}${paddedSerie}${paddedNNF}${tpEmis}${paddedCNF}`;

        // Calculate check digit (modulo 11)
        const cDV = this.calculateMod11(base);

        return `${base}${cDV}`;
    }

    /**
     * Calculate modulo 11 check digit
     */
    private calculateMod11(base: string): string {
        let peso = 2;
        let soma = 0;

        // Process from right to left
        for (let i = base.length - 1; i >= 0; i--) {
            soma += parseInt(base[i], 10) * peso;
            peso = peso === 9 ? 2 : peso + 1;
        }

        const resto = soma % 11;
        const dv = 11 - resto;

        if (dv === 0 || dv === 1 || dv >= 10) {
            return '0';
        }

        return dv.toString();
    }
}
