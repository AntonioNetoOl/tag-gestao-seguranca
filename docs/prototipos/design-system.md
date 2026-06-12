# Design System Inicial — TAG Gestão de Segurança

## Direção visual

O sistema deve transmitir controle, organização e segurança.

A interface deve ser administrativa, profissional e objetiva, evitando excesso de elementos visuais.

## Estilo recomendado

- Layout com menu lateral fixo.
- Topbar simples com nome da tela e usuário logado.
- Fundo claro em cinza muito suave.
- Cards brancos com sombra leve.
- Tabelas com boa leitura e ações visíveis.
- Botões primários bem destacados.
- Status com cores consistentes.

## Estrutura base

```text
+--------------------------------------------------------------------------------+
| Sidebar              | Topbar                                                   |
|                      +----------------------------------------------------------+
| Dashboard            | Conteúdo da tela                                         |
| Funcionários         |                                                          |
| Casas                |                                                          |
| Tipos de evento      |                                                          |
| Eventos              |                                                          |
| Pagamentos           |                                                          |
| Relatórios           |                                                          |
+--------------------------------------------------------------------------------+
```

## Paleta sugerida

| Uso | Cor sugerida | Observação |
|---|---|---|
| Primária | Azul escuro | Botões principais, menu ativo |
| Secundária | Cinza escuro | Textos e títulos |
| Fundo | Cinza claro | Fundo geral da aplicação |
| Card | Branco | Áreas de conteúdo |
| Sucesso | Verde | Pago, ativo, finalizado |
| Alerta | Amarelo/Laranja | Pendente, atenção |
| Erro | Vermelho | Cancelado, inválido |

## Componentes principais

### Botões

- Primário: ações de salvar, confirmar e emitir.
- Secundário: cancelar, voltar e limpar filtros.
- Perigo: remover, cancelar evento.

### Tabelas

As tabelas devem possuir:

- cabeçalho fixo visualmente destacado;
- busca rápida quando aplicável;
- filtros no topo;
- coluna de ações à direita;
- badges para status.

### Formulários

Os formulários devem usar:

- campos agrupados por assunto;
- labels sempre visíveis;
- indicação clara de obrigatoriedade;
- validação próxima ao campo;
- botões no rodapé da tela ou card.

## Status visuais

| Status | Aparência sugerida |
|---|---|
| Rascunho | Badge cinza |
| Escalado | Badge azul |
| Finalizado | Badge verde |
| Cancelado | Badge vermelho |
| Pendente pagamento | Badge laranja |
| Pago | Badge verde |

## Layout responsivo

Prioridade inicial: desktop.

Resolução de referência:

```text
1366x768
1440x900
1920x1080
```

Em telas menores, o menu lateral pode ser recolhido.
