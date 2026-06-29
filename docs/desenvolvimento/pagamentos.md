# Pagamentos — Frontend

Etapa: `feature/pagamentos-v1`.

## Objetivo

Substituir o placeholder da rota `/pagamentos` por uma tela financeira funcional.

## Estrutura da tela

A tela possui duas abas internas:

```text
Pagamentos
├── Pendentes
└── Confirmados
```

## Pendentes

Lista funcionários com pagamentos pendentes, agrupando eventos finalizados ainda não pagos.

Campos principais:

- funcionário;
- função;
- RG e CPF;
- meio de pagamento;
- quantidade de eventos;
- total estimado sem horas extras;
- ação para abrir o pagamento.

No detalhe do pagamento pendente, o usuário informa a quantidade de horas extras por evento. O total é recalculado no frontend conforme a fórmula:

```text
total item = diária + (quantidade HE * valor HE)
```

Antes de confirmar, a tela exibe popup de confirmação informando que a ação é definitiva.

## Confirmados

Lista pagamentos já confirmados com filtros por busca e período de pagamento.

O detalhe de pagamento confirmado é somente leitura.

## Validações da tela

- Quantidade de HE por evento deve ficar entre 0 e 24.
- Pagamento confirmado não é editável pela interface.
- Erros retornados pela API são exibidos nos popups padronizados.
