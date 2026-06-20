import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { obterMensagemErroApi } from '../../core/api/api-error.util';
import { PagedResponse } from '../../core/models/paged-response.model';
import { Casa, CasaRequest } from './casas.models';
import { CasasService } from './casas.service';

type ModoFormulario = 'criar' | 'editar';
type CampoFormulario = 'nome' | 'endereco' | 'cep';
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
  selector: 'app-casas-page',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './casas.component.html',
  styleUrl: './casas.component.css'
})
export class CasasPageComponent implements OnInit, OnDestroy {
  private readonly casasService = inject(CasasService);
  private readonly formBuilder = inject(FormBuilder);
  private avisoTimeoutId: ReturnType<typeof setTimeout> | null = null;

  carregando = true;
  salvando = false;
  erro = '';
  sucesso = '';
  modalAberto = false;
  modoFormulario: ModoFormulario = 'criar';
  casaSelecionada: Casa | null = null;
  aviso: AvisoState | null = null;

  page = 1;
  pageSize = 10;
  busca = '';
  readonly pageSizeOptions = [10, 20, 50];

  resultado: PagedResponse<Casa> = { items: [], page: 1, pageSize: 10, totalItems: 0, totalPages: 0 };

  readonly form = this.formBuilder.nonNullable.group({
    nome: ['', [Validators.required, Validators.maxLength(150)]],
    endereco: ['', [Validators.required, Validators.maxLength(300)]],
    cep: ['', [Validators.maxLength(9)]]
  });

  ngOnInit(): void {
    this.carregarCasas();
  }

  ngOnDestroy(): void {
    this.limparTimerAviso();
  }

  carregarCasas(): void {
    this.carregando = true;
    this.erro = '';

    this.casasService.listar({ busca: this.busca.trim() || undefined, page: this.page, pageSize: this.pageSize }).subscribe({
      next: (resultado) => {
        this.resultado = resultado;
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
    this.carregarCasas();
  }

  limparFiltros(): void {
    this.busca = '';
    this.page = 1;
    this.carregarCasas();
  }

  alterarBusca(event: Event): void {
    this.busca = (event.target as HTMLInputElement).value;
  }

  alterarPageSize(event: Event): void {
    this.pageSize = Number((event.target as HTMLSelectElement).value);
    this.page = 1;
    this.carregarCasas();
  }

  paginaAnterior(): void {
    if (this.page <= 1) return;
    this.page--;
    this.carregarCasas();
  }

  proximaPagina(): void {
    if (this.page >= this.resultado.totalPages) return;
    this.page++;
    this.carregarCasas();
  }

  abrirNovo(): void {
    this.modoFormulario = 'criar';
    this.casaSelecionada = null;
    this.sucesso = '';
    this.erro = '';
    this.form.reset();
    this.modalAberto = true;
  }

  abrirEdicao(casa: Casa): void {
    this.modoFormulario = 'editar';
    this.casaSelecionada = casa;
    this.sucesso = '';
    this.erro = '';
    this.form.setValue({
      nome: casa.nome,
      endereco: casa.endereco,
      cep: casa.cep ? this.formatarCep(casa.cep) : ''
    });
    this.modalAberto = true;
  }

  fecharModal(): void {
    if (this.salvando) return;
    this.modalAberto = false;
    this.casaSelecionada = null;
    this.form.reset();
  }

  salvar(): void {
    this.erro = '';
    this.sucesso = '';

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.abrirErro('Revise o cadastro', 'Existem campos obrigatórios ou inválidos no formulário.', 'Confira nome, endereço e CEP antes de salvar.');
      return;
    }

    const request = this.montarRequest();
    const mensagemSucesso = this.modoFormulario === 'criar' ? 'Casa cadastrada com sucesso.' : 'Casa atualizada com sucesso.';
    this.salvando = true;

    const operacao = this.modoFormulario === 'criar'
      ? this.casasService.criar(request)
      : this.casasService.atualizar(this.casaSelecionada?.id ?? '', request);

    operacao.subscribe({
      next: () => {
        this.salvando = false;
        this.modalAberto = false;
        this.sucesso = mensagemSucesso;
        this.abrirSucesso('Registro salvo', mensagemSucesso);
        this.carregarCasas();
      },
      error: (error: unknown) => {
        const mensagem = obterMensagemErroApi(error);
        this.salvando = false;
        this.erro = mensagem;
        this.abrirErro('Não foi possível salvar', mensagem);
      }
    });
  }

  excluir(casa: Casa): void {
    this.abrirConfirmacao({
      tipo: 'pergunta',
      titulo: 'Confirmar exclusão',
      mensagem: `Excluir a casa ${casa.nome}?`,
      detalhe: 'Esta ação só será permitida se a casa não tiver eventos vinculados.',
      textoPrincipal: 'Excluir',
      textoSecundario: 'Cancelar',
      aoConfirmar: () => this.executarExclusao(casa)
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

  aplicarMascaraCep(event: Event): void {
    this.form.controls.cep.setValue(this.formatarCep((event.target as HTMLInputElement).value), { emitEvent: false });
  }

  campoInvalido(campo: CampoFormulario): boolean {
    const controle = this.form.controls[campo];
    return controle.invalid && (controle.dirty || controle.touched);
  }

  formatarCep(cep: string | null): string {
    const numeros = this.somenteNumeros(cep ?? '').slice(0, 8);
    if (numeros.length <= 5) return numeros;
    return `${numeros.slice(0, 5)}-${numeros.slice(5)}`;
  }

  private executarExclusao(casa: Casa): void {
    this.erro = '';
    this.sucesso = '';

    this.casasService.excluir(casa.id).subscribe({
      next: () => {
        this.sucesso = 'Casa excluída com sucesso.';
        this.abrirSucesso('Registro excluído', 'Casa excluída com sucesso.');
        this.carregarCasas();
      },
      error: (error: unknown) => {
        const mensagem = obterMensagemErroApi(error);
        this.erro = mensagem;
        this.abrirErro('Não foi possível excluir', mensagem);
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

  private montarRequest(): CasaRequest {
    const raw = this.form.getRawValue();
    return {
      nome: raw.nome.trim(),
      endereco: raw.endereco.trim(),
      cep: this.normalizarOpcional(this.somenteNumeros(raw.cep))
    };
  }

  private normalizarOpcional(valor: string): string | null {
    const normalizado = valor.trim();
    return normalizado ? normalizado : null;
  }

  private somenteNumeros(valor: string): string {
    return valor.replace(/\D/g, '');
  }
}
