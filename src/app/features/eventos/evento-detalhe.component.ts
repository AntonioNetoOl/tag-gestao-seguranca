import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { obterMensagemErroApi } from '../../core/api/api-error.util';
import { FuncionarioOpcao } from '../funcionarios/funcionarios.models';
import { FuncionariosService } from '../funcionarios/funcionarios.service';
import { Evento, EventoFuncionario, EventoStatus } from './eventos.models';
import { EventosService } from './eventos.service';

type AvisoTipo = 'erro' | 'sucesso';
type FormatoRelatorio = 'excel' | 'pdf';

interface AvisoState {
  tipo: AvisoTipo;
  titulo: string;
  mensagem: string;
  detalhe?: string;
}

@Component({
  selector: 'app-evento-detalhe',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './evento-detalhe.component.html',
  styleUrl: './evento-detalhe.component.css'
})
export class EventoDetalheComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly eventosService = inject(EventosService);
  private readonly funcionariosService = inject(FuncionariosService);
  private readonly formBuilder = inject(FormBuilder);
  private avisoTimeoutId: ReturnType<typeof setTimeout> | null = null;
  private relatorioTimeoutId: ReturnType<typeof setTimeout> | null = null;

  eventoId = '';
  evento: Evento | null = null;
  escala: EventoFuncionario[] = [];
  funcionarios: FuncionarioOpcao[] = [];

  carregandoEvento = true;
  carregandoEscala = true;
  carregandoFuncionarios = true;
  processando = false;
  exportando = false;
  erro = '';
  aviso: AvisoState | null = null;

  modalRemocaoAberto = false;
  funcionarioParaRemover: EventoFuncionario | null = null;
  modalSubstituicaoAberto = false;
  funcionarioParaSubstituir: EventoFuncionario | null = null;
  modalRelatorioAberto = false;
  relatorioSucesso = false;

  readonly adicionarForm = this.formBuilder.nonNullable.group({
    funcionarioId: ['', [Validators.required]]
  });

  readonly substituicaoForm = this.formBuilder.nonNullable.group({
    funcionarioNovoId: ['', [Validators.required]],
    motivo: ['', [Validators.required, Validators.maxLength(250)]]
  });

  ngOnInit(): void {
    this.eventoId = this.route.snapshot.paramMap.get('id') ?? '';

    if (!this.eventoId) {
      this.erro = 'Evento não informado.';
      this.carregandoEvento = false;
      this.carregandoEscala = false;
      this.carregandoFuncionarios = false;
      return;
    }

    this.carregarEvento();
    this.carregarEscala();
    this.carregarFuncionarios();
  }

  ngOnDestroy(): void {
    this.limparTimerAviso();
    this.limparTimerRelatorio();
  }

  carregarEvento(): void {
    this.carregandoEvento = true;
    this.eventosService.obter(this.eventoId).subscribe({
      next: (evento) => {
        this.evento = evento;
        this.carregandoEvento = false;
      },
      error: (error: unknown) => {
        this.erro = obterMensagemErroApi(error);
        this.carregandoEvento = false;
      }
    });
  }

  carregarEscala(): void {
    this.carregandoEscala = true;
    this.eventosService.listarFuncionarios(this.eventoId).subscribe({
      next: (escala) => {
        this.escala = escala;
        this.carregandoEscala = false;
      },
      error: (error: unknown) => {
        this.erro = obterMensagemErroApi(error);
        this.carregandoEscala = false;
      }
    });
  }

  carregarFuncionarios(): void {
    this.carregandoFuncionarios = true;
    this.funcionariosService.listarOpcoes(true).subscribe({
      next: (funcionarios) => {
        this.funcionarios = funcionarios;
        this.carregandoFuncionarios = false;
      },
      error: (error: unknown) => {
        this.abrirErro('Não foi possível carregar funcionários', obterMensagemErroApi(error));
        this.carregandoFuncionarios = false;
      }
    });
  }

  adicionarFuncionario(): void {
    this.erro = '';

    if (!this.podeAdicionarFuncionario()) {
      this.abrirErro('Escala bloqueada', 'Após finalizar a escala, não é possível adicionar novos funcionários.');
      return;
    }

    if (this.adicionarForm.invalid) {
      this.adicionarForm.markAllAsTouched();
      this.abrirErro('Selecione um funcionário', 'Escolha um funcionário para adicionar à escala.');
      return;
    }

    this.processando = true;
    const funcionarioId = this.adicionarForm.getRawValue().funcionarioId;

    this.eventosService.adicionarFuncionario(this.eventoId, { funcionarioId }).subscribe({
      next: () => {
        this.processando = false;
        this.adicionarForm.reset({ funcionarioId: '' });
        this.abrirSucesso('Funcionário adicionado', 'Funcionário vinculado à escala com sucesso.');
        this.recarregarDadosOperacionais();
      },
      error: (error: unknown) => {
        this.processando = false;
        this.abrirErro('Não foi possível adicionar', obterMensagemErroApi(error));
      }
    });
  }

  finalizarEscala(): void {
    if (!this.podeFinalizarEscala()) {
      this.abrirErro('Não foi possível finalizar', 'Adicione pelo menos um funcionário antes de finalizar a escala.');
      return;
    }

    this.processando = true;
    this.eventosService.finalizarEscala(this.eventoId).subscribe({
      next: () => {
        this.processando = false;
        this.abrirSucesso('Escala finalizada', 'Evento marcado como Escalado com sucesso.');
        this.recarregarDadosOperacionais();
      },
      error: (error: unknown) => {
        this.processando = false;
        this.abrirErro('Não foi possível finalizar a escala', obterMensagemErroApi(error));
      }
    });
  }

  abrirRelatorio(): void {
    if (!this.podeEmitirEscala()) return;
    this.limparTimerRelatorio();
    this.relatorioSucesso = false;
    this.modalRelatorioAberto = true;
  }

  fecharRelatorio(): void {
    if (this.exportando) return;
    this.limparTimerRelatorio();
    this.modalRelatorioAberto = false;
    this.relatorioSucesso = false;
  }

  emitirRelatorio(formato: FormatoRelatorio): void {
    if (!this.podeEmitirEscala()) return;

    this.exportando = true;
    const operacao = formato === 'excel'
      ? this.eventosService.exportarEscalaExcel(this.eventoId)
      : this.eventosService.exportarEscalaPdf(this.eventoId);

    operacao.subscribe({
      next: (arquivo) => {
        this.baixarArquivo(arquivo, `${this.nomeArquivoEscala()}.${formato === 'excel' ? 'xlsx' : 'pdf'}`);
        this.exportando = false;
        this.relatorioSucesso = true;
        this.relatorioTimeoutId = setTimeout(() => this.fecharRelatorio(), 1200);
      },
      error: (error: unknown) => {
        this.exportando = false;
        this.fecharRelatorio();
        this.abrirErro('Não foi possível emitir a escala', obterMensagemErroApi(error));
      }
    });
  }

  abrirRemocao(funcionario: EventoFuncionario): void {
    if (!this.podeAlterarVinculo(funcionario)) return;

    this.funcionarioParaRemover = funcionario;
    this.modalRemocaoAberto = true;
  }

  fecharRemocao(): void {
    if (this.processando) return;
    this.modalRemocaoAberto = false;
    this.funcionarioParaRemover = null;
  }

  removerFuncionario(): void {
    if (!this.funcionarioParaRemover) return;

    this.processando = true;

    this.eventosService.removerFuncionario(this.eventoId, this.funcionarioParaRemover.funcionarioId, { motivoRemocao: null }).subscribe({
      next: () => {
        this.processando = false;
        this.fecharRemocao();
        this.abrirSucesso('Funcionário removido', 'Funcionário removido da escala com sucesso.');
        this.recarregarDadosOperacionais();
      },
      error: (error: unknown) => {
        this.processando = false;
        this.abrirErro('Não foi possível remover', obterMensagemErroApi(error));
      }
    });
  }

  abrirSubstituicao(funcionario: EventoFuncionario): void {
    if (!this.podeAlterarVinculo(funcionario)) return;

    this.funcionarioParaSubstituir = funcionario;
    this.substituicaoForm.reset({ funcionarioNovoId: '', motivo: '' });
    this.modalSubstituicaoAberto = true;
  }

  fecharSubstituicao(): void {
    if (this.processando) return;
    this.modalSubstituicaoAberto = false;
    this.funcionarioParaSubstituir = null;
    this.substituicaoForm.reset({ funcionarioNovoId: '', motivo: '' });
  }

  substituirFuncionario(): void {
    if (!this.funcionarioParaSubstituir) return;

    if (this.substituicaoForm.invalid) {
      this.substituicaoForm.markAllAsTouched();
      return;
    }

    const raw = this.substituicaoForm.getRawValue();
    this.processando = true;

    this.eventosService.substituirFuncionario(this.eventoId, {
      funcionarioAntigoId: this.funcionarioParaSubstituir.funcionarioId,
      funcionarioNovoId: raw.funcionarioNovoId,
      motivo: raw.motivo.trim()
    }).subscribe({
      next: () => {
        this.processando = false;
        this.fecharSubstituicao();
        this.abrirSucesso('Funcionário substituído', 'Substituição realizada com sucesso.');
        this.recarregarDadosOperacionais();
      },
      error: (error: unknown) => {
        this.processando = false;
        this.abrirErro('Não foi possível substituir', obterMensagemErroApi(error));
      }
    });
  }

  funcionariosDisponiveis(funcionarioIgnoradoId?: string): FuncionarioOpcao[] {
    const idsEscalados = new Set(
      this.escala
        .filter((funcionario) => !funcionario.removido && funcionario.funcionarioId !== funcionarioIgnoradoId)
        .map((funcionario) => funcionario.funcionarioId)
    );

    return this.funcionarios.filter((funcionario) => !idsEscalados.has(funcionario.id));
  }

  escalaBloqueada(): boolean {
    return this.evento?.status === 'Cancelado';
  }

  podeAdicionarFuncionario(): boolean {
    return this.evento?.status === 'Rascunho' && !this.escalaBloqueada() && !this.carregandoFuncionarios && !this.processando;
  }

  podeFinalizarEscala(): boolean {
    return this.evento?.status === 'Rascunho' && this.escala.length > 0 && !this.escalaBloqueada() && !this.processando;
  }

  podeEmitirEscala(): boolean {
    return !!this.evento && this.evento.status !== 'Rascunho' && !this.escalaBloqueada() && this.escala.length > 0 && !this.exportando;
  }

  podeAlterarVinculo(funcionario: EventoFuncionario): boolean {
    return !this.escalaBloqueada() && !funcionario.pago;
  }

  formatarPeriodoEvento(evento: Evento): string {
    const dataInicio = this.extrairDataUtc(evento.dataEvento);
    if (!dataInicio) return this.formatarData(evento.dataEvento);

    const inicio = this.formatarHorario(evento.horaInicio);
    const fim = this.formatarHorario(evento.horaFim);
    const terminaNoDiaSeguinte = inicio !== '-' && fim !== '-' && fim < inicio;

    if (!terminaNoDiaSeguinte) {
      return this.formatarData(evento.dataEvento);
    }

    const dataFim = new Date(dataInicio);
    dataFim.setUTCDate(dataFim.getUTCDate() + 1);

    return `${this.formatarDataPorDate(dataInicio)} - ${this.formatarDataPorDate(dataFim)}`;
  }

  formatarData(valor: string): string {
    const data = this.extrairDataUtc(valor);
    if (!data) return valor || '-';
    return this.formatarDataPorDate(data);
  }

  formatarHorario(valor: string): string {
    return String(valor ?? '').slice(0, 5) || '-';
  }

  formatarMoeda(valor: number): string {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor ?? 0);
  }

  classeStatus(status: EventoStatus): string {
    const mapa: Record<EventoStatus, string> = {
      Rascunho: 'tag-badge-neutral',
      Escalado: 'tag-badge-info',
      Finalizado: 'tag-badge-success',
      Cancelado: 'tag-badge-danger'
    };
    return mapa[status] ?? 'tag-badge-neutral';
  }

  fecharAviso(): void {
    this.limparTimerAviso();
    this.aviso = null;
  }

  private recarregarDadosOperacionais(): void {
    this.carregarEvento();
    this.carregarEscala();
  }

  private baixarArquivo(arquivo: Blob, nomeArquivo: string): void {
    const url = URL.createObjectURL(arquivo);
    const link = document.createElement('a');
    link.href = url;
    link.download = nomeArquivo;
    link.click();
    URL.revokeObjectURL(url);
  }

  private nomeArquivoEscala(): string {
    const nomeEvento = this.evento?.nome?.trim() || this.eventoId;
    const nomeSeguro = nomeEvento
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9-_]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .toLowerCase();

    return `escala-${nomeSeguro || this.eventoId}`;
  }

  private extrairDataUtc(valor: string): Date | null {
    const texto = String(valor ?? '').slice(0, 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(texto)) return null;

    const [ano, mes, dia] = texto.split('-').map(Number);
    return new Date(Date.UTC(ano, mes - 1, dia));
  }

  private formatarDataPorDate(data: Date): string {
    return new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC' }).format(data);
  }

  private abrirErro(titulo: string, mensagem: string, detalhe?: string): void {
    this.limparTimerAviso();
    this.aviso = { tipo: 'erro', titulo, mensagem, detalhe };
  }

  private abrirSucesso(titulo: string, mensagem: string): void {
    this.limparTimerAviso();
    this.aviso = { tipo: 'sucesso', titulo, mensagem };
    this.avisoTimeoutId = setTimeout(() => this.fecharAviso(), 2500);
  }

  private limparTimerAviso(): void {
    if (this.avisoTimeoutId) {
      clearTimeout(this.avisoTimeoutId);
      this.avisoTimeoutId = null;
    }
  }

  private limparTimerRelatorio(): void {
    if (this.relatorioTimeoutId) {
      clearTimeout(this.relatorioTimeoutId);
      this.relatorioTimeoutId = null;
    }
  }
}
