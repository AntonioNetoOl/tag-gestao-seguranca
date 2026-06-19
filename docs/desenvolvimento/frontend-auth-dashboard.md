# Frontend — Autenticação, Layout e Dashboard

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
- Layout administrativo com menu lateral, topbar e transições leves.
- Menu lateral retrátil, aberto por padrão, com botão de três traços.
- Ícones SVG próprios no menu lateral, sem dependência externa.
- Grupo `Cadastros` com subníveis: funcionários, casas, tipos de evento e usuários.
- Rota de usuários reservada no frontend para implementação posterior do CRUD no backend.
- Rotas protegidas para módulos administrativos ainda pendentes, com tela base visual.
- Rota protegida `/dashboard`.
- Dashboard consumindo `GET /api/dashboard`.
- Tratamento de erro lendo `error.mensagem` retornado pela API.
- Configuração do router para restaurar scroll no topo e recarregar navegação na mesma URL.
- Base global de estilos para botões, cards, campos, badges e modais.

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
git pull
npm install
npm start
```

Se o PowerShell bloquear `npm.ps1`, usar:

```powershell
& "C:\Program Files\nodejs\npm.cmd" install
& "C:\Program Files\nodejs\npm.cmd" start
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
8. O menu lateral inicia aberto e pode ser recolhido pelo botão de três traços.
9. O grupo `Cadastros` abre/fecha os subníveis de funcionários, casas, tipos de evento e usuários.

## Rotas administrativas já reservadas

- `/dashboard`
- `/funcionarios`
- `/casas`
- `/tipos-evento`
- `/usuarios`
- `/eventos`
- `/pagamentos`
- `/relatorios`

## Observações

- A branch ainda não implementa CRUDs completos de funcionários, casas, tipos de evento, usuários, eventos, pagamentos ou relatórios.
- As telas pendentes possuem páginas base para evitar redirecionamento inesperado ao dashboard durante os testes de navegação.
- O environment de produção usa `/api` como URL relativa e deve ser ajustado conforme a estratégia de deploy.
