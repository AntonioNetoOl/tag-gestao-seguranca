import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';

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
type CampoMoeda = 'valorDiaria' | 'valorHoraExtra';
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

interface SituacaoOperacionalEvento {
  rotulo: string;
  classe: string;
  mensagem?: string;
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
  private valoresMoeda: Record<CampoMoeda, number> = { valorDiaria: 0, valorHoraExtra: 0 };

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
  readonly dataMinimaEvento = this.obterDataHojeInput();

  resultado: PagedResponse<Evento> = { items: [], page: 1, pageSize: 5, totalItems: 0, totalPages: 0 };

  readonly form = this.formBuilder.nonNullable.group({
    casaId: ['', [Validators.required]],
    tipoEventoId: ['', [Validators.required]],
    nome: ['', [Validators.required, Validators.maxLength(200)]],
    dataEvento: ['', [Validators.required, this.dataEventoMinimaHoje()]],
    horaInicio: ['', [Validators.required]],
    horaFim: ['', [Validators.required]],
    valorDiaria: [this.formatarMoedaInput(0), [Validators.required, this.valorMonetarioMinimo(0.01)]],
    valorHoraExtra: [this.formatarMoedaInput(0), [Validators.required, this.valorMonetarioMinimo(0)]]
  });

  ngOnInit(): void { this.carregarOpcoes(); this.carregarEventos(); }
  ngOnDestroy(): void { this.limparTimerAviso(); }

  carregarOpcoes(): void {
    this.carregandoOpcoes = true;
    let pendentes = 2;
    const finalizar = () => { pendentes--; if (pendentes === 0) this.carregandoOpcoes = false; };
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
    this.eventosService.finalizarVencidos().subscribe({ next: () => this.listarEventosOperacao(), error: () => this.listarEventosOperacao() });
  }

