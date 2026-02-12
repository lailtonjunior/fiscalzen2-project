
import { Injectable } from '@nestjs/common';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const PdfPrinterLib = require('pdfmake/js/Printer');
const PdfPrinter = PdfPrinterLib.default || PdfPrinterLib;
import { TFontDictionary } from 'pdfmake/interfaces';

const fonts: TFontDictionary = {
    Helvetica: {
        normal: 'Helvetica',
        bold: 'Helvetica-Bold',
        italics: 'Helvetica-Oblique',
        bolditalics: 'Helvetica-BoldOblique',
    },
};

@Injectable()
export class PdfGeneratorService {
    private printer: any;

    constructor() {
        this.printer = new PdfPrinter(fonts);
    }

    generateReport(title: string, data: any[], columns: string[]): Promise<Buffer> {
        return new Promise((resolve, reject) => {
            const docDefinition = {
                pageOrientation: columns.length > 5 ? 'landscape' : 'portrait',
                content: [
                    { text: title, style: 'header' },
                    { text: `Gerado em: ${new Date().toLocaleString('pt-BR')}`, style: 'subheader' },
                    {
                        table: {
                            headerRows: 1,
                            widths: Array(columns.length).fill('auto'),
                            body: [
                                columns.map(c => ({ text: c.toUpperCase(), style: 'tableHeader' })),
                                ...data.map(row => columns.map(c => {
                                    const val = row[c];
                                    // Format dates and numbers?
                                    if (val instanceof Date) return val.toLocaleDateString('pt-BR');
                                    if (typeof val === 'number') return val.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
                                    return val?.toString() || '';
                                }))
                            ]
                        },
                        layout: 'lightHorizontalLines'
                    }
                ],
                styles: {
                    header: { fontSize: 18, bold: true, margin: [0, 0, 0, 10] },
                    subheader: { fontSize: 10, margin: [0, 0, 0, 20], color: 'gray' },
                    tableHeader: { bold: true, fontSize: 10, color: 'black', fillColor: '#eeeeee' }
                },
                defaultStyle: { fontSize: 9 }
            };

            const chunks: Buffer[] = [];
            const pdfDoc = this.printer.createPdfKitDocument(docDefinition);

            pdfDoc.on('data', (chunk: Buffer) => chunks.push(chunk));
            pdfDoc.on('end', () => resolve(Buffer.concat(chunks)));
            pdfDoc.on('error', (err: any) => reject(err));

            pdfDoc.end();
        });
    }
}
