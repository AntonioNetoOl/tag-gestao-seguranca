export type EventoStatus = 'Rascunho' | 'Escalado' | 'Finalizado' | 'Cancelado';
export type EventoStatusFiltro = 'todos' | EventoStatus;

export interface Evento {
  id: string;
  casaId: string;
  casaNome: string;
  tipoEventoId: string;
  tipoEventoNome: string;
  nome: string;
  dataEvento: string;
  horaInicio: string;
  horaFim: string;
  valorDiaria: number;
  valorHoraExtra: number;
  status: EventoStatus;
  quantidadeFuncionarios: number;
  dataCriacao: string;
  dataAlteracao: string | null;
}

export interface EventoRequest {
  casaId: string;
  tipoEventoId: string;
  nome: string;
  dataEvento: string;
  horaInicio: string;
  horaFim: string;
  valorDiaria: number;
  valorHoraExtra: number;
}

export interface EventoListagemParams {
  casaId?: string;
  dataInicio?: string;
  dataFim?: string;
  nome?: string;
  status?: EventoStatus;
  page: number;
  pageSize: number;
}