  private listarEventosOperacao(): void {
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
        this.resultado = { ...resultado, items: resultado.items.map((evento) => this.aplicarStatusOperacional(evento)) };
        this.page = resultado.page;
        this.pageSize = this.normalizarPageSize(resultado.pageSize || this.pageSize);
        this.carregando = false;
      },
      error: (error: unknown) => { const mensagem = obterMensagemErroApi(error); this.carregando = false; this.abrirErro('Não foi possível carregar os eventos', mensagem); }
    });
  }

  pesquisar(): void { this.page = 1; this.carregarEventos(); }
  limparFiltros(): void { this.nome = ''; this.casaId = ''; this.dataInicio = ''; this.dataFim = ''; this.page = 1; this.carregarEventos(); }
  alterarNome(event: Event): void { this.nome = (event.target as HTMLInputElement).value; }
  alterarCasa(event: Event): void { this.casaId = (event.target as HTMLSelectElement).value; this.pesquisar(); }
  alterarDataInicio(event: Event): void { this.dataInicio = (event.target as HTMLInputElement).value; }
  alterarDataFim(event: Event): void { this.dataFim = (event.target as HTMLInputElement).value; }
  alterarPageSize(event: Event): void { this.pageSize = this.normalizarPageSize(Number((event.target as HTMLSelectElement).value)); this.page = 1; this.carregarEventos(); }
  paginaAnterior(): void { if (this.page <= 1) return; this.page--; this.carregarEventos(); }
  proximaPagina(): void { if (this.page >= this.resultado.totalPages) return; this.page++; this.carregarEventos(); }

  abrirNovo(): void {
    this.modoFormulario = 'criar'; this.eventoSelecionado = null; this.erro = '';
    this.definirMoeda('valorDiaria', 0); this.definirMoeda('valorHoraExtra', 0);
    this.form.reset({ casaId: '', tipoEventoId: '', nome: '', dataEvento: '', horaInicio: '', horaFim: '', valorDiaria: this.formatarMoedaInput(0), valorHoraExtra: this.formatarMoedaInput(0) });
    this.modalAberto = true;
  }

  abrirEdicao(evento: Evento): void {
    const statusOriginal = this.normalizarStatusPersistido(evento.status);
    if (statusOriginal === 'Escalado') {
      this.abrirErro('Alteração bloqueada', 'Não é possível alterar este evento porque a escala já foi finalizada.', 'Para editar os dados do evento, primeiro abra a escala e clique em Cancelar finalização.');
      return;
    }
    if (statusOriginal === 'Finalizado') { this.abrirErro('Alteração bloqueada', 'Evento finalizado não pode ser alterado.'); return; }
    this.modoFormulario = 'editar'; this.eventoSelecionado = { ...evento, status: statusOriginal }; this.erro = '';
    this.definirMoeda('valorDiaria', evento.valorDiaria); this.definirMoeda('valorHoraExtra', evento.valorHoraExtra);
    this.form.setValue({ casaId: evento.casaId, tipoEventoId: evento.tipoEventoId, nome: evento.nome, dataEvento: this.formatarDataInput(evento.dataEvento), horaInicio: this.formatarHorarioInput(evento.horaInicio), horaFim: this.formatarHorarioInput(evento.horaFim), valorDiaria: this.formatarMoedaInput(evento.valorDiaria), valorHoraExtra: this.formatarMoedaInput(evento.valorHoraExtra) });
    this.modalAberto = true;
  }

  fecharModal(): void { if (this.salvando) return; this.modalAberto = false; this.eventoSelecionado = null; this.form.reset(); }

  salvar(): void {
    this.erro = '';
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      if (this.form.controls.dataEvento.hasError('dataPassada')) { this.abrirErro('Data inválida', `A data do evento não pode ser anterior a hoje (${this.formatarDataInputPtBr(this.dataMinimaEvento)}).`); return; }
      this.abrirErro('Revise o cadastro', 'Existem campos obrigatórios ou inválidos no formulário.', 'Confira casa, tipo, data, horários e valores antes de salvar.'); return;
    }
    const horarioErro = this.validarHorario(); if (horarioErro) { this.abrirErro('Revise os horários', horarioErro); return; }
    const request = this.montarRequest();
    const mensagemSucesso = this.modoFormulario === 'criar' ? 'Evento cadastrado com sucesso.' : 'Evento atualizado com sucesso.';
    this.salvando = true;
    const operacao = this.modoFormulario === 'criar' ? this.eventosService.criar(request) : this.eventosService.atualizar(this.eventoSelecionado?.id ?? '', request);
    operacao.subscribe({ next: () => { this.salvando = false; this.modalAberto = false; this.abrirSucesso('Registro salvo', mensagemSucesso); this.carregarEventos(); }, error: (error: unknown) => { const mensagem = obterMensagemErroApi(error); this.salvando = false; this.erro = mensagem; this.abrirErro('Não foi possível salvar', mensagem); } });
  }

  excluir(evento: Evento): void {
    this.abrirConfirmacao({ tipo: 'pergunta', titulo: 'Confirmar exclusão', mensagem: `Excluir o evento ${evento.nome}?`, detalhe: 'O evento será marcado como Cancelado e sairá da listagem operacional.', textoPrincipal: 'Excluir evento', textoSecundario: 'Voltar', aoConfirmar: () => this.executarExclusao(evento) });
  }

  aoDigitarMoeda(campo: CampoMoeda, event: KeyboardEvent): void {
    if (event.ctrlKey || event.metaKey || event.altKey) return;
    const teclasPermitidas = ['Tab', 'Enter', 'Escape', 'ArrowLeft', 'ArrowRight', 'Home', 'End'];
    if (teclasPermitidas.includes(event.key)) return;
    const input = event.target as HTMLInputElement;
    const tudoSelecionado = input.selectionStart === 0 && input.selectionEnd === input.value.length;
    if (/^\d$/.test(event.key)) { event.preventDefault(); const valorBase = tudoSelecionado ? 0 : this.valoresMoeda[campo]; const novoValor = Math.trunc(valorBase * 10) + Number(event.key); this.definirMoeda(campo, novoValor, input); return; }
    if (event.key === 'Backspace' || event.key === 'Delete') { event.preventDefault(); const novoValor = tudoSelecionado ? 0 : Math.trunc(this.valoresMoeda[campo] / 10); this.definirMoeda(campo, novoValor, input); return; }
    event.preventDefault();
  }

  aoColarMoeda(campo: CampoMoeda, event: ClipboardEvent): void { event.preventDefault(); const texto = event.clipboardData?.getData('text') ?? ''; const valor = this.converterTextoMoedaParaNumero(texto); this.definirMoeda(campo, valor, event.target as HTMLInputElement); }
  selecionarCampoMoeda(event: Event): void { const input = event.target as HTMLInputElement; setTimeout(() => input.select()); }
  confirmarAviso(): void { const acao = this.aviso?.aoConfirmar; this.fecharAviso(); acao?.(); }
  fecharAviso(): void { this.limparTimerAviso(); this.aviso = null; }
  campoInvalido(campo: CampoFormulario): boolean { const controle = this.form.controls[campo]; return controle.invalid && (controle.dirty || controle.touched); }
  mensagemErroDataEvento(): string { const controle = this.form.controls.dataEvento; if (controle.hasError('dataPassada')) return `A data não pode ser anterior a hoje (${this.formatarDataInputPtBr(this.dataMinimaEvento)}).`; return 'Informe a data.'; }
  podeExcluir(evento: Evento): boolean { const status = this.normalizarStatusPersistido(evento.status); return status !== 'Cancelado' && status !== 'Finalizado'; }

  statusOperacionalRotulo(evento: Evento): string { return this.obterSituacaoOperacional(evento).rotulo; }
  classeStatusOperacional(evento: Evento): string { return this.obterSituacaoOperacional(evento).classe; }
  mensagemOperacional(evento: Evento): string | null { return this.obterSituacaoOperacional(evento).mensagem ?? null; }

  formatarPeriodoEvento(evento: Evento): string {
    const dataInicio = this.extrairDataUtc(evento.dataEvento); if (!dataInicio) return this.formatarData(evento.dataEvento);
    const inicio = this.formatarHorario(evento.horaInicio); const fim = this.formatarHorario(evento.horaFim); const terminaNoDiaSeguinte = inicio !== '-' && fim !== '-' && fim < inicio;
    if (!terminaNoDiaSeguinte) return this.formatarData(evento.dataEvento);
    const dataFim = new Date(dataInicio); dataFim.setUTCDate(dataFim.getUTCDate() + 1);
    return `${this.formatarDataPorDate(dataInicio)} - ${this.formatarDataPorDate(dataFim)}`;
  }
  formatarData(valor: string): string { const data = this.extrairDataUtc(valor); if (!data) return valor || '-'; return this.formatarDataPorDate(data); }
  formatarHorario(valor: string): string { return String(valor ?? '').slice(0, 5) || '-'; }
  formatarMoeda(valor: number): string { return this.formatarMoedaInput(valor); }

  classeStatus(status: EventoStatus): string {
    const mapa: Record<string, string> = { Rascunho: 'tag-badge-neutral', 'Rascunho em andamento': 'tag-badge-warning', 'Rascunho vencido': 'tag-badge-warning', Escalado: 'tag-badge-info', 'Escalado encerrado': 'tag-badge-warning', Finalizado: 'tag-badge-success', Cancelado: 'tag-badge-danger' };
    return mapa[status] ?? 'tag-badge-neutral';
  }

  private aplicarStatusOperacional(evento: Evento): Evento {
    const situacao = this.obterSituacaoOperacional(evento);
    return situacao.rotulo === evento.status ? evento : { ...evento, status: situacao.rotulo as EventoStatus };
  }

  private obterSituacaoOperacional(evento: Evento): SituacaoOperacionalEvento {
    const status = this.normalizarStatusPersistido(evento.status);
    if (status === 'Rascunho') {
      const intervalo = this.obterIntervaloEventoLocal(evento); const agora = new Date();
      if (intervalo && agora >= intervalo.fim) return { rotulo: 'Rascunho vencido', classe: 'tag-badge-warning', mensagem: 'Evento vencido sem escala finalizada.' };
      if (intervalo && agora >= intervalo.inicio && agora < intervalo.fim) return { rotulo: 'Rascunho em andamento', classe: 'tag-badge-warning', mensagem: 'Evento em andamento sem escala finalizada.' };
    }
    if (status === 'Escalado') {
      const intervalo = this.obterIntervaloEventoLocal(evento);
      if (intervalo && new Date() >= intervalo.fim) return { rotulo: 'Escalado encerrado', classe: 'tag-badge-warning', mensagem: 'Evento encerrado aguardando finalização automática.' };
    }
    return { rotulo: status, classe: this.classeStatus(status) };
  }

  private normalizarStatusPersistido(status: EventoStatus): EventoStatus {
    if (status === 'Rascunho em andamento' || status === 'Rascunho vencido') return 'Rascunho';
    if (status === 'Escalado encerrado') return 'Escalado';
    return status;
  }

  private executarExclusao(evento: Evento): void { this.erro = ''; this.eventosService.cancelar(evento.id).subscribe({ next: () => { this.abrirSucesso('Evento excluído', 'Evento removido da listagem operacional.'); this.carregarEventos(); }, error: (error: unknown) => { const mensagem = obterMensagemErroApi(error); this.erro = mensagem; this.abrirErro('Não foi possível excluir', mensagem); } }); }
  private validarHorario(): string | null { const raw = this.form.getRawValue(); if (!raw.horaInicio || !raw.horaFim) return null; if (raw.horaInicio === raw.horaFim) return 'O horário final deve ser diferente do horário inicial.'; return null; }
  private montarRequest(): EventoRequest { const raw = this.form.getRawValue(); return { casaId: raw.casaId, tipoEventoId: raw.tipoEventoId, nome: raw.nome.trim(), dataEvento: `${raw.dataEvento}T00:00:00`, horaInicio: this.normalizarHorario(raw.horaInicio), horaFim: this.normalizarHorario(raw.horaFim), valorDiaria: this.converterTextoMoedaParaNumero(raw.valorDiaria), valorHoraExtra: this.converterTextoMoedaParaNumero(raw.valorHoraExtra) }; }
  private formatarDataInput(valor: string): string { return String(valor ?? '').slice(0, 10); }
  private formatarDataInputPtBr(valor: string): string { if (!/^\d{4}-\d{2}-\d{2}$/.test(valor)) return valor; const [ano, mes, dia] = valor.split('-'); return `${dia}/${mes}/${ano}`; }
  private formatarHorarioInput(valor: string): string { return String(valor ?? '').slice(0, 5); }
  private normalizarHorario(valor: string): string { return valor.length === 5 ? `${valor}:00` : valor; }
  private obterDataHojeInput(): string { const hoje = new Date(); const ano = hoje.getFullYear(); const mes = String(hoje.getMonth() + 1).padStart(2, '0'); const dia = String(hoje.getDate()).padStart(2, '0'); return `${ano}-${mes}-${dia}`; }
  private definirMoeda(campo: CampoMoeda, valor: number, input?: HTMLInputElement): void { const valorNormalizado = Number.isFinite(valor) && valor > 0 ? valor : 0; this.valoresMoeda[campo] = valorNormalizado; const controle = this.form.controls[campo]; controle.setValue(this.formatarMoedaInput(valorNormalizado), { emitEvent: false }); controle.updateValueAndValidity({ emitEvent: false }); if (input) { controle.markAsDirty(); setTimeout(() => input.setSelectionRange(input.value.length, input.value.length)); } }
  private formatarMoedaInput(valor: number): string { return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor || 0); }
  private converterTextoMoedaParaNumero(valor: string): number { const texto = String(valor ?? '').trim(); if (!texto) return 0; const limpo = texto.replace(/[^\d,.-]/g, ''); if (!limpo) return 0; if (limpo.includes(',')) { const normalizado = limpo.replace(/\./g, '').replace(',', '.'); const numero = Number(normalizado); return Number.isFinite(numero) ? numero : 0; } const numero = Number(limpo.replace(/\./g, '')); return Number.isFinite(numero) ? numero : 0; }
  private valorMonetarioMinimo(minimo: number): ValidatorFn { return (control: AbstractControl): ValidationErrors | null => { const valor = this.converterTextoMoedaParaNumero(control.value); return valor >= minimo ? null : { valorMonetarioMinimo: true }; }; }
  private dataEventoMinimaHoje(): ValidatorFn { return (control: AbstractControl): ValidationErrors | null => { const valor = String(control.value ?? ''); if (!valor) return null; return valor >= this.dataMinimaEvento ? null : { dataPassada: true }; }; }
  private extrairDataUtc(valor: string): Date | null { const texto = String(valor ?? '').slice(0, 10); if (!/^\d{4}-\d{2}-\d{2}$/.test(texto)) return null; const [ano, mes, dia] = texto.split('-').map(Number); return new Date(Date.UTC(ano, mes - 1, dia)); }
  private obterIntervaloEventoLocal(evento: Evento): { inicio: Date; fim: Date } | null { const data = String(evento.dataEvento ?? '').slice(0, 10); const horaInicio = this.formatarHorario(evento.horaInicio); const horaFim = this.formatarHorario(evento.horaFim); if (!/^\d{4}-\d{2}-\d{2}$/.test(data) || !/^\d{2}:\d{2}$/.test(horaInicio) || !/^\d{2}:\d{2}$/.test(horaFim)) return null; const [ano, mes, dia] = data.split('-').map(Number); const [inicioHora, inicioMinuto] = horaInicio.split(':').map(Number); const [fimHora, fimMinuto] = horaFim.split(':').map(Number); const inicio = new Date(ano, mes - 1, dia, inicioHora, inicioMinuto, 0, 0); const fim = new Date(ano, mes - 1, dia, fimHora, fimMinuto, 0, 0); if (fim < inicio) fim.setDate(fim.getDate() + 1); return { inicio, fim }; }
  private formatarDataPorDate(data: Date): string { return new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC' }).format(data); }
  private abrirConfirmacao(aviso: AvisoState): void { this.limparTimerAviso(); this.aviso = aviso; }
  private abrirErro(titulo: string, mensagem: string, detalhe?: string): void { this.limparTimerAviso(); this.aviso = { tipo: 'erro', titulo, mensagem, detalhe, textoPrincipal: 'Entendi' }; }
  private abrirSucesso(titulo: string, mensagem = 'Registro gravado com sucesso.'): void { this.limparTimerAviso(); this.aviso = { tipo: 'sucesso', titulo, mensagem, textoPrincipal: '' }; this.avisoTimeoutId = setTimeout(() => this.fecharAviso(), 2500); }
  private limparTimerAviso(): void { if (this.avisoTimeoutId) { clearTimeout(this.avisoTimeoutId); this.avisoTimeoutId = null; } }
  private normalizarPageSize(valor: number): number { return this.pageSizeOptions.includes(valor) ? valor : 5; }
}
