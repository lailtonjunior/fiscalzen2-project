import { BadRequestException } from '@nestjs/common';

const XXE_PATTERNS = [
    /<!DOCTYPE/i,
    /<!ENTITY/i,
    /SYSTEM\s+["']/i,
    /PUBLIC\s+["']/i,
    /<!ELEMENT/i,
];

/**
 * Validates XML buffer for XXE attack vectors before parsing.
 * Rejects any XML containing DOCTYPE, ENTITY, SYSTEM, or PUBLIC declarations.
 */
export function validateXmlSafe(xmlBuffer: Buffer): void {
    const header = xmlBuffer.subarray(0, Math.min(xmlBuffer.length, 2048)).toString('utf-8');

    for (const pattern of XXE_PATTERNS) {
        if (pattern.test(header)) {
            throw new BadRequestException(
                'XML rejeitado: contém declarações proibidas (DOCTYPE/ENTITY). ' +
                'Apenas NFe XML padrão é aceito.',
            );
        }
    }
}

/**
 * Strips any XML prolog processing instructions that could be malicious.
 * Returns cleaned XML string.
 */
export function stripXmlProlog(xml: string): string {
    return xml.replace(/<\?xml[^?]*\?>/gi, '').trim();
}
