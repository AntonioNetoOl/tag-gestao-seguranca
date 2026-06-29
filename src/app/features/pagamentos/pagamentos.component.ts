import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { obterMensagemErroApi } from '../../core/api/api-error.util';
import {
  ConfirmarPagamentoRequest,
  PagamentoConfirmado,
  PagamentoPendenteDetalhe,
  PagamentoPendenteEvento,
  PagamentoPendenteResumo,
  PagamentosAba,
  PagamentosConfirmadosResponse
} from './pagamentos.models';
import { PagamentosService } from './pagamentos.service';

type AvisoTipo = 'erro' | 'sucesso' | 'pergunta';

interface AvisoState {
  tipo: AvisoTipo;
  titulo: string;
  mensagem: string;
  detalhe?: string;
  textoPrincipal: string;
  textoSecundario?: string;
  aoConfirmar?: () => void;
}

@Component({
  selector: 'app-pagamentos',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './pagamentos.component.html',
  styleUrl: './pagamentos.component.css'
})
export class PagamentosComponent implements OnInit, OnDestroy {
  private readonly pagamentosService = inject(PagamentosService);
  private detalheHistoricoAberto = false;
  private readonly aoVoltarNavegador = () => {
    if (this.pagamentoConfirmadoDetalhe || this.detalhePendente) {
      this.pagamentoConfirmadoDetalhe = null;
      this.detalhePendente = null;
      this.detalheHistoricoAberto = false;
    }
  };

  readonly pageSizeOptions = [5, 10, 20, 50];

  abaAtiva: PagamentosAba = 'pendentes';
  buscaPendentes = '';
  buscaConfirmados = '';
  dataInicioConfirmados = '';
  dataFimConfirmados = '';
  pageConfirmados = 1;
  pageSizeConfirmados = 5;

  carregandoPendentes = false;
  carregandoConfirmados = false;
  carregandoDetalhe = false;
  confirmando = false;

  pendentes: PagamentoPendenteResumo[] = [];
  detalhePendente: PagamentoPendenteDetalhe | null = null;
  pagamentoConfirmadoDetalhe: PagamentoConfirmado | null = null;
  resultadoConfirmados: PagamentosConfirmadosResponse = {
    items: [],
    page: 1,
    pageSize: 5,
    totalItems: 0,
    totalPages: 1
  };

  aviso: AvisoState | null = null;

  ngOnInit(): void {
    window.addEventListener('popstate', this.aoVoltarNavegador);
    this.carregarPendentes();
  }

  ngOnDestroy(): void {
    window.removeEventListener('popstate', this.aoVoltarNavegador);
  }

  selecionarAba(aba: PagamentosAba): void {
    this.abaAtiva = aba;
    this.fecharDetalhesSemNavegarHistorico();

    if (aba === 'pendentes') {
      this.carregarPendentes();
    } else {
      this.garantirPeriodoConfirmadosPadrao();
      this.carregarConfirmados();
    }
  }

  carregarPendentes(): void {
    this.carregandoPendentes = true;
    this.pagamentosService.listarPendentes(this.buscaPendentes).subscribe({
      next: (pendentes) => {
        this.pendentes = pendentes;
        this.carregandoPendentes = false;
      },
      error: (error: unknown) => {
        this.carregandoPendentes = false;
        this.abrirErro('Não foi possível carregar pagamentos', obterMensagemErroApi(error));
      }
    });
  }

  limparPendentes(): void {
    this.buscaPendentes = '';
    this.carregarPendentes();
  }

  abrirPendente(funcionarioId: string): void {
    this.carregandoDetalhe = true;
    this.pagamentosService.obterPendente(funcionarioId).subscribe({
      next: (detalhe) => {
        this.detalhePendente = detalhe;
        this.pagamentoConfirmadoDetalhe = null;
        this.registrarDetalheNoHistorico();
        this.carregandoDetalhe = false;
      },
      error: (error: unknown) => {
        this.carregandoDetalhe = false;
        this.abrirErro('Não foi possível abrir o pagamento', obterMensagemErroApi(error));
      }
    });
  }

