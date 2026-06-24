# Relatórios de Escala

Etapa: `feature/relatorios-escala`.

## Objetivo

Habilitar o subnível **Relatórios > Escala** para emissão do relatório geral de escalas.

Nesta etapa, o subnível **Relatórios > Pagamentos** fica roteado como próxima etapa, porque será implementado depois da conclusão da aba Pagamentos.

## Navegação

A barra lateral possui o grupo expansível **Relatórios**, com os subníveis:

```text
Relatórios
├── Escala
└── Pagamentos
```

Rotas:

```text
/relatorios/escalas
/relatorios/pagamentos
```

A rota `/relatorios` redireciona para `/relatorios/escalas`.

## Tela de Escala

A tela de escala não possui card superior de apresentação. O conteúdo começa diretamente pelo card funcional do relatório.

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
