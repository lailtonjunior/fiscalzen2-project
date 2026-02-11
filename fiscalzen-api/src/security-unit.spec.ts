import { Test } from '@nestjs/testing';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { EmpresaGuard } from './common/guards/empresa.guard';
import { SanitizePipe } from './common/pipes/sanitize.pipe';
import { validateXmlSafe } from './common/utils/xml-sanitizer';
import { IsCnpjConstraint } from './common/validators/cnpj.validator';

describe('Security Components', () => {
    describe('EmpresaGuard', () => {
        let guard: EmpresaGuard;
        let reflector: Reflector;

        beforeEach(() => {
            reflector = new Reflector();
            guard = new EmpresaGuard(reflector);
        });

        it('should allow public routes', () => {
            jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true);
            const context = createMockContext({});
            expect(guard.canActivate(context)).toBe(true);
        });

        it('should allow authenticated user with empresaId', () => {
            jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
            const context = createMockContext({ user: { empresaId: '123' } });
            expect(guard.canActivate(context)).toBe(true);
        });

        it('should deny request without empresaId', () => {
            jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
            const context = createMockContext({ user: {} });
            expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
        });
    });

    describe('SanitizePipe', () => {
        const pipe = new SanitizePipe();

        it('should strip script tags', () => {
            const input = { key: 'hello <script>alert(1)</script>' };
            const output = pipe.transform(input, { type: 'body' });
            expect(output.key).toBe('hello');
        });

        it('should strip javascript: handlers', () => {
            const input = { key: 'click <a href="javascript:run()">here</a>' };
            const output = pipe.transform(input, { type: 'body' });
            expect(output.key).toBe('click here');
        });

        it('should handle nested objects', () => {
            const input = { nested: { val: '<b>bold</b>' } };
            const output = pipe.transform(input, { type: 'body' });
            expect(output.nested.val).toBe('bold');
        });
    });

    describe('IsCnpjConstraint', () => {
        const validator = new IsCnpjConstraint();

        it('should validate correct CNPJ', () => {
            // 00.000.000/0001-91
            expect(validator.validate('00000000000191')).toBe(true);
        });

        it('should reject invalid check digits', () => {
            expect(validator.validate('00000000000190')).toBe(false);
        });

        it('should reject repeated digits', () => {
            expect(validator.validate('11111111111111')).toBe(false);
        });
    });
});

function createMockContext(request: any): ExecutionContext {
    return {
        switchToHttp: () => ({
            getRequest: () => request,
        }),
        getHandler: () => { },
        getClass: () => { },
    } as any;
}
