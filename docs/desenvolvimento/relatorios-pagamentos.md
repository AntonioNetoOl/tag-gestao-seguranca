# Relatório de Pagamentos

## Objetivo

Disponibilizar a emissão do relatório geral de pagamentos confirmados a partir do menu lateral em `Relatórios > Pagamentos`.

## Tela

Rota habilitada:

```text
/relatorios/pagamentos
```

A tela exibe um card funcional direto, sem cabeçalho superior adicional, seguindo o mesmo padrão visual do relatório de escalas.

## Filtros

- Busca opcional por nome, CPF, RG, evento, casa ou chave Pix.
- Data inicial obrigatória.
- Data final obrigatória.

Ao abrir a tela, o período é preenchido automaticamente com os últimos 7 dias.

## Exportação

O botão `Emitir Relatório de Pagamentos` abre um modal para escolha do formato:

- Excel
- PDF

Após a emissão, o download é iniciado automaticamente e o usuário recebe feedback visual de sucesso.

## Regra operacional

O relatório considera apenas pagamentos já confirmados. O período é aplicado sobre a data de pagamento, alinhado ao fuso operacional usado na listagem de pagamentos confirmados.

## Arquivos alterados

- `src/app/app.routes.ts`
- `src/app/features/relatorios/relatorios.models.ts`
- `src/app/features/relatorios/relatorios.service.ts`
- `src/app/features/relatorios/relatorios-pagamentos.component.ts`
- `src/app/features/relatorios/relatorios-pagamentos.component.html`
- `src/app/features/relatorios/relatorios.component.css`
