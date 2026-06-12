# Regras de Negócio — Sistema TAG

| Código | Regra |
|---|---|
| RN-001 | O sistema será usado inicialmente apenas pela gestão da TAG. |
| RN-002 | O usuário inicial será master e poderá ser inserido via banco. |
| RN-003 | Funcionário deve possuir CPF válido. |
| RN-004 | Funcionário deve possuir RG informado. |
| RN-005 | O RG não terá validação de dígito verificador, UF ou órgão emissor. |
| RN-006 | CPF deve ser único no cadastro de funcionários. |
| RN-007 | RG deve ser único no cadastro de funcionários. |
| RN-008 | Funcionários inativos não podem ser vinculados a novos eventos. |
| RN-009 | Funcionários inativos continuam aparecendo em eventos antigos e relatórios históricos. |
| RN-010 | Todo evento deve possuir casa, tipo, data, horário, diária e valor de HE. |
| RN-011 | O valor da diária é igual para todos os funcionários do evento. |
| RN-012 | O valor da HE é igual para todos os funcionários do evento. |
| RN-013 | Evento cancelado não gera pagamento. |
| RN-014 | Evento finalizado gera pendência de pagamento. |
| RN-015 | O evento deve ser finalizado automaticamente após atingir a data e hora final. |
| RN-016 | Evento em Rascunho pode ser cancelado. |
| RN-017 | Evento em Escalado pode ser cancelado. |
| RN-018 | Evento Finalizado não pode ser cancelado. |
| RN-019 | Evento Finalizado ainda não pago pode ter valor de diária ou HE alterado. |
| RN-020 | Evento Finalizado ainda não pago pode ter funcionário removido ou substituído. |
| RN-021 | Vínculo de funcionário já pago não pode ser removido. |
| RN-022 | Pagamento não pode ser parcial. |
| RN-023 | O usuário não pode pagar apenas alguns eventos de um funcionário. |
| RN-024 | Ao confirmar pagamento, todos os eventos pendentes do funcionário são pagos. |
| RN-025 | Horas extras são inseridas manualmente no detalhe do pagamento. |
| RN-026 | Horas extras não podem ser alteradas após pagamento confirmado. |
| RN-027 | Pagamento confirmado não pode ser editado, cancelado ou estornado. |
| RN-028 | Eventos já pagos não aparecem novamente como pendentes. |
| RN-029 | A escala pode ser emitida dentro do evento ou pela aba Relatórios. |
| RN-030 | A busca de evento por nome deve aceitar busca parcial. |
| RN-031 | O dashboard deve exibir próximos eventos, eventos hoje e funcionários pendentes de pagamento. |
| RN-032 | O sistema não terá integração com API de pagamento. |
| RN-033 | O sistema não emitirá recibo ou comprovante na primeira versão. |
