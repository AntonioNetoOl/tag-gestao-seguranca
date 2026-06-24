import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { obterMensagemErroApi } from '../../core/api/api-error.util';
import { PagedResponse } from '../../core/models/paged-response.model';
import { CasaOpcao } from '../casas/casas.models';
import { CasasService } from '../casas/casas.service';
import { TipoEventoOpcao } from '../tipos-evento/tipos-evento.models';
import { TiposEventoService } from '../tipos-evento/tipos-evento.service';
import { Evento, EventoRequest, EventoStatus } from './eventos.models';
import { EventosService } from './eventos.service';

type ModoFormulario = 'criar' | 'editar';
type CampoFormulario = 'casaId' | 'tipoEventoId' | 'nome' | 'dataEvento' | 'horaInicio' | 'horaFim' | 'valorDiaria' | 'valorHoraExtra';
type AvisoTipo = 'pergunta' | 'erro' | 'sucesso';

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
  selector: 'app-eventos-page',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './eventos.component.html',
  styleUrl: './eventos.component.css'
})
export class EventosPageComponent implements OnInit, OnDestroy {
  private readonly eventosService = inject(EventosService);
  private readonly casasService = inject(CasasService);
  private readonly tiposEventoService = inject(TiposEventoService);
  private readonly formBuilder = inject(FormBuilder);
  private avisoTimeoutId: ReturnType<typeof setTimeout> | null = null;

  carregando = true;
  carregandoOpcoes = true;
  salvando = false;
  erro = '';
  modalAberto = false;
  modoFormulario: ModoFormulario = 'criar';
  eventoSelecionado: Evento | null = null;
  aviso: AvisoState | null = null;

  casas: CasaOpcao[] = [];
  tiposEvento: TipoEventoOpcao[] = [];

  page = 1;
  pageSize = 5;
  nome = '';
  casaId = '';
  dataInicio = '';
  dataFim = '';
  readonly pageSizeOptions = [5, 10, 15, 20];

  resultado: PagedResponse<Evento> = { items: [], page: 1, pageSize: 5, totalItems: 0, totalPages: 0 };

  readonly form = this.formBuilder.nonNullable.group({
    casaId: ['', [Validators.required]],
    tipoEventoId: ['', [Validators.required]],
    nome: ['', [Validators.required, Validators.maxLength(200)]],
    dataEvento: ['', [Validators.required]],
    horaInicio: ['', [Validators.required]],
    horaFim: ['', [Validators.required]],
    valorDiaria: [0, [Validators.required, Validators.min(0.01)]],
    valorHoraExtra: [0, [Validators.required, Validators.min(0)]]
  });

  ngOnInit(): void {
    this.carregarOpcoes();
    this.carregarEventos();
  }

  ngOnDestroy(): void {
    this.limparTimerAviso();
  }

  carregarOpcoes(): void {
    this.carregandoOpcoes = true;
    let pendentes = 2;
    const finalizar = () => {
      pendentes--;
      if (pendentes === 0) this.carregandoOpcoes = false;
    };

    this.casasService.listarOpcoes().subscribe({
      next: (casas) => { this.casas = casas; finalizar(); },
      error: (error: unknown) => { this.abrirErro('Não foi possível carregar as casas', obterMensagemErroApi(error)); finalizar(); }
    });

    this.tiposEventoService.listarOpcoes().subscribe({
      next: (tipos) => { this.tiposEvento = tipos; finalizar(); },
      error: (error: unknown) => { this.abrirErro('Não foi possível carregar os tipos de evento', obterMensagemErroApi(error)); finalizar(); }
    });
  }

  carregarEventos(): void {
    this.carregando = true;
    this.erro = '';

    this.eventosService.listar({
      nome: this.nome.trim() || undefined,
      casaId: this.casaId || undefined,
      dataInicio: this.dataInicio || undefined,
      dataFim: this.dataFim || undefined,
      apenasOperacao: true,
      page: this.page,
      pageSize: this.pageSize
    }).subscribe({
      next: (resultado) => {
        this.resultado = resultado;
        this.page = resultado.page;
        this.pageSize = this.normalizarPageSize(resultado.pageSize || this.pageSize);
        this.carregando = false;
      },
      error: (error: unknown) => {
        this.erro = obterMensagemErroApi(error);
        this.carregando = false;
      }
    });
  }

  pesquisar(): void {
    this.page = 1;
    this.carregarEventos();
  }

  limparFiltros(): void {
    this.nome = '';
    this.casaId = '';
    this.dataInicio = '';
    this.dataFim = '';
    this.page = 1;
    this.carregarEventos();
  }

  alterarNome(event: Event): void { this.nome = (event.target as HTMLInputElement).value; }
  alterarCasa(event: Event): void { this.casaId = (event.target as HTMLSelectElement).value; this.pesquisar(); }
  alterarDataInicio(event: Event): void { this.dataInicio = (event.target as HTMLInputElement).value; }
  alterarDataFim(event: Event): void { this.dataFim = (event.target as HTMLInputElement).value; }
  alterarPageSize(event: Event): void { this.pageSize = this.normalizarPageSize(Number((event.target as HTMLSelectElement).value)); this.page = 1; this.carregarEventos(); }
  paginaAnterior(): void { if (this.page <= 1) return; this.page--; this.carregarEventos(); }
  proximaPagina(): void { if (this.page >= this.resultado.totalPages) return; this.page++; this.carregarEventos(); }

  abrirNovo(): void {
    this.modoFormulario = 'criar';
    this.eventoSelecionado = null;
    this.erro = '';
    this.form.reset({ casaId: '', tipoEventoId: '', nome: '', dataEvento: '', horaInicio: '', horaFim: '', valorDiaria: 0, valorHoraExtra: 0 });
    this.modalAberto = true;
  }

