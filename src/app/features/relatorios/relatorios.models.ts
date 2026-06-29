export interface RelatorioEscalaFiltros {
  casaId?: string;
  dataInicio: string;
  dataFim: string;
  nomeEvento?: string;
}

export interface RelatorioPagamentoFiltros {
  busca?: string;
  dataInicio: string;
  dataFim: string;
}

export type RelatorioFormato = 'excel' | 'pdf';
