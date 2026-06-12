# TAG Gestão de Segurança

Sistema web para gestão de escalas, eventos e pagamentos da TAG Segurança.

## Objetivo

O sistema tem como objetivo substituir o controle manual feito em planilhas, permitindo que a TAG gerencie funcionários, casas de evento, tipos de evento, eventos, escalas, pagamentos pendentes e relatórios.

## Stack

- Frontend: Angular
- Backend: ASP.NET Core
- Banco de dados: PostgreSQL
- Exportação de relatórios: Excel

## Módulos do MVP

- Login
- Dashboard
- Cadastro de funcionários
- Cadastro de casas
- Cadastro de tipos de evento
- Cadastro de eventos
- Gestão de escala do evento
- Exportação de escala em Excel
- Pagamentos pendentes
- Confirmação de pagamento
- Relatórios de escala

## Estrutura do Projeto

```text
backend/    API e regras de negócio
frontend/   Interface web
database/   Scripts, migrations e seeds
docs/       Documentação funcional, técnica e modelagem
