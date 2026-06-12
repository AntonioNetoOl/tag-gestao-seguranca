# Arquitetura Frontend — Sistema TAG

## Objetivo

Este documento descreve a arquitetura inicial do frontend web administrativo do sistema TAG Gestão de Segurança.

## Stack

- Angular
- TypeScript
- HTML/CSS
- Consumo de API REST

## Papel deste repositório

Este repositório conterá somente a aplicação frontend.

O backend/API será mantido em um repositório separado, previsto como:

```text
tag-gestao-seguranca-api
```

## Organização esperada

Quando o projeto Angular for criado, a estrutura principal deverá ficar na raiz:

```text
src/
public/
docs/
angular.json
package.json
tsconfig.json
README.md
.gitignore
```

## Módulos de interface previstos

- Login
- Dashboard
- Funcionários
- Casas
- Tipos de evento
- Eventos
- Escalas
- Pagamentos
- Relatórios

## Comunicação com API

O frontend deverá consumir uma API REST responsável por autenticação, regras de negócio, persistência, pagamentos e geração de relatórios.

## Observação

A implementação do backend, banco de dados e migrations não deve ficar neste repositório.
