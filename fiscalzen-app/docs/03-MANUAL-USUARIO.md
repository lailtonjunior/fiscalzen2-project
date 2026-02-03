# Manual do Usuário - NFe Master SaaS

## 📖 Introdução

O **NFe Master SaaS** é uma plataforma completa para gestão de documentos fiscais eletrônicos (NFe, CTe, NFCe, NFSe). Com ele, você pode:

- 📥 Consultar e baixar notas fiscais diretamente da SEFAZ
- ✅ Realizar manifestações do destinatário
- 📊 Gerar relatórios e análises avançadas
- 🏷️ Organizar documentos com tags
- 📤 Exportar dados em diversos formatos

---

## 🚀 Primeiros Passos

### 1. Acesso ao Sistema

1. Acesse a URL da aplicação: `https://app.nfemaster.com.br`
2. Faça login com seu e-mail e senha
3. Após o login, você será direcionado para o **Dashboard**

### 2. Configuração Inicial

Antes de começar, configure:

1. **Dados da Empresa**: Acesse `Administração > Empresa` e verifique se os dados estão corretos
2. **Certificado Digital**: Configure seu certificado A1 ou A3 para consulta à SEFAZ
3. **Usuários**: Cadastre os usuários que terão acesso ao sistema

---

## 📊 Dashboard

O Dashboard é sua página inicial, onde você encontra:

### Cards de Resumo

| Card | Descrição |
|------|-----------|
| **Total de Notas** | Quantidade total de notas no sistema |
| **Valor Total** | Soma dos valores de todas as notas |
| **Pendentes Manifestação** | Notas que precisam ser manifestadas |
| **Fornecedores Ativos** | Número de fornecedores diferentes |

### Gráficos

- **Notas por Tipo**: Distribuição entre NFe, CTe, NFCe
- **Status de Manifestação**: Visão geral das manifestações
- **Evolução do Valor**: Valor das notas ao longo do tempo

### Notas Recentes

Lista das últimas notas fiscais recebidas, com opção de visualizar detalhes ou realizar manifestação.

### Pendentes Manifestação

Notas que ainda não foram manifestadas, com alerta visual quando o prazo está próximo do vencimento.

---

## 📄 Notas Fiscais

### Consulta de Notas

1. Acesse o menu **Notas Fiscais**
2. Use a barra de pesquisa para buscar por:
   - Nome do fornecedor
   - CNPJ
   - Chave de acesso
   - Número da nota

### Filtros Avançados

Clique em **Filtros** para refinar sua busca:

- **Período**: Data de emissão (de/até)
- **Tipo**: NFe, CTe, NFCe, NFSe
- **Status SEFAZ**: Autorizada, Cancelada, Denegada
- **Manifestação**: Pendente, Confirmada, Ciência, etc.
- **Valor**: Faixa de valores
- **Tags**: Filtrar por etiquetas

### Visualização de Detalhes

Clique em qualquer nota para ver:

- **Dados Gerais**: Chave de acesso, número, série
- **Emitente**: Dados completos do fornecedor
- **Valores**: Total, produtos, ICMS, frete, etc.
- **Itens**: Produtos/serviços da nota
- **XML**: Visualização do XML completo
- **PDF**: Visualização do DANFe/DACTe

### Download de Arquivos

1. Selecione a nota desejada
2. Clique no menu de ações (três pontos)
3. Escolha **Download**
4. Selecione o formato:
   - **XML**: Arquivo XML oficial da SEFAZ
   - **PDF**: DANFe ou DACTe
   - **Ambos (ZIP)**: XML + PDF compactados

### Download em Lote

1. Selecione múltiplas notas usando os checkboxes
2. Clique em **Download** na barra de ações
3. Os arquivos serão compactados em um único ZIP

---

## ✅ Manifestação do Destinatário

### O que é?

A manifestação do destinatário é um procedimento obrigatório onde você informa à SEFAZ se reconhece ou não a operação descrita na nota fiscal.

### Tipos de Manifestação

