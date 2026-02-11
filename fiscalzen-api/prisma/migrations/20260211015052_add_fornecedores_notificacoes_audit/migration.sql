/*
  Warnings:

  - A unique constraint covering the columns `[empresa_id,nome]` on the table `tags` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateTable
CREATE TABLE "fornecedores" (
    "id" TEXT NOT NULL,
    "cnpj" TEXT NOT NULL,
    "razao_social" TEXT NOT NULL,
    "nome_fantasia" TEXT,
    "email" TEXT,
    "telefone" TEXT,
    "observacoes" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "empresa_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fornecedores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notificacoes" (
    "id" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "mensagem" TEXT NOT NULL,
    "lida" BOOLEAN NOT NULL DEFAULT false,
    "dados_extra" JSONB,
    "usuario_id" TEXT,
    "empresa_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notificacoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "acao" TEXT NOT NULL,
    "entidade" TEXT NOT NULL,
    "entidade_id" TEXT,
    "dados" JSONB,
    "usuario_id" TEXT,
    "empresa_id" TEXT NOT NULL,
    "ip_origem" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "fornecedores_empresa_id_idx" ON "fornecedores"("empresa_id");

-- CreateIndex
CREATE UNIQUE INDEX "fornecedores_empresa_id_cnpj_key" ON "fornecedores"("empresa_id", "cnpj");

-- CreateIndex
CREATE INDEX "notificacoes_empresa_id_lida_idx" ON "notificacoes"("empresa_id", "lida");

-- CreateIndex
CREATE INDEX "notificacoes_usuario_id_idx" ON "notificacoes"("usuario_id");

-- CreateIndex
CREATE INDEX "audit_logs_empresa_id_created_at_idx" ON "audit_logs"("empresa_id", "created_at");

-- CreateIndex
CREATE INDEX "audit_logs_entidade_entidade_id_idx" ON "audit_logs"("entidade", "entidade_id");

-- CreateIndex
CREATE INDEX "audit_logs_usuario_id_idx" ON "audit_logs"("usuario_id");

-- CreateIndex
CREATE INDEX "notas_fiscais_emitente_cnpj_idx" ON "notas_fiscais"("emitente_cnpj");

-- CreateIndex
CREATE INDEX "notas_fiscais_status_manifestacao_idx" ON "notas_fiscais"("status_manifestacao");

-- CreateIndex
CREATE INDEX "notas_fiscais_empresa_id_status_manifestacao_idx" ON "notas_fiscais"("empresa_id", "status_manifestacao");

-- CreateIndex
CREATE UNIQUE INDEX "tags_empresa_id_nome_key" ON "tags"("empresa_id", "nome");

-- AddForeignKey
ALTER TABLE "fornecedores" ADD CONSTRAINT "fornecedores_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "empresas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notificacoes" ADD CONSTRAINT "notificacoes_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notificacoes" ADD CONSTRAINT "notificacoes_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "empresas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
