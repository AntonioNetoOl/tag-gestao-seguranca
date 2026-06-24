# Modelo Entidade-Relacionamento — Sistema TAG

```mermaid
erDiagram
    USUARIO {
        uuid id
        string nome
        string email
        string senha_hash
        string perfil
        boolean ativo
        datetime data_criacao
    }

    FUNCIONARIO {
        uuid id
        string nome_completo
        string rg
        string cpf
        string chave_pix
        string telefone
        string email
        uuid funcao_funcionario_id
        string funcao
        boolean ativo
        uuid usuario_criacao_id
        datetime data_criacao
        uuid usuario_alteracao_id
        datetime data_alteracao
    }

    FUNCAO_FUNCIONARIO {
        uuid id
        string nome
        boolean ativo
        uuid usuario_criacao_id
        datetime data_criacao
        uuid usuario_alteracao_id
        datetime data_alteracao
    }

    CASA {
        uuid id
        string nome
        string endereco
        string cep
        uuid usuario_criacao_id
        datetime data_criacao
        uuid usuario_alteracao_id
        datetime data_alteracao
    }

    TIPO_EVENTO {
        uuid id
        string nome
        boolean ativo
        uuid usuario_criacao_id
        datetime data_criacao
        uuid usuario_alteracao_id
        datetime data_alteracao
    }

    EVENTO {
        uuid id
        uuid casa_id
        uuid tipo_evento_id
        string nome
        date data_evento
        time hora_inicio
        time hora_fim
        decimal valor_diaria
        decimal valor_hora_extra
        string status
        uuid usuario_criacao_id
        datetime data_criacao
        uuid usuario_alteracao_id
        datetime data_alteracao
    }

    EVENTO_FUNCIONARIO {
        uuid id
        uuid evento_id
        uuid funcionario_id
        boolean pago
        boolean removido
        string motivo_remocao
        uuid pagamento_item_id
        uuid usuario_criacao_id
        datetime data_criacao
        uuid usuario_alteracao_id
        datetime data_alteracao
    }

    EVENTO_FUNCIONARIO_HISTORICO {
        uuid id
        uuid evento_id
        uuid evento_funcionario_id
        uuid funcionario_anterior_id
        uuid funcionario_novo_id
        string acao
        string motivo
        string observacao
        uuid usuario_acao_id
        datetime data_acao
    }

    PAGAMENTO {
        uuid id
        uuid funcionario_id
        date data_pagamento
        decimal valor_total
        decimal total_horas_extras
        int quantidade_eventos
        string status
        uuid usuario_pagamento_id
        datetime data_criacao
    }

    PAGAMENTO_ITEM {
        uuid id
        uuid pagamento_id
        uuid evento_funcionario_id
        decimal valor_diaria_pago
        decimal valor_hora_extra_pago
        decimal quantidade_horas_extras
        decimal valor_total_item
    }

    FUNCAO_FUNCIONARIO ||--o{ FUNCIONARIO : define
    CASA ||--o{ EVENTO : possui
    TIPO_EVENTO ||--o{ EVENTO : classifica
    EVENTO ||--o{ EVENTO_FUNCIONARIO : possui
    FUNCIONARIO ||--o{ EVENTO_FUNCIONARIO : trabalha
    EVENTO ||--o{ EVENTO_FUNCIONARIO_HISTORICO : audita
    EVENTO_FUNCIONARIO ||--o{ EVENTO_FUNCIONARIO_HISTORICO : registra_vinculo
    FUNCIONARIO ||--o{ EVENTO_FUNCIONARIO_HISTORICO : funcionario_anterior
    FUNCIONARIO ||--o{ EVENTO_FUNCIONARIO_HISTORICO : funcionario_novo
    USUARIO ||--o{ EVENTO_FUNCIONARIO_HISTORICO : executa
    FUNCIONARIO ||--o{ PAGAMENTO : recebe
    PAGAMENTO ||--o{ PAGAMENTO_ITEM : possui
    EVENTO_FUNCIONARIO ||--o| PAGAMENTO_ITEM : pago_em
```

## Observação sobre funções de funcionário

A entidade `FUNCAO_FUNCIONARIO` é um cadastro mestre usado para alimentar o campo `funcao` do cadastro de funcionários no frontend.

O relacionamento é feito por `FUNCIONARIO.funcao_funcionario_id -> FUNCAO_FUNCIONARIO.id`. O campo textual `FUNCIONARIO.funcao` permanece como valor desnormalizado para compatibilidade visual e relatórios.

## Observação sobre escala e auditoria operacional

A tabela `EVENTO_FUNCIONARIO` representa o estado atual da escala do evento: funcionário vinculado, removido ou pago.

A tabela `EVENTO_FUNCIONARIO_HISTORICO` registra a trilha operacional das alterações feitas na escala. Ela não substitui o vínculo atual; serve para rastrear ações futuras em relatórios e auditorias.

Ações previstas no histórico:

- `AdicionarFuncionario`
- `ReativarFuncionario`
- `RemoverFuncionario`
- `SubstituirFuncionario`
- `FinalizarEscala`
- `CancelarFinalizacaoEscala`

Campos principais do histórico:

- `evento_id`: evento afetado;
- `evento_funcionario_id`: vínculo afetado, quando existir;
- `funcionario_anterior_id`: funcionário removido ou substituído;
- `funcionario_novo_id`: funcionário adicionado, reativado ou substituto;
- `acao`: tipo da operação realizada;
- `motivo`: justificativa operacional, quando exigida;
- `usuario_acao_id`: usuário que executou a ação;
- `data_acao`: data/hora da ação.

## Status operacional do evento

Status atuais de evento:

- `Rascunho`: evento criado e ainda editável; permite montar a escala.
- `Escalado`: escala finalizada pelo usuário; bloqueia edição cadastral do evento e inclusão direta de novos funcionários.
- `Finalizado`: evento encerrado operacionalmente; não permite edição cadastral nem cancelamento, mas ainda permite ajustes justificados na escala enquanto houver vínculos não pagos.
- `Cancelado`: evento excluído/cancelado operacionalmente; não aparece na listagem de operação.
