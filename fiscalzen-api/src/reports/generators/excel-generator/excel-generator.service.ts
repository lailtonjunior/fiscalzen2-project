
import { Injectable } from '@nestjs/common';
import * as XLSX from 'xlsx';

@Injectable()
export class ExcelGeneratorService {
    generateReport(data: any[], sheetName: string = 'Relatório'): Buffer {
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, sheetName);

        // Write to buffer
        const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
        return buf;
    }
}