| Tipo | Quando Usar | Prazo |
|------|-------------|-------|
| **Ciência da Emissão** | Tomou conhecimento da nota, mas ainda não recebeu a mercadoria | 180 dias |
| **Confirmação da Operação** | Recebeu a mercadoria e confirma a operação | 180 dias |
| **Desconhecimento da Operação** | Não reconhece a operação com o emitente | 180 dias |
| **Operação Não Realizada** | A operação descrita não foi realizada | 180 dias |
| **Desacordo da Operação** | Para CTe, quando há divergências no transporte | 180 dias |

### Como Manifestar

#### Individual

1. Acesse **Manifestação** no menu
2. Localize a nota desejada
3. Clique no botão de ação correspondente
4. Confirme a manifestação

#### Em Lote

1. Acesse **Notas Fiscais**
2. Filtre por "Pendente" em Manifestação
3. Selecione as notas desejadas
4. Clique em **Manifestar** na barra de ações
5. Escolha o tipo de manifestação
6. Confirme

### Justificativa

Para manifestações de **Desconhecimento**, **Não Realizada** ou **Desacordo**, é obrigatório informar uma justificativa.

---

## 📈 Relatórios

### Tipos de Relatórios

#### 1. Geral

- Notas por tipo (NFe, CTe)
- Distribuição por status
- Evolução mensal

#### 2. Fornecedores

- Top fornecedores por valor
- Análise de compras por fornecedor
- Histórico de preços

#### 3. Tributos

- Total de ICMS
- Total de IPI
- PIS/COFINS
- Análise por CFOP

#### 4. Geográfico

- Notas por estado (UF)
- Distribuição geográfica dos fornecedores

### Exportação

Todos os relatórios podem ser exportados em:

- **Excel (.xlsx)**: Para análise em planilhas
- **PDF**: Para impressão e arquivamento
- **CSV**: Para importação em outros sistemas

### Agendamento

(Em desenvolvimento)

Configure relatórios para serem enviados automaticamente por e-mail em periodicidades definidas.

---

## 🏷️ Tags

### O que são Tags?

Tags são etiquetas personalizadas que você pode adicionar às notas fiscais para organização e classificação.

### Criar Tags

1. Acesse o menu **Tags**
2. Clique em **Nova Tag**
3. Informe:
   - Nome da tag
   - Cor (opcional)
4. Salve

### Aplicar Tags

#### Individual

1. Abra os detalhes da nota
2. Clique em **Adicionar Tag**
3. Selecione a tag desejada

#### Em Lote

1. Selecione múltiplas notas
2. Clique em **Adicionar Tag** na barra de ações
3. Selecione a tag

### Tags Pré-definidas

O sistema já vem com algumas tags sugeridas:

- 🟢 **Pago**: Nota já paga
- 🔴 **Importante**: Nota prioritária
- 🟡 **Conferir**: Precisa de revisão
- 🟣 **Divergência**: Com problemas
- 🔵 **Ativo**: Bem patrimonial

---

## 🔔 Notificações

### Tipos de Notificações

| Tipo | Descrição |
|------|-----------|
| **Info** | Informações gerais |
| **Sucesso** | Operações concluídas |
| **Aviso** | Alertas importantes |
| **Erro** | Problemas que precisam atenção |

### Configuração

1. Acesse **Configurações > Notificações**
2. Escolha quais notificações deseja receber:
   - Novas notas disponíveis
   - Prazo de manifestação próximo
   - Erros de integração
   - Backup concluído

### Canais

- **In-app**: Notificações dentro do sistema
- **E-mail**: Envio para caixa de entrada
- **SMS**: (Em desenvolvimento)

---

## 👥 Gestão de Usuários

### Perfis de Acesso

| Perfil | Permissões |
|--------|-----------|
| **Administrador** | Acesso total ao sistema |
| **Gerente** | Gerenciamento de notas, relatórios, usuários |
| **Contador** | Visualização, relatórios, SPED |
| **Operador** | Consulta, download, manifestação |
| **Visualizador** | Apenas visualização |

### Cadastrar Usuário

1. Acesse **Administração > Usuários**
2. Clique em **Novo Usuário**
3. Preencha:
   - Nome completo
   - E-mail
   - Telefone
   - Cargo
   - Perfil de acesso
4. Salve

O usuário receberá um e-mail para definir sua senha.

### Desativar Usuário

1. Acesse **Administração > Usuários**
2. Localize o usuário
3. Clique em **Desativar**
4. Confirme

---

## 🏢 Dados da Empresa

