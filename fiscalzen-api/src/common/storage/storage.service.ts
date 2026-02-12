import { Injectable, Logger } from '@nestjs/common';
import {
    S3Client,
    PutObjectCommand,
    GetObjectCommand,
    DeleteObjectCommand,
    HeadObjectCommand,
} from '@aws-sdk/client-s3';
import { Readable } from 'stream';

export interface UploadResult {
    key: string;
    bucket: string;
    url: string;
}

@Injectable()
export class StorageService {
    private readonly logger = new Logger(StorageService.name);
    private readonly s3Client: S3Client;
    private readonly bucket: string;
    private readonly endpoint: string;
    private readonly externalEndpoint: string;

    constructor() {
        // Internal endpoint for S3Client (API -> MinIO)
        const endpoint = `http${process.env.MINIO_USE_SSL === 'true' ? 's' : ''}://${process.env.MINIO_ENDPOINT || 'localhost'}:${process.env.MINIO_PORT || '9000'}`;

        this.s3Client = new S3Client({
            endpoint,
            region: 'us-east-1',
            credentials: {
                accessKeyId: process.env.MINIO_ACCESS_KEY || 'admin',
                secretAccessKey: process.env.MINIO_SECRET_KEY || 'minio123',
            },
            forcePathStyle: true,
        });

        this.bucket = process.env.MINIO_BUCKET_NAME || 'fiscalzen-storage';
        this.endpoint = endpoint;

        // External endpoint for Public URLs (Browser -> MinIO)
        // Defaults to internal endpoint if external vars are not set
        const extHost = process.env.MINIO_EXTERNAL_ENDPOINT || process.env.MINIO_ENDPOINT || 'localhost';
        const extPort = process.env.MINIO_EXTERNAL_PORT || process.env.MINIO_PORT || '9000';
        this.externalEndpoint = `http${process.env.MINIO_USE_SSL === 'true' ? 's' : ''}://${extHost}:${extPort}`;

        this.logger.log(`Storage configured: Internal=${endpoint}, External=${this.externalEndpoint}`);
    }

    async upload(
        key: string,
        body: Buffer | Readable,
        contentType?: string,
    ): Promise<UploadResult> {
        const command = new PutObjectCommand({
            Bucket: this.bucket,
            Key: key,
            Body: body,
            ContentType: contentType,
        });

        await this.s3Client.send(command);
        this.logger.log(`Uploaded: ${key}`);

        return {
            key,
            bucket: this.bucket,
            url: `${this.externalEndpoint}/${this.bucket}/${key}`,
        };
    }

    async download(key: string): Promise<Buffer> {
        const command = new GetObjectCommand({
            Bucket: this.bucket,
            Key: key,
        });

        const response = await this.s3Client.send(command);
        const stream = response.Body as Readable;

        const chunks: Buffer[] = [];
        for await (const chunk of stream) {
            chunks.push(chunk);
        }
        return Buffer.concat(chunks);
    }

    async delete(key: string): Promise<void> {
        const command = new DeleteObjectCommand({
            Bucket: this.bucket,
            Key: key,
        });

        await this.s3Client.send(command);
        this.logger.log(`Deleted: ${key}`);
    }

    async exists(key: string): Promise<boolean> {
        try {
            const command = new HeadObjectCommand({
                Bucket: this.bucket,
                Key: key,
            });
            await this.s3Client.send(command);
            return true;
        } catch {
            return false;
        }
    }

    getPublicUrl(key: string): string {
        return `${this.externalEndpoint}/${this.bucket}/${key}`;
    }
}