  abrirEdicao(evento: Evento): void {
    this.modoFormulario = 'editar';
    this.eventoSelecionado = evento;
    this.erro = '';
    this.form.setValue({
      casaId: evento.casaId,
      tipoEventoId: evento.tipoEventoId,
      nome: evento.nome,
      dataEvento: this.formatarDataInput(evento.dataEvento),
      horaInicio: this.formatarHorarioInput(evento.horaInicio),
      horaFim: this.formatarHorarioInput(evento.horaFim),
      valorDiaria: evento.valorDiaria,
      valorHoraExtra: evento.valorHoraExtra
    });
    this.modalAberto = true;
  }

  fecharModal(): void {
    if (this.salvando) return;
    this.modalAberto = false;
    this.eventoSelecionado = null;
    this.form.reset();
  }

  salvar(): void {
    this.erro = '';

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.abrirErro('Revise o cadastro', 'Existem campos obrigatórios ou inválidos no formulário.', 'Confira casa, tipo, data, horários e valores antes de salvar.');
      return;
    }

    const horarioErro = this.validarHorario();
    if (horarioErro) {
      this.abrirErro('Revise os horários', horarioErro);
      return;
    }

    const request = this.montarRequest();
    const mensagemSucesso = this.modoFormulario === 'criar' ? 'Evento cadastrado com sucesso.' : 'Evento atualizado com sucesso.';
    this.salvando = true;

    const operacao = this.modoFormulario === 'criar'
      ? this.eventosService.criar(request)
      : this.eventosService.atualizar(this.eventoSelecionado?.id ?? '', request);

    operacao.subscribe({
      next: () => {
        this.salvando = false;
        this.modalAberto = false;
        this.abrirSucesso('Registro salvo', mensagemSucesso);
        this.carregarEventos();
      },
      error: (error: unknown) => {
        const mensagem = obterMensagemErroApi(error);
        this.salvando = false;
        this.erro = mensagem;
        this.abrirErro('Não foi possível salvar', mensagem);
      }
    });
  }

  excluir(evento: Evento): void {
    this.abrirConfirmacao({
      tipo: 'pergunta',
      titulo: 'Confirmar exclusão',
      mensagem: `Excluir o evento ${evento.nome}?`,
      detalhe: 'O evento será marcado como Cancelado e sairá da listagem operacional.',
      textoPrincipal: 'Excluir evento',
      textoSecundario: 'Voltar',
      aoConfirmar: () => this.executarExclusao(evento)
    });
  }

  confirmarAviso(): void { const acao = this.aviso?.aoConfirmar; this.fecharAviso(); acao?.(); }
  fecharAviso(): void { this.limparTimerAviso(); this.aviso = null; }

  campoInvalido(campo: CampoFormulario): boolean {
    const controle = this.form.controls[campo];
    return controle.invalid && (controle.dirty || controle.touched);
  }

  podeExcluir(evento: Evento): boolean {
    return evento.status !== 'Cancelado' && evento.status !== 'Finalizado';
  }

  formatarData(valor: string): string {
    if (!valor) return '-';
    const data = new Date(valor);
    if (Number.isNaN(data.getTime())) return valor;
    return new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC' }).format(data);
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

  private executarExclusao(evento: Evento): void {
    this.erro = '';
    this.eventosService.cancelar(evento.id).subscribe({
      next: () => {
        this.abrirSucesso('Evento excluído', 'Evento removido da listagem operacional.');
        this.carregarEventos();
      },
      error: (error: unknown) => {
        const mensagem = obterMensagemErroApi(error);
        this.erro = mensagem;
        this.abrirErro('Não foi possível excluir', mensagem);
      }
    });
  }

  private validarHorario(): string | null {
    const raw = this.form.getRawValue();
    if (!raw.horaInicio || !raw.horaFim) return null;
    if (raw.horaInicio === raw.horaFim) return 'O horário final deve ser diferente do horário inicial.';
    return null;
  }

  private montarRequest(): EventoRequest {
    const raw = this.form.getRawValue();
    return {
      casaId: raw.casaId,
      tipoEventoId: raw.tipoEventoId,
      nome: raw.nome.trim(),
      dataEvento: `${raw.dataEvento}T00:00:00`,
      horaInicio: this.normalizarHorario(raw.horaInicio),
      horaFim: this.normalizarHorario(raw.horaFim),
      valorDiaria: Number(raw.valorDiaria),
      valorHoraExtra: Number(raw.valorHoraExtra)
    };
  }

  private formatarDataInput(valor: string): string {
    return String(valor ?? '').slice(0, 10);
  }

  private formatarHorarioInput(valor: string): string {
    return String(valor ?? '').slice(0, 5);
  }

  private normalizarHorario(valor: string): string {
    return valor.length === 5 ? `${valor}:00` : valor;
  }

  private abrirConfirmacao(aviso: AvisoState): void { this.limparTimerAviso(); this.aviso = aviso; }
  private abrirErro(titulo: string, mensagem: string, detalhe?: string): void { this.limparTimerAviso(); this.aviso = { tipo: 'erro', titulo, mensagem, detalhe, textoPrincipal: 'Entendi' }; }
  private abrirSucesso(titulo: string, mensagem = 'Registro gravado com sucesso.'): void { this.limparTimerAviso(); this.aviso = { tipo: 'sucesso', titulo, mensagem, textoPrincipal: '' }; this.avisoTimeoutId = setTimeout(() => this.fecharAviso(), 2500); }
  private limparTimerAviso(): void { if (this.avisoTimeoutId) { clearTimeout(this.avisoTimeoutId); this.avisoTimeoutId = null; } }
  private normalizarPageSize(valor: number): number { return this.pageSizeOptions.includes(valor) ? valor : 5; }
}
