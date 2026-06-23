import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { obterMensagemErroApi } from '../../core/api/api-error.util';
import { PagedResponse } from '../../core/models/paged-response.model';
import { FiltroAtivoTipoEvento, TipoEvento, TipoEventoRequest } from './tipos-evento.models';
import { TiposEventoService } from './tipos-evento.service';

type ModoFormulario = 'criar' | 'editar';
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
  selector: 'app-tipos-evento-page',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './tipos-evento.component.html',
  styleUrl: './tipos-evento.component.css'
})
export class TiposEventoPageComponent implements OnInit, OnDestroy {
  private readonly tiposEventoService = inject(TiposEventoService);
  private readonly formBuilder = inject(FormBuilder);
  private avisoTimeoutId: ReturnType<typeof setTimeout> | null = null;

  carregando = true;
  salvando = false;
  erro = '';
  modalAberto = false;
  modoFormulario: ModoFormulario = 'criar';
  tipoSelecionado: TipoEvento | null = null;
  aviso: AvisoState | null = null;

  page = 1;
  pageSize = 5;
  busca = '';
  filtroAtivo: FiltroAtivoTipoEvento = 'todos';
  readonly pageSizeOptions = [5, 10, 15, 20];

  resultado: PagedResponse<TipoEvento> = { items: [], page: 1, pageSize: 5, totalItems: 0, totalPages: 0 };

  readonly form = this.formBuilder.nonNullable.group({
    nome: ['', [Validators.required, Validators.maxLength(100)]]
  });

  ngOnInit(): void {
    this.carregarTiposEvento();
  }

  ngOnDestroy(): void {
    this.limparTimerAviso();
  }