  voltarListaPendentes(): void {
    this.fecharDetalhesSemNavegarHistorico();
  }

  atualizarHorasExtras(evento: PagamentoPendenteEvento, valor: string): void {
    const normalizado = valor.replace(',', '.');
    const quantidade = Number(normalizado);
    evento.quantidadeHorasExtras = Number.isFinite(quantidade) && quantidade >= 0 ? quantidade : 0;
    evento.valorTotal = this.calcularTotalItem(evento);
  }

  totalHorasExtrasPendente(): number {
    return this.detalhePendente?.eventos.reduce((total, evento) => total + Number(evento.quantidadeHorasExtras || 0), 0) ?? 0;
  }

  totalPagamentoPendente(): number {
    return this.detalhePendente?.eventos.reduce((total, evento) => total + this.calcularTotalItem(evento), 0) ?? 0;
  }

  solicitarConfirmacaoPagamento(): void {
    if (!this.detalhePendente) return;

    const horasInvalidas = this.detalhePendente.eventos.some((evento) => evento.quantidadeHorasExtras < 0 || evento.quantidadeHorasExtras > 24);
    if (horasInvalidas) {
      this.abrirErro('Horas extras inválidas', 'A quantidade de horas extras por evento deve ficar entre 0 e 24.');
      return;
    }

    this.aviso = {
      tipo: 'pergunta',
      titulo: 'Confirmar pagamento?',
      mensagem: `Confirma o pagamento de ${this.detalhePendente.nomeCompleto} no valor de ${this.formatarMoeda(this.totalPagamentoPendente())}?`,
      detalhe: 'Após confirmado, este pagamento não poderá ser editado, cancelado ou estornado pelo sistema.',
      textoPrincipal: 'Confirmar pagamento',
      textoSecundario: 'Voltar',
      aoConfirmar: () => this.confirmarPagamento()
    };
  }

  confirmarPagamento(): void {
    if (!this.detalhePendente) return;

    const request: ConfirmarPagamentoRequest = {
      funcionarioId: this.detalhePendente.funcionarioId,
      itens: this.detalhePendente.eventos.map((evento) => ({
        eventoFuncionarioId: evento.eventoFuncionarioId,
        quantidadeHorasExtras: Number(evento.quantidadeHorasExtras || 0)
      }))
    };

    this.confirmando = true;
    this.fecharAviso();
    this.pagamentosService.confirmar(request).subscribe({
      next: (pagamento) => {
        this.confirmando = false;
        this.fecharDetalhesSemNavegarHistorico();
        this.pagamentoConfirmadoDetalhe = pagamento;
        this.registrarDetalheNoHistorico();
        this.abaAtiva = 'confirmados';
        this.garantirPeriodoConfirmadosPadrao();
        this.carregarConfirmados();
        this.abrirSucesso('Pagamento confirmado', 'O pagamento foi registrado e saiu da lista de pendências.');
      },
      error: (error: unknown) => {
        this.confirmando = false;
        this.abrirErro('Não foi possível confirmar', obterMensagemErroApi(error));
      }
    });
  }

  carregarConfirmados(): void {
    this.garantirPeriodoConfirmadosPadrao();
    this.carregandoConfirmados = true;
    this.pagamentosService.listarConfirmados({
      busca: this.buscaConfirmados,
      dataInicio: this.dataInicioConfirmados,
      dataFim: this.dataFimConfirmados,
      page: this.pageConfirmados,
      pageSize: this.pageSizeConfirmados
    }).subscribe({
      next: (resultado) => {
        this.resultadoConfirmados = resultado;
        this.carregandoConfirmados = false;
      },
      error: (error: unknown) => {
        this.carregandoConfirmados = false;
        this.abrirErro('Não foi possível carregar pagamentos', obterMensagemErroApi(error));
      }
    });
  }

  limparConfirmados(): void {
    this.buscaConfirmados = '';
    this.aplicarPeriodoUltimosSeteDias();
    this.pageConfirmados = 1;
    this.carregarConfirmados();
  }

