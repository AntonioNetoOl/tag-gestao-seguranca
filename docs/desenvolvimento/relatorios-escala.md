# Relatórios de Escala

Etapa: `feature/relatorios-escala`.

## Objetivo

Habilitar a aba Relatórios para emissão do relatório geral de escalas.

Nesta etapa, o relatório de pagamentos fica apenas sinalizado como próxima etapa, porque será implementado depois da conclusão da aba Pagamentos.

## Tela

Rota:

```text
/relatorios
```

Filtros disponíveis para o relatório de escala:

- data inicial, obrigatória;
- data final, obrigatória;
- casa, opcional;
- nome do evento, opcional.

A emissão abre um popup para escolha do formato:

- Excel;
- PDF.

Após emitir, o download é iniciado automaticamente e o popup exibe a animação de sucesso.

## Regra operacional

O relatório geral de escala considera apenas eventos com status `Escalado`.

Não entram no relatório:

- eventos em `Rascunho`;
- eventos `Cancelado`;
- eventos `Finalizado`.

## Endpoints consumidos

```text
GET /api/relatorios/escalas/excel
GET /api/relatorios/escalas/pdf
```

Parâmetros:

```text
casaId?      uuid opcional
dataInicio   date obrigatório
dataFim      date obrigatório
nomeEvento?  string opcional
```
