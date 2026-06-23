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
    FUNCIONARIO ||--o{ PAGAMENTO : recebe
    PAGAMENTO ||--o{ PAGAMENTO_ITEM : possui
    EVENTO_FUNCIONARIO ||--o| PAGAMENTO_ITEM : pago_em
```

## Observação sobre funções de funcionário

A entidade `FUNCAO_FUNCIONARIO` é um cadastro mestre usado para alimentar o campo `funcao` do cadastro de funcionários no frontend.

O relacionamento é feito por `FUNCIONARIO.funcao_funcionario_id -> FUNCAO_FUNCIONARIO.id`. O campo textual `FUNCIONARIO.funcao` permanece como valor desnormalizado para compatibilidade visual e relatórios.