  carregarTiposEvento(): void {
    this.carregando = true;
    this.erro = '';

    this.tiposEventoService.listar({
      busca: this.busca.trim() || undefined,
      ativo: this.converterFiltroAtivo(),
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
    this.carregarTiposEvento();
  }

  limparFiltros(): void {
    this.busca = '';
    this.filtroAtivo = 'todos';
    this.page = 1;
    this.carregarTiposEvento();
  }

  alterarBusca(event: Event): void {
    this.busca = (event.target as HTMLInputElement).value;
  }

  alterarFiltroAtivo(event: Event): void {
    this.filtroAtivo = (event.target as HTMLSelectElement).value as FiltroAtivoTipoEvento;
    this.pesquisar();
  }

  alterarPageSize(event: Event): void {
    this.pageSize = this.normalizarPageSize(Number((event.target as HTMLSelectElement).value));
    this.page = 1;
    this.carregarTiposEvento();
  }

  paginaAnterior(): void {
    if (this.page <= 1) return;
    this.page--;
    this.carregarTiposEvento();
  }

  proximaPagina(): void {
    if (this.page >= this.resultado.totalPages) return;
    this.page++;
    this.carregarTiposEvento();
  }

  abrirNovo(): void {
    this.modoFormulario = 'criar';
    this.tipoSelecionado = null;
    this.erro = '';
    this.form.reset();
    this.modalAberto = true;
  }

  abrirEdicao(tipo: TipoEvento): void {
    this.modoFormulario = 'editar';
    this.tipoSelecionado = tipo;
    this.erro = '';
    this.form.setValue({ nome: tipo.nome });
    this.modalAberto = true;
  }

  fecharModal(): void {
    if (this.salvando) return;
    this.modalAberto = false;
    this.tipoSelecionado = null;
    this.form.reset();
  }

  salvar(): void {
    this.erro = '';

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.abrirErro('Revise o cadastro', 'Informe o nome do tipo de evento antes de salvar.');
      return;
    }

    const request = this.montarRequest();
    const mensagemSucesso = this.modoFormulario === 'criar' ? 'Tipo de evento cadastrado com sucesso.' : 'Tipo de evento atualizado com sucesso.';
    this.salvando = true;

    const operacao = this.modoFormulario === 'criar'
      ? this.tiposEventoService.criar(request)
      : this.tiposEventoService.atualizar(this.tipoSelecionado?.id ?? '', request);

    operacao.subscribe({
      next: () => {
        this.salvando = false;
        this.modalAberto = false;
        this.abrirSucesso('Registro salvo', mensagemSucesso);
        this.carregarTiposEvento();
      },
      error: (error: unknown) => {
        const mensagem = obterMensagemErroApi(error);
        this.salvando = false;
        this.erro = mensagem;
        this.abrirErro('Não foi possível salvar', mensagem);
      }
    });
  }

  excluir(tipo: TipoEvento): void {
    this.abrirConfirmacao({
      tipo: 'pergunta',
      titulo: 'Confirmar exclusão',
      mensagem: `Excluir o tipo de evento ${tipo.nome}?`,
      detalhe: 'O tipo será removido das opções de novos eventos, mas continuará preservado no histórico e nos relatórios.',
      textoPrincipal: 'Excluir',
      textoSecundario: 'Cancelar',
      aoConfirmar: () => this.executarExclusao(tipo)
    });
  }

  restaurar(tipo: TipoEvento): void {
    this.abrirConfirmacao({
      tipo: 'pergunta',
      titulo: 'Confirmar restauração',
      mensagem: `Restaurar o tipo de evento ${tipo.nome}?`,
      detalhe: 'Após a restauração, ele voltará a aparecer no cadastro de eventos.',
      textoPrincipal: 'Restaurar',
      textoSecundario: 'Cancelar',
      aoConfirmar: () => this.executarRestauracao(tipo)
    });
  }

  confirmarAviso(): void {
    const acao = this.aviso?.aoConfirmar;
    this.fecharAviso();
    acao?.();
  }

  fecharAviso(): void {
    this.limparTimerAviso();
    this.aviso = null;
  }

  campoNomeInvalido(): boolean {
    const controle = this.form.controls.nome;
    return controle.invalid && (controle.dirty || controle.touched);
  }

  private executarExclusao(tipo: TipoEvento): void {
    this.erro = '';

    this.tiposEventoService.excluir(tipo.id).subscribe({
      next: () => {
        this.abrirSucesso('Registro excluído', 'Tipo de evento excluído com sucesso.');
        this.carregarTiposEvento();
      },
      error: (error: unknown) => {
        const mensagem = obterMensagemErroApi(error);
        this.erro = mensagem;
        this.abrirErro('Não foi possível excluir', mensagem);
      }
    });
  }

  private executarRestauracao(tipo: TipoEvento): void {
    this.erro = '';

    this.tiposEventoService.restaurar(tipo.id).subscribe({
      next: () => {
        this.abrirSucesso('Registro restaurado', 'Tipo de evento restaurado com sucesso.');
        this.carregarTiposEvento();
      },
      error: (error: unknown) => {
        const mensagem = obterMensagemErroApi(error);
        this.erro = mensagem;
        this.abrirErro('Não foi possível restaurar', mensagem);
      }
    });
  }

  private abrirConfirmacao(aviso: AvisoState): void {
    this.limparTimerAviso();
    this.aviso = aviso;
  }

  private abrirErro(titulo: string, mensagem: string, detalhe?: string): void {
    this.limparTimerAviso();
    this.aviso = { tipo: 'erro', titulo, mensagem, detalhe, textoPrincipal: 'Entendi' };
  }

  private abrirSucesso(titulo: string, mensagem = 'Registro gravado com sucesso.'): void {
    this.limparTimerAviso();
    this.aviso = { tipo: 'sucesso', titulo, mensagem, textoPrincipal: '' };
    this.avisoTimeoutId = setTimeout(() => this.fecharAviso(), 2500);
  }

  private limparTimerAviso(): void {
    if (this.avisoTimeoutId) {
      clearTimeout(this.avisoTimeoutId);
      this.avisoTimeoutId = null;
    }
  }

  private converterFiltroAtivo(): boolean | undefined {
    if (this.filtroAtivo === 'ativos') return true;
    if (this.filtroAtivo === 'excluidos') return false;
    return undefined;
  }

  private montarRequest(): TipoEventoRequest {
    const raw = this.form.getRawValue();
    return { nome: raw.nome.trim() };
  }

  private normalizarPageSize(valor: number): number {
    return this.pageSizeOptions.includes(valor) ? valor : 5;
  }
}
