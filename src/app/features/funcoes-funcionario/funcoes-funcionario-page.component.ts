import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { obterMensagemErroApi } from '../../core/api/api-error.util';
import { PagedResponse } from '../../core/models/paged-response.model';
import {
  FiltroAtivoFuncaoFuncionario,
  FuncaoFuncionario,
  FuncaoFuncionarioRequest
} from './funcoes-funcionario.models';
import { FuncoesFuncionarioService } from './funcoes-funcionario.service';

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
  selector: 'app-funcoes-funcionario-page',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './funcoes-funcionario.component.html',
  styleUrl: './funcoes-funcionario.component.css'
})
export class FuncoesFuncionarioPageComponent implements OnInit, OnDestroy {
  private readonly funcoesService = inject(FuncoesFuncionarioService);
  private readonly formBuilder = inject(FormBuilder);
  private avisoTimeoutId: ReturnType<typeof setTimeout> | null = null;

  carregando = true;
  salvando = false;
  erro = '';
  modalAberto = false;
  modoFormulario: ModoFormulario = 'criar';
  funcaoSelecionada: FuncaoFuncionario | null = null;
  aviso: AvisoState | null = null;

  page = 1;
  pageSize = 5;
  busca = '';
  filtroAtivo: FiltroAtivoFuncaoFuncionario = 'todos';

  readonly pageSizeOptions = [5, 10, 15, 20];

  resultado: PagedResponse<FuncaoFuncionario> = { items: [], page: 1, pageSize: 5, totalItems: 0, totalPages: 0 };

  readonly form = this.formBuilder.nonNullable.group({
    nome: ['', [Validators.required, Validators.maxLength(100)]]
  });

  ngOnInit(): void {
    this.carregarFuncoes();
  }

  ngOnDestroy(): void {
    this.limparTimerAviso();
  }

  carregarFuncoes(): void {
    this.carregando = true;
    this.erro = '';

    this.funcoesService.listar({
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
    this.carregarFuncoes();
  }

  limparFiltros(): void {
    this.busca = '';
    this.filtroAtivo = 'todos';
    this.page = 1;
    this.carregarFuncoes();
  }

  alterarBusca(event: Event): void {
    this.busca = (event.target as HTMLInputElement).value;
  }

  alterarFiltroAtivo(event: Event): void {
    this.filtroAtivo = (event.target as HTMLSelectElement).value as FiltroAtivoFuncaoFuncionario;
    this.pesquisar();
  }

  alterarPageSize(event: Event): void {
    this.pageSize = this.normalizarPageSize(Number((event.target as HTMLSelectElement).value));
    this.page = 1;
    this.carregarFuncoes();
  }

  paginaAnterior(): void {
    if (this.page <= 1) return;
    this.page--;
    this.carregarFuncoes();
  }

  proximaPagina(): void {
    if (this.page >= this.resultado.totalPages) return;
    this.page++;
    this.carregarFuncoes();
  }

  abrirNovo(): void {
    this.modoFormulario = 'criar';
    this.funcaoSelecionada = null;
    this.erro = '';
    this.form.reset();
    this.modalAberto = true;
  }

  abrirEdicao(funcao: FuncaoFuncionario): void {
    this.modoFormulario = 'editar';
    this.funcaoSelecionada = funcao;
    this.erro = '';
    this.form.setValue({ nome: funcao.nome });
    this.modalAberto = true;
  }

  fecharModal(): void {
    if (this.salvando) return;
    this.modalAberto = false;
    this.funcaoSelecionada = null;
    this.form.reset();
  }

  salvar(): void {
    this.erro = '';

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.abrirErro('Revise o cadastro', 'Informe o nome da função antes de salvar.');
      return;
    }

    const request = this.montarRequest();
    const mensagemSucesso = this.modoFormulario === 'criar' ? 'Função cadastrada com sucesso.' : 'Função atualizada com sucesso.';
    this.salvando = true;

    const operacao = this.modoFormulario === 'criar'
      ? this.funcoesService.criar(request)
      : this.funcoesService.atualizar(this.funcaoSelecionada?.id ?? '', request);

    operacao.subscribe({
      next: () => {
        this.salvando = false;
        this.modalAberto = false;
        this.abrirSucesso('Registro salvo', mensagemSucesso);
        this.carregarFuncoes();
      },
      error: (error: unknown) => {
        const mensagem = obterMensagemErroApi(error);
        this.salvando = false;
        this.erro = mensagem;
        this.abrirErro('Não foi possível salvar', mensagem);
      }
    });
  }

  inativar(funcao: FuncaoFuncionario): void {
    this.abrirConfirmacao({
      tipo: 'pergunta',
      titulo: 'Confirmar inativação',
      mensagem: `Inativar a função ${funcao.nome}?`,
      detalhe: 'A função deixará de aparecer nas opções de novos funcionários, mas os registros históricos permanecem preservados.',
      textoPrincipal: 'Inativar',
      textoSecundario: 'Cancelar',
      aoConfirmar: () => this.executarInativacao(funcao)
    });
  }

  ativar(funcao: FuncaoFuncionario): void {
    this.abrirConfirmacao({
      tipo: 'pergunta',
      titulo: 'Confirmar reativação',
      mensagem: `Reativar a função ${funcao.nome}?`,
      detalhe: 'Após a reativação, ela voltará a aparecer no cadastro de funcionários.',
      textoPrincipal: 'Reativar',
      textoSecundario: 'Cancelar',
      aoConfirmar: () => this.executarReativacao(funcao)
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

  private executarInativacao(funcao: FuncaoFuncionario): void {
    this.erro = '';

    this.funcoesService.inativar(funcao.id).subscribe({
      next: () => {
        this.abrirSucesso('Registro atualizado', 'Função inativada com sucesso.');
        this.carregarFuncoes();
      },
      error: (error: unknown) => {
        const mensagem = obterMensagemErroApi(error);
        this.erro = mensagem;
        this.abrirErro('Não foi possível inativar', mensagem);
      }
    });
  }

  private executarReativacao(funcao: FuncaoFuncionario): void {
    this.erro = '';

    this.funcoesService.ativar(funcao.id).subscribe({
      next: () => {
        this.abrirSucesso('Registro atualizado', 'Função reativada com sucesso.');
        this.carregarFuncoes();
      },
      error: (error: unknown) => {
        const mensagem = obterMensagemErroApi(error);
        this.erro = mensagem;
        this.abrirErro('Não foi possível reativar', mensagem);
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
    if (this.filtroAtivo === 'inativos') return false;
    return undefined;
  }

  private montarRequest(): FuncaoFuncionarioRequest {
    const raw = this.form.getRawValue();
    return { nome: raw.nome.trim() };
  }

  private normalizarPageSize(valor: number): number {
    return this.pageSizeOptions.includes(valor) ? valor : 5;
  }
}
