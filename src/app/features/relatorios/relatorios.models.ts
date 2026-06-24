export interface RelatorioEscalaFiltros {
  casaId?: string;
  dataInicio: string;
  dataFim: string;
  nomeEvento?: string;
}

export type RelatorioFormato = 'excel' | 'pdf';
