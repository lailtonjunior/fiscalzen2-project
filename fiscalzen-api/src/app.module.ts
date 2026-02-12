import { Module } from '@nestjs/common';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PrismaModule } from './prisma/prisma.module';
import { SefazModule } from './sefaz/sefaz.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { LoggerModule } from 'nestjs-pino';
import { StorageModule } from './common/storage';
import { QueueModule } from './common/queue';
import { CompaniesModule } from './companies';
import { NotasFiscaisModule } from './notas-fiscais/notas-fiscais.module';
import { TagsModule } from './tags/tags.module';
import { FornecedoresModule } from './fornecedores/fornecedores.module';
import { NotificacoesModule } from './notificacoes/notificacoes.module';
import { AuditModule } from './audit/audit.module';
import { EmpresaGuard } from './common/guards/empresa.guard';
import { SanitizePipe } from './common/pipes/sanitize.pipe';
import { ReportsModule } from './reports/reports.module';

@Module({
  imports: [
    LoggerModule.forRoot({
      pinoHttp: {
        transport: process.env.NODE_ENV !== 'production' ? { target: 'pino-pretty' } : undefined,
        autoLogging: false,
      },
    }),
    StorageModule,
    QueueModule,
    AuthModule,
    UsersModule,
    CompaniesModule,
    PrismaModule,
    SefazModule,
    DashboardModule,
    NotasFiscaisModule,
    TagsModule,
    FornecedoresModule,
    NotificacoesModule,
    AuditModule,
    ThrottlerModule.forRoot([
      {
        name: 'default',
        ttl: 60000,
        limit: 60,
      },
      {
        name: 'short',
        ttl: 60000,
        limit: 5,
      },
      {
        name: 'nfe-emit',
        ttl: 60000,
        limit: 10,
      },
    ]),
    ReportsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: EmpresaGuard,
    },
    {
      provide: 'APP_PIPE',
      useClass: SanitizePipe,
    },
  ],
})
export class AppModule { }
