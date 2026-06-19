export interface DashboardResumo {
  quantidadeProximosEventos: number;
  quantidadeEventosHoje: number;
  quantidadeFuncionariosPendentesPagamento: number;
  proximosEventos: DashboardProximoEvento[];
}

export interface DashboardProximoEvento {
  id: string;
  nome: string;
  casaNome: string;
  tipoEventoNome: string;
  dataEvento: string;
  horaInicio: string;
  horaFim: string;
  status: string;
  quantidadeFuncionarios: number;
}