  abrirConfirmado(pagamentoId: string): void {
    this.carregandoDetalhe = true;
    this.pagamentosService.obterConfirmado(pagamentoId).subscribe({
      next: (pagamento) => {
        this.pagamentoConfirmadoDetalhe = pagamento;
        this.detalhePendente = null;
        this.registrarDetalheNoHistorico();
        this.carregandoDetalhe = false;
      },
      error: (error: unknown) => {
        this.carregandoDetalhe = false;
        this.abrirErro('Não foi possível abrir o pagamento', obterMensagemErroApi(error));
      }
    });
  }

  voltarListaConfirmados(): void {
    this.fecharDetalhesSemNavegarHistorico();
  }

  paginaAnteriorConfirmados(): void {
    if (this.pageConfirmados <= 1) return;
    this.pageConfirmados--;
    this.carregarConfirmados();
  }

  proximaPaginaConfirmados(): void {
    if (this.pageConfirmados >= this.resultadoConfirmados.totalPages) return;
    this.pageConfirmados++;
    this.carregarConfirmados();
  }

  alterarPageSizeConfirmados(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.pageSizeConfirmados = Number(select.value) || 5;
    this.pageConfirmados = 1;
    this.carregarConfirmados();
  }

  calcularTotalItem(evento: PagamentoPendenteEvento): number {
    return Number(evento.valorDiaria || 0) + (Number(evento.quantidadeHorasExtras || 0) * Number(evento.valorHoraExtra || 0));
  }

  confirmarAviso(): void {
    const acao = this.aviso?.aoConfirmar;
    if (acao) {
      acao();
    } else {
      this.fecharAviso();
    }
  }

  fecharAviso(): void {
    this.aviso = null;
  }

  formatarMoeda(valor: number): string {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor || 0);
  }

  formatarData(data: string): string {
    if (!data) return '-';
    const somenteData = data.substring(0, 10);
    const [ano, mes, dia] = somenteData.split('-');
    return `${dia}/${mes}/${ano}`;
  }

  formatarDataHora(data: string): string {
    if (!data) return '-';
    return new Intl.DateTimeFormat('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'short'
    }).format(new Date(data));
  }

  formatarCpf(cpf: string): string {
    const digitos = (cpf || '').replace(/\D/g, '');
    if (digitos.length !== 11) return cpf;
    return digitos.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }

  formatarRg(rg: string): string {
    return rg || '-';
  }

  private garantirPeriodoConfirmadosPadrao(): void {
    if (!this.dataInicioConfirmados && !this.dataFimConfirmados) {
      this.aplicarPeriodoUltimosSeteDias();
    }
  }

  private aplicarPeriodoUltimosSeteDias(): void {
    const fim = new Date();
    const inicio = new Date();
    inicio.setDate(fim.getDate() - 6);
    this.dataInicioConfirmados = this.formatarDataInput(inicio);
    this.dataFimConfirmados = this.formatarDataInput(fim);
  }

  private formatarDataInput(data: Date): string {
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const dia = String(data.getDate()).padStart(2, '0');
    return `${ano}-${mes}-${dia}`;
  }

  private registrarDetalheNoHistorico(): void {
    if (this.detalheHistoricoAberto) return;
    window.history.pushState({ tagPagamentoDetalhe: true }, '', window.location.href);
    this.detalheHistoricoAberto = true;
  }

  private fecharDetalhesSemNavegarHistorico(): void {
    this.detalhePendente = null;
    this.pagamentoConfirmadoDetalhe = null;
    this.detalheHistoricoAberto = false;

    if (window.history.state?.tagPagamentoDetalhe) {
      window.history.replaceState(null, '', window.location.href);
    }
  }

  private abrirErro(titulo: string, mensagem: string, detalhe?: string): void {
    this.aviso = { tipo: 'erro', titulo, mensagem, detalhe, textoPrincipal: 'Entendi' };
  }

  private abrirSucesso(titulo: string, mensagem: string): void {
    this.aviso = { tipo: 'sucesso', titulo, mensagem, textoPrincipal: 'Entendi' };
    setTimeout(() => {
      if (this.aviso?.tipo === 'sucesso') this.fecharAviso();
    }, 1800);
  }
}
