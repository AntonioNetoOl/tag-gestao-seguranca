# Frontend — Autenticação e Dashboard

Branch de implementação:

```text
feature/frontend-auth-dashboard
```

## O que foi implementado

- Workspace Angular na raiz do repositório.
- Configuração de build e serve pelo Angular CLI.
- Environment local apontando para `http://localhost:5000/api`.
- Tela pública `/login`.
- `AuthService` com login, logout e armazenamento do JWT.
- Interceptor HTTP para enviar `Authorization: Bearer {token}`.
- Guard protegendo a área logada.
- Layout administrativo com menu lateral e topbar.
- Rota protegida `/dashboard`.
- Dashboard consumindo `GET /api/dashboard`.
- Tratamento de erro lendo `error.mensagem` retornado pela API.

## Pré-requisitos locais

- Backend rodando em `http://localhost:5000`.
- Banco PostgreSQL local ativo via Docker.
- Usuário master configurado no backend.
- Node.js compatível com Angular 20.

## Comandos para testar

Na pasta do frontend:

```powershell
git checkout main
git pull origin main
git fetch origin feature/frontend-auth-dashboard
git checkout feature/frontend-auth-dashboard
npm install
npm start
```

Acesse:

```text
http://localhost:4200/login
```

Credenciais usadas no ambiente local:

```json
{
  "email": "admin@tag.com",
  "senha": "Admin@123456"
}
```

## Fluxo esperado

1. Acessar `/login`.
2. Informar e-mail e senha.
3. O frontend chama `POST /api/auth/login`.
4. O token é salvo no navegador.
5. O usuário é redirecionado para `/dashboard`.
6. O interceptor envia o token nas chamadas protegidas.
7. O dashboard chama `GET /api/dashboard` e exibe os cards e próximos eventos.

## Observações

- A branch ainda não implementa CRUDs de funcionários, casas, tipos de evento, eventos, pagamentos ou relatórios.
- Os links do menu já foram deixados como base visual, mas as rotas dessas telas serão implementadas nas próximas etapas.
- O environment de produção usa `/api` como URL relativa e deve ser ajustado conforme a estratégia de deploy.
