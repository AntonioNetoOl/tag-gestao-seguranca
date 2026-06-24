# TAG Gestão de Segurança — Frontend

Frontend web administrativo do sistema TAG Gestão de Segurança.

## Objetivo

Este repositório contém a interface web do sistema TAG, responsável por permitir que a gestão da empresa controle funcionários, casas de evento, tipos de evento, eventos, escalas, pagamentos pendentes e relatórios.

O backend/API é mantido em um repositório separado:

```text
AntonioNetoOl/tag-gestao-seguranca-api
```

## Stack do frontend

- Angular 20 LTS
- TypeScript
- HTML/CSS
- Consumo de API REST
- Autenticação JWT

## Status atual

A base funcional do frontend foi implementada de forma incremental nas branches de autenticação, cadastros e operação.

A etapa atual de operação está na branch:

```text
feature/operacao-escala-evento
```

Ela contém:

- workspace Angular na raiz;
- tela pública `/login`;
- `AuthService` com armazenamento de JWT;
- interceptor HTTP com `Authorization: Bearer`;
- guard de autenticação;
- layout administrativo com menu lateral retrátil;
- rota protegida `/dashboard`;
- dashboard inicial consumindo `GET /api/dashboard`;
- cadastro de funcionários com listagem, filtros, paginação, modal, máscaras e ações de ativar/inativar;
- seleção de função no cadastro de funcionário;
- cadastro rápido de função pelo botão `+` ao lado do campo Função;
- cadastro de casas com listagem, busca, paginação, modal, máscara de CEP e exclusão protegida por confirmação;
- cadastro de tipos de evento;
- tela operacional de eventos;
- criação e edição de eventos em rascunho;
- bloqueio de edição para eventos com escala finalizada;
- montagem de escala por evento;
- finalização e cancelamento de finalização da escala;
- substituição e remoção de funcionários da escala;
- emissão da escala em Excel/PDF por evento.

## Pré-requisitos

- Node.js compatível com Angular 20.
- Backend rodando em `http://localhost:5000`.
- PostgreSQL local ativo.
- Usuário master configurado no backend.
- Tabela `funcoes_funcionario` criada no backend para alimentar o campo Função.
- Migration `20260624120000_AddEventoFuncionarioHistorico` aplicada para auditoria da escala.

## Como executar localmente

```powershell
npm install
npm start
```

Depois acesse:

```text
http://localhost:4200/login
```

Credenciais locais usadas durante o desenvolvimento:

```json
{
  "email": "admin@tag.com",
  "senha": "Admin@123456"
}
```

## URL local da API

```text
http://localhost:5000/api
```

Essa URL está configurada em:

```text
src/environments/environment.ts
```

## Integração com funções de funcionário

O campo Função do cadastro de funcionários consome:

```text
GET /api/funcoes-funcionario/opcoes
POST /api/funcoes-funcionario
```

A criação rápida pelo botão `+` abre um modal simples, grava a função no backend e recarrega a lista de opções.

## Integração com casas

O cadastro de casas consome:

```text
GET    /api/casas
POST   /api/casas
PUT    /api/casas/{id}
DELETE /api/casas/{id}
```

A exclusão é validada no backend e não é permitida quando a casa possui eventos vinculados.

## Integração com eventos e escala

A tela Eventos consome a listagem operacional:

```text
GET /api/eventos?apenasOperacao=true
```

A tela de escala do evento consome:

```text
GET    /api/eventos/{id}
GET    /api/eventos/{eventoId}/funcionarios
POST   /api/eventos/{eventoId}/funcionarios
POST   /api/eventos/{eventoId}/funcionarios/finalizar
POST   /api/eventos/{eventoId}/funcionarios/cancelar-finalizacao
DELETE /api/eventos/{eventoId}/funcionarios/{funcionarioId}
POST   /api/eventos/{eventoId}/funcionarios/substituir
GET    /api/eventos/{id}/escala/excel
GET    /api/eventos/{id}/escala/pdf
```

Regras visuais principais:

- eventos em `Rascunho` podem ser editados e receber funcionários;
- eventos `Escalado` não podem ser editados pela tela de eventos;
- para editar evento `Escalado`, o usuário deve abrir a escala e cancelar a finalização;
- eventos `Finalizado` não podem ser editados cadastralmente;
- a coluna Data/Horário mostra data inicial e final quando o evento cruza a meia-noite;
- erros devem aparecer em popup, não em faixa fixa na tela.

## Estrutura principal

```text
src/
├── app
│   ├── core
│   │   ├── api
│   │   ├── auth
│   │   └── layout
│   └── features
│       ├── auth
│       ├── dashboard
│       ├── casas
│       ├── eventos
│       ├── funcionarios
│       ├── funcoes-funcionario
│       └── tipos-evento
├── environments
├── index.html
├── main.ts
└── styles.css
```

## Módulos previstos no frontend

- Login
- Dashboard
- Cadastro de funcionários
- Cadastro de funções de funcionário
- Cadastro de casas
- Cadastro de tipos de evento
- Cadastro de eventos
- Gestão de escala do evento
- Emissão de escala em Excel/PDF
- Pagamentos pendentes
- Confirmação de pagamento
- Histórico de pagamentos
- Relatórios

## Documentação

- `docs/funcional/visao-geral.md`
- `docs/funcional/regras-de-negocio.md`
- `docs/modelagem/fluxos.md`
- `docs/modelagem/modelo-entidade-relacionamento.md`
- `docs/arquitetura/arquitetura-frontend.md`
- `docs/desenvolvimento/frontend-auth-dashboard.md`
