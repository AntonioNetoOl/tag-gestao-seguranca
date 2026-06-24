# Regras de Negócio — Sistema TAG

| Código | Regra |
|---|---|
| RN-001 | O sistema será usado inicialmente apenas pela gestão da TAG. |
| RN-002 | O usuário inicial será master e poderá ser inserido via banco. |
| RN-003 | Funcionário deve possuir CPF válido. |
| RN-004 | Funcionário deve possuir RG informado. |
| RN-005 | O RG não terá validação de dígito verificador, UF ou órgão emissor. |
| RN-006 | CPF deve ser único no cadastro de funcionários ativos. |
| RN-007 | RG deve ser único no cadastro de funcionários ativos. |
| RN-008 | Funcionários inativos não podem ser vinculados a novos eventos. |
| RN-009 | Funcionários inativos continuam aparecendo em eventos antigos e relatórios históricos. |
| RN-010 | Todo evento deve possuir casa, tipo, data, horário, diária e valor de HE. |
| RN-011 | O valor da diária é igual para todos os funcionários do evento. |
| RN-012 | O valor da HE é igual para todos os funcionários do evento. |
| RN-013 | Evento cancelado não gera pagamento. |
| RN-014 | Evento finalizado gera pendência de pagamento. |
| RN-015 | O evento deve ser finalizado automaticamente após atingir a data e hora final. |
| RN-016 | Evento em Rascunho pode ser cancelado. |
| RN-017 | Evento em Escalado pode ser cancelado antes da finalização operacional. |
| RN-018 | Evento Finalizado não pode ser cancelado. |
| RN-019 | Evento Escalado não pode ter cadastro alterado; para editar casa, tipo, nome, data, horário ou valores, é necessário cancelar a finalização da escala. |
| RN-020 | Evento Finalizado não pode ter cadastro alterado. |
| RN-021 | Evento Finalizado ainda não pago pode ter funcionário removido ou substituído, com justificativa operacional. |
| RN-022 | Vínculo de funcionário já pago não pode ser removido ou substituído. |
| RN-023 | Pagamento não pode ser parcial. |
| RN-024 | O usuário não pode pagar apenas alguns eventos de um funcionário. |
| RN-025 | Ao confirmar pagamento, todos os eventos pendentes do funcionário são pagos. |
| RN-026 | Horas extras são inseridas manualmente no detalhe do pagamento. |
| RN-027 | Horas extras não podem ser alteradas após pagamento confirmado. |
| RN-028 | Pagamento confirmado não pode ser editado, cancelado ou estornado. |
| RN-029 | Eventos já pagos não aparecem novamente como pendentes. |
| RN-030 | A escala pode ser emitida dentro do evento ou pela aba Relatórios. |
| RN-031 | A busca de evento por nome deve aceitar busca parcial. |
| RN-032 | O dashboard deve exibir próximos eventos, eventos hoje e funcionários pendentes de pagamento. |
| RN-033 | O sistema não terá integração com API de pagamento. |
| RN-034 | O sistema não emitirá recibo ou comprovante na primeira versão. |
| RN-035 | A data do evento não pode ser anterior à data operacional atual. |
| RN-036 | A data do evento representa a data de início. Se a hora fim for menor que a hora início, o evento cruza para o dia seguinte. |
| RN-037 | Hora fim igual à hora início não é permitida. |
| RN-038 | O valor da diária deve ser maior que zero. |
| RN-039 | O valor da hora extra não pode ser negativo. |
| RN-040 | Adicionar funcionário não altera o evento para Escalado. |
| RN-041 | O evento só muda para Escalado quando o usuário confirma Finalizar escala. |
| RN-042 | Após finalizar escala, a inclusão direta de novos funcionários fica bloqueada. |
| RN-043 | Para incluir novos funcionários em evento Escalado, o usuário deve cancelar a finalização da escala, voltando o evento para Rascunho. |
| RN-044 | Cancelar finalização da escala é permitido somente para evento Escalado sem vínculo pago. |
| RN-045 | Cancelar finalização da escala não é permitido para evento Cancelado ou Finalizado. |
| RN-046 | Remoção de funcionário em escala Rascunho exige apenas confirmação. |
| RN-047 | Remoção de funcionário em evento Escalado ou Finalizado exige justificativa. |
| RN-048 | Substituição de funcionário exige novo funcionário ativo, diferente do antigo e ainda não vinculado à escala ativa. |
| RN-049 | Toda ação operacional relevante da escala deve ser registrada em histórico de auditoria. |
| RN-050 | A tela Eventos é uma tela operacional e não deve listar eventos cancelados nem eventos finalizados fora da janela operacional de ajuste. |
