import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';

@Injectable()
export class SanitizePipe implements PipeTransform {
    transform(value: any, metadata: ArgumentMetadata) {
        if (metadata.type !== 'body') return value;
        if (typeof value !== 'object' || value === null) return value;
        return this.sanitize(value);
    }

    private sanitize(obj: any): any {
        if (typeof obj === 'string') {
            return this.stripHtml(obj);
        }

        if (Array.isArray(obj)) {
            return obj.map((item) => this.sanitize(item));
        }

        if (typeof obj === 'object' && obj !== null) {
            const sanitized: Record<string, any> = {};
            for (const [key, value] of Object.entries(obj)) {
                sanitized[key] = this.sanitize(value);
            }
            return sanitized;
        }

        return obj;
    }

    private stripHtml(str: string): string {
        return str
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/<[^>]*>/g, '')
            .replace(/javascript:/gi, '')
            .replace(/on\w+\s*=/gi, '')
            .trim();
    }
}
