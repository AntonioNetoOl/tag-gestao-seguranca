# Visão Geral — Sistema TAG

## Objetivo

O sistema TAG é uma aplicação web para gestão operacional de uma empresa de segurança.

A aplicação substitui controles feitos em planilhas, centralizando cadastros, eventos, escalas, pagamentos pendentes e relatórios.

## Usuários

Inicialmente, o sistema será usado apenas pela gestão da TAG.

Não haverá acesso para funcionários, clientes ou terceiros no MVP.

## Módulos do MVP

- Login
- Dashboard
- Cadastro de funcionários
- Cadastro de funções de funcionário
- Cadastro de casas
- Cadastro de tipos de evento
- Operação de eventos
- Gestão de escala por evento
- Exportação de escala em Excel e PDF
- Pagamentos pendentes
- Confirmação de pagamento
- Relatórios de escala

## Operação de eventos

A tela Eventos é uma tela operacional. Ela lista eventos em preparação, escalados e finalizados dentro da janela de ajuste operacional.

Não é uma tela histórica. Eventos cancelados e eventos finalizados fora da janela operacional devem sair da listagem de operação.

Principais regras da operação:

- evento nasce em `Rascunho`;
- funcionários podem ser adicionados enquanto o evento está em `Rascunho`;
- a escala só é considerada finalizada quando o usuário confirma `Finalizar escala`;
- evento `Escalado` bloqueia edição cadastral de casa, tipo, nome, data, horário e valores;
- para editar um evento `Escalado`, o usuário deve cancelar a finalização da escala;
- evento `Finalizado` não permite edição cadastral;
- substituição ou remoção em escala já finalizada exige rastreio operacional;
- vínculo pago não pode ser removido ou substituído.

## Auditoria operacional da escala

O estado atual da escala fica em `evento_funcionarios`.

O histórico de ações da escala fica em `evento_funcionarios_historico`, registrando ação, usuário, data, funcionário anterior, funcionário novo e motivo quando aplicável.

Essa separação evita misturar estado atual com trilha de auditoria e prepara o sistema para relatórios futuros.

## Stack proposta

- Frontend: Angular
- Backend: ASP.NET Core
- Banco de dados: PostgreSQL
