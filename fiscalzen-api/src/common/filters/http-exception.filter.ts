import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
    Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(HttpExceptionFilter.name);

    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        const status =
            exception instanceof HttpException
                ? exception.getStatus()
                : HttpStatus.INTERNAL_SERVER_ERROR;

        const message =
            exception instanceof HttpException
                ? exception.getResponse()
                : 'Internal server error';

        // Extract error message properly if it's an object (ValidationPipe returns object)
        const errorMessage =
            typeof message === 'object' && message !== null && 'message' in message
                ? (message as Record<string, unknown>).message
                : message;

        const errorResponse = {
            statusCode: status,
            path: request.url,
            method: request.method,
            error: errorMessage,
            timestamp: new Date().toISOString(),
        };

        if (status >= 500) {
            this.logger.error(
                `${request.method} ${request.url}`,
                exception instanceof Error ? exception.stack : 'Unknown error',
            );
        } else {
            this.logger.warn(
                `${request.method} ${request.url} - ${JSON.stringify(errorMessage)}`,
            );
        }

        response.status(status).json(errorResponse);
    }
}
