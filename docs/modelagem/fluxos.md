# Fluxos do Sistema — TAG

## Fluxo operacional principal

```mermaid
flowchart TD
    A[Cadastro de Funcionários] --> D[Criação do Evento]
    B[Cadastro de Casas] --> D
    C[Cadastro de Tipo de Evento] --> D
    D --> E[Evento em Rascunho]
    E --> F[Vincular Funcionários Ativos]
    F --> E
    E --> G{Finalizar escala?}
    G -- Sim --> H[Evento Escalado]
    H --> I[Emitir Relatório da Escala]
    I --> I1[Excel ou PDF]
    H --> J{Precisa ajustar cadastro do evento?}
    J -- Sim --> K[Cancelar finalização da escala]
    K --> E
    J -- Não --> L{Chegou data e hora fim?}
    L -- Sim --> M[Finalizar Evento Automaticamente]
    M --> N[Gerar Pendência de Pagamento]
    N --> O[Listar Funcionário em Pagamentos Pendentes]
    O --> P[Abrir Detalhe do Pagamento]
    P --> Q[Inserir Horas Extras Manualmente]
    Q --> R[Confirmar Pagamento]
```

## Fluxo de escala do evento

```mermaid
flowchart TD
    A[Evento em Rascunho] --> B[Adicionar funcionário]
    B --> C[Registrar vínculo em evento_funcionarios]
    C --> D[Registrar AdicionarFuncionario no histórico]
    D --> A
    A --> E{Usuário finaliza escala?}
    E -- Sim --> F[Status = Escalado]
    F --> G[Registrar FinalizarEscala no histórico]
    G --> H[Bloquear inclusão direta de funcionário]
    H --> I{Precisa incluir mais alguém?}
    I -- Sim --> J[Cancelar finalização]
    J --> K[Status = Rascunho]
    K --> L[Registrar CancelarFinalizacaoEscala no histórico]
    L --> A
    I -- Não --> M[Manter escala finalizada]
```

## Substituição e remoção de funcionário

```mermaid
flowchart TD
    A[Escala do evento] --> B{Evento cancelado?}
    B -- Sim --> C[Bloquear alteração]
    B -- Não --> D{Vínculo já pago?}
    D -- Sim --> E[Bloquear alteração]
    D -- Não --> F{Remover ou substituir?}
    F -- Remover em Rascunho --> G[Confirmar remoção simples]
    F -- Remover em Escalado ou Finalizado --> H[Exigir justificativa]
    G --> I[Marcar vínculo como removido]
    H --> I
    I --> J[Registrar RemoverFuncionario no histórico]
    F -- Substituir --> K[Selecionar novo funcionário ativo e não vinculado]
    K --> L[Exigir motivo da substituição]
    L --> M[Marcar vínculo antigo como removido]
    M --> N[Criar ou reativar vínculo novo]
    N --> O[Registrar SubstituirFuncionario no histórico]
```

## Status do evento

```mermaid
stateDiagram-v2
    [*] --> Rascunho
    Rascunho --> Escalado: Usuário clica em Finalizar escala
    Escalado --> Rascunho: Cancelar finalização da escala
    Rascunho --> Cancelado: Excluir evento
    Escalado --> Cancelado: Excluir evento antes da finalização operacional
    Escalado --> Finalizado: Data e hora fim atingidas
    Finalizado --> [*]
    Cancelado --> [*]
```

## Regras de bloqueio na operação

```mermaid
flowchart TD
    A[Usuário tenta editar evento] --> B{Status do evento}
    B -- Rascunho --> C[Permitir edição cadastral]
    B -- Escalado --> D[Bloquear edição]
    D --> E[Orientar cancelar finalização da escala]
    B -- Finalizado --> F[Bloquear edição cadastral]
    B -- Cancelado --> G[Bloquear edição]

    H[Usuário tenta adicionar funcionário] --> I{Status do evento}
    I -- Rascunho --> J[Permitir]
    I -- Escalado --> K[Bloquear inclusão direta]
    I -- Finalizado --> K
    I -- Cancelado --> K
```

## Pagamento

```mermaid
flowchart TD
    A[Evento Finalizado] --> B[Funcionários vinculados não removidos viram pendência]
    B --> C[Tela lista funcionários pendentes]
    C --> D[Ordenar por maior valor pendente]
    D --> E[Usuário abre detalhe]
    E --> F[Listar eventos finalizados e não pagos]
    F --> G[Usuário informa HE por evento]
    G --> H[Sistema calcula diária + HE]
    H --> I[Usuário confirma pagamento]
    I --> J[Gravar pagamento e itens]
    J --> K[Marcar vínculos como pagos]
```