### Informações Cadastrais

Mantenha sempre atualizados:

- Razão Social
- Nome Fantasia
- CNPJ
- Inscrição Estadual
- Inscrição Municipal
- Endereço completo

### Certificado Digital

1. Acesse **Administração > Empresa**
2. Vá para a aba **Certificado**
3. Clique em **Upload do Certificado**
4. Selecione o arquivo (.pfx ou .p12)
5. Informe a senha do certificado
6. Salve

**Importante**: O certificado é necessário para consulta à SEFAZ.

---

## 🔐 Segurança

### Boas Práticas

1. **Senha Forte**: Use pelo menos 8 caracteres, com letras, números e símbolos
2. **MFA**: Ative autenticação de dois fatores (quando disponível)
3. **Logout**: Sempre faça logout ao terminar
4. **Sessão**: Não deixe a sessão aberta em computadores públicos

### Log de Atividades

Todas as ações são registradas:

- Login/Logout
- Downloads
- Manifestações
- Alterações em notas

Acesse **Histórico** para visualizar.

---

## 💡 Dicas e Truques

### Atalhos de Teclado

| Atalho | Ação |
|--------|------|
| `Ctrl + K` | Abrir busca rápida |
| `Ctrl + N` | Nova consulta SEFAZ |
| `Esc` | Fechar modais |
| `?` | Mostrar atalhos |

### Busca Avançada

Use operadores na busca:

- `"termo"`: Busca exata
- `NOT termo`: Exclui termo
- `termo1 AND termo2`: Ambos os termos
- `termo1 OR termo2`: Qualquer um dos termos

### Filtros Salvos

(Em desenvolvimento)

Salve combinações de filtros usadas frequentemente para acesso rápido.

---

## ❓ FAQ - Perguntas Frequentes

### P: Qual o prazo para manifestação?
**R**: 180 dias a partir da data de emissão da nota.

### P: Posso alterar uma manifestação já realizada?
**R**: Não. Manifestações são definitivas e não podem ser alteradas.

### P: O que acontece se não manifestar?
**R**: Após 180 dias, a nota não poderá mais ser manifestada, podendo causar problemas fiscais.

### P: Quantos usuários posso cadastrar?
**R**: Depende do seu plano. Consulte **Administração > Assinatura**.

### P: Os arquivos XML têm validade jurídica?
**R**: Sim, desde que baixados da SEFAZ com a chave de acesso válida.

### P: Posso importar notas de outro sistema?
**R**: Sim, use a função de importação em **Notas Fiscais > Importar**.

### P: Como funciona o backup?
**R**: Backup automático diário, com retenção de 30 dias.

---

## 📞 Suporte

### Canais de Atendimento

- **E-mail**: suporte@nfemaster.com.br
- **Telefone**: (11) 4000-0000
- **Chat**: Disponível no sistema (horário comercial)

### Horário de Atendimento

Segunda a Sexta: 08h às 18h

### Base de Conhecimento

Acesse nossa base de conhecimento em: https://help.nfemaster.com.br

---

## 📚 Glossário

| Termo | Significado |
|-------|-------------|
| **NFe** | Nota Fiscal Eletrônica |
| **CTe** | Conhecimento de Transporte Eletrônico |
| **NFCe** | Nota Fiscal de Consumidor Eletrônica |
| **NFSe** | Nota Fiscal de Serviços Eletrônica |
| **SEFAZ** | Secretaria da Fazenda |
| **DANFe** | Documento Auxiliar da NFe |
| **DACTe** | Documento Auxiliar do CTe |
| **XML** | Formato de arquivo de dados |
| **CFOP** | Código Fiscal de Operações |
| **ICMS** | Imposto sobre Circulação de Mercadorias |
| **IPI** | Imposto sobre Produtos Industrializados |
| **SPED** | Sistema Público de Escrituração Digital |

---

## 📋 Checklist Mensal

- [ ] Verificar notas pendentes de manifestação
- [ ] Conferir relatório de compras
- [ ] Validar saldo de notas do plano
- [ ] Revisar usuários ativos
- [ ] Verificar validade do certificado digital
- [ ] Exportar backup dos dados

---

**Versão do Documento**: 1.0  
**Última Atualização**: Dezembro 2024
