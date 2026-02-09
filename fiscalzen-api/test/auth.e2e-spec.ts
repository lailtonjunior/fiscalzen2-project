import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('AuthController (e2e)', () => {
    let app: INestApplication;
    let accessToken: string;

    const testUser = {
        name: 'Test User',
        email: `test_${Date.now()}@example.com`,
        password: 'password123',
        companyName: 'Test Company',
        cnpj: `000000${Date.now()}`.slice(0, 14),
    };

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();
    });

    afterAll(async () => {
        await app.close();
    });

    it('/auth/register (POST)', async () => {
        const response = await request(app.getHttpServer())
            .post('/auth/register')
            .send(testUser)
            .expect(201);

        expect(response.body).toHaveProperty('access_token');
        expect(response.body).toHaveProperty('user');
        expect(response.body.user.email).toEqual(testUser.email);

        // Store token for next tests
        accessToken = response.body.access_token;
    });

    it('/auth/login (POST)', async () => {
        const response = await request(app.getHttpServer())
            .post('/auth/login')
            .send({
                email: testUser.email,
                password: testUser.password,
            })
            .expect(201); // Assuming 201 for login, or checks implementation

        expect(response.body).toHaveProperty('access_token');
    });

    it('/auth/profile (GET) - Authorized', async () => {
        const response = await request(app.getHttpServer())
            .get('/auth/profile')
            .set('Authorization', `Bearer ${accessToken}`)
            .expect(200);

        expect(response.body).toHaveProperty('email', testUser.email);
    });

    it('/auth/profile (GET) - Unauthorized', async () => {
        await request(app.getHttpServer())
            .get('/auth/profile')
            .expect(401);
    });
});
