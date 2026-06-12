# Arquitetura Inicial — Sistema TAG

## Decisão técnica proposta

O sistema será estruturado como uma aplicação web administrativa.

## Stack recomendada

- Frontend: Angular
- Backend: ASP.NET Core / C#
- Banco de dados: PostgreSQL
- Relatórios: exportação em Excel

## Organização sugerida

```text
backend/    API, autenticação, regras de negócio e persistência
frontend/   Interface web administrativa
database/   scripts, migrations, seeds e documentação do banco
docs/       documentação funcional, arquitetura e modelagem
```

## Backend

Responsabilidades:

- autenticação do usuário master;
- regras de negócio;
- cadastros;
- eventos;
- finalização automática de eventos;
- cálculo de pagamentos pendentes;
- confirmação de pagamentos;
- geração de arquivos Excel.

## Frontend

Responsabilidades:

- telas administrativas;
- formulários;
- dashboard;
- listagens;
- detalhes de evento;
- detalhe de pagamento;
- emissão de relatórios.

## Banco de dados

Banco recomendado: PostgreSQL.

O modelo será relacional, com entidades principais para funcionários, casas, tipos de evento, eventos, vínculos de funcionários, pagamentos e itens de pagamento.

## Finalização automática de eventos

A finalização automática poderá ser implementada no backend por meio de uma rotina agendada.

Critério:

```text
status = Escalado
data_evento + hora_fim <= data_hora_atual
```

A rotina deve alterar o status para Finalizado e liberar os vínculos não removidos para pagamento.
