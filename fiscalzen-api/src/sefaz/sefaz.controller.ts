import { Controller, Get, Query } from '@nestjs/common';
import { SefazService } from './sefaz.service';
import { Public } from '../auth/public.decorator';

@Controller('sefaz')
export class SefazController {
    constructor(private readonly sefazService: SefazService) { }

    @Public()
    @Get('status')
    async checkStatus(@Query('uf') uf: string) {
        return this.sefazService.checkStatus(uf || 'RS');
    }
}
