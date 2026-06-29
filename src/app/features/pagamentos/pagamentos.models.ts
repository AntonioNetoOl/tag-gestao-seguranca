import { PagedResponse } from '../../core/models/paged-response.model';

export interface PagamentoPendenteResumo {
  funcionarioId: string;
  nomeCompleto: string;
  rg: string;
  cpf: string;
  funcao: string;
  meioPagamento: string;
  quantidadeEventos: number;
  totalHorasExtras: number;
  valorTotalPendente: number;
}

export interface PagamentoPendenteDetalhe {
  funcionarioId: string;
  nomeCompleto: string;
  rg: string;
  cpf: string;
  funcao: string;
  meioPagamento: string;
  quantidadeEventos: number;
  totalHorasExtras: number;
  valorTotalPendente: number;
  eventos: PagamentoPendenteEvento[];
}

export interface PagamentoPendenteEvento {
  eventoFuncionarioId: string;
  eventoId: string;
  nomeEvento: string;
  dataEvento: string;
  casaNome: string;
  valorDiaria: number;
  valorHoraExtra: number;
  quantidadeHorasExtras: number;
  valorTotal: number;
}

export interface ConfirmarPagamentoRequest {
  funcionarioId: string;
  itens: ConfirmarPagamentoItemRequest[];
}

export interface ConfirmarPagamentoItemRequest {
  eventoFuncionarioId: string;
  quantidadeHorasExtras: number;
}

export interface PagamentoResumo {
  id: string;
  funcionarioId: string;
  nomeCompleto: string;
  rg: string;
  cpf: string;
  meioPagamento: string;
  dataPagamento: string;
  valorTotal: number;
  totalHorasExtras: number;
  quantidadeEventos: number;
  status: string;
}

export interface PagamentoConfirmado extends PagamentoResumo {
  itens: PagamentoConfirmadoItem[];
}

export interface PagamentoConfirmadoItem {
  id: string;
  eventoFuncionarioId: string;
  eventoId: string;
  nomeEvento: string;
  dataEvento: string;
  casaNome: string;
  valorDiariaPago: number;
  valorHoraExtraPago: number;
  quantidadeHorasExtras: number;
  valorTotalItem: number;
}

export type PagamentosConfirmadosResponse = PagedResponse<PagamentoResumo>;
export type PagamentosAba = 'pendentes' | 'confirmados';
