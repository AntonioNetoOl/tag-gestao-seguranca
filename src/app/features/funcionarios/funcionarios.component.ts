import { DatePipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { obterMensagemErroApi } from '../../core/api/api-error.util';
import { PagedResponse } from '../../core/models/paged-response.model';
import { Funcionario, FiltroAtivoFuncionario, FuncionarioRequest } from './funcionarios.models';
import { FuncionariosService } from './funcionarios.service';

type ModoFormulario = 'criar' | 'editar';
type CampoFormulario = 'nomeCompleto' | 'rg' | 'cpf' | 'chavePix' | 'telefone' | 'email' | 'funcao';

@Component({
  selector: 'app-funcionarios',
  standalone: true,
  imports: [DatePipe, ReactiveFormsModule],
  templateUrl: './funcionarios.component.html',
  styleUrl: './funcionarios.component.css'
})
export class FuncionariosComponent implements OnInit {
  private readonly funcionariosService = inject(FuncionariosService);
  private readonly formBuilder = inject(FormBuilder);

  carregando = true;
  salvando = false;
  erro = '';
  sucesso = '';
  modalAberto = false;
  modoFormulario: ModoFormulario = 'criar';
  funcionarioSelecionado: Funcionario | null = null;

  page = 1;
  pageSize = 10;
  busca = '';
  filtroAtivo: FiltroAtivoFuncionario = 'todos';

  readonly pageSizeOptions = [10, 20, 50];

  resultado: PagedResponse<Funcionario> = {
    items: [],
    page: 1,
    pageSize: 10,
    totalItems: 0,
    totalPages: 0
  };

  readonly form = this.formBuilder.nonNullable.group({
    nomeCompleto: ['', [Validators.required, Validators.maxLength(200)]],
    rg: ['', [Validators.required, Validators.maxLength(30)]],
    cpf: ['', [Validators.required, Validators.minLength(11), Validators.maxLength(14)]],
    chavePix: ['', [Validators.maxLength(200)]],
    telefone: ['', [Validators.maxLength(30)]],
    email: ['', [Validators.email, Validators.maxLength(150)]],
    funcao: ['', [Validators.required, Validators.maxLength(100)]]
  });

  ngOnInit(): void {
    this.carregarFuncionarios();
  }

  carregarFuncionarios(): void {
    this.carregando = true;
    this.erro = '';

    this.funcionariosService
      .listar({
        busca: this.busca.trim() || undefined,
        ativo: this.converterFiltroAtivo(),
        page: this.page,
        pageSize: this.pageSize
      })
      .subscribe({
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
    this.carregarFuncionarios();
  }

  limparFiltros(): void {
    this.busca = '';
    this.filtroAtivo = 'todos';
    this.page = 1;
    this.carregarFuncionarios();
  }

  alterarBusca(event: Event): void {
    this.busca = (event.target as HTMLInputElement).value;
  }

  alterarFiltroAtivo(event: Event): void {
    this.filtroAtivo = (event.target as HTMLSelectElement).value as FiltroAtivoFuncionario;
    this.pesquisar();
  }

  alterarPageSize(event: Event): void {
    this.pageSize = Number((event.target as HTMLSelectElement).value);
    this.page = 1;
    this.carregarFuncionarios();
  }

  paginaAnterior(): void {
    if (this.page <= 1) {
      return;
    }

    this.page--;
    this.carregarFuncionarios();
  }

  proximaPagina(): void {
    if (this.page >= this.resultado.totalPages) {
      return;
    }

    this.page++;
    this.carregarFuncionarios();
  }

  abrirNovo(): void {
    this.modoFormulario = 'criar';
    this.funcionarioSelecionado = null;
    this.sucesso = '';
    this.erro = '';
    this.form.reset();
    this.modalAberto = true;
  }

  abrirEdicao(funcionario: Funcionario): void {
    this.modoFormulario = 'editar';
    this.funcionarioSelecionado = funcionario;
    this.sucesso = '';
    this.erro = '';
    this.form.setValue({
      nomeCompleto: funcionario.nomeCompleto,
      rg: funcionario.rg,
      cpf: this.formatarCpf(funcionario.cpf),
      chavePix: funcionario.chavePix ?? '',
      telefone: funcionario.telefone ?? '',
      email: funcionario.email ?? '',
      funcao: funcionario.funcao
    });
    this.modalAberto = true;
  }

  fecharModal(): void {
    if (this.salvando) {
      return;
    }

    this.modalAberto = false;
    this.funcionarioSelecionado = null;
    this.form.reset();
  }

  salvar(): void {
    this.erro = '';
    this.sucesso = '';

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const request = this.montarRequest();
    this.salvando = true;

    const operacao = this.modoFormulario === 'criar'
      ? this.funcionariosService.criar(request)
      : this.funcionariosService.atualizar(this.funcionarioSelecionado?.id ?? '', request);

    operacao.subscribe({
      next: () => {
        this.salvando = false;
        this.modalAberto = false;
        this.sucesso = this.modoFormulario === 'criar'
          ? 'Funcionário cadastrado com sucesso.'
          : 'Funcionário atualizado com sucesso.';
        this.carregarFuncionarios();
      },
      error: (error: unknown) => {
        this.salvando = false;
        this.erro = obterMensagemErroApi(error);
      }
    });
  }

  inativar(funcionario: Funcionario): void {
    if (!window.confirm(`Inativar o funcionário ${funcionario.nomeCompleto}?`)) {
      return;
    }

    this.erro = '';
    this.sucesso = '';

    this.funcionariosService.inativar(funcionario.id).subscribe({
      next: () => {
        this.sucesso = 'Funcionário inativado com sucesso.';
        this.carregarFuncionarios();
      },
      error: (error: unknown) => {
        this.erro = obterMensagemErroApi(error);
      }
    });
  }

  ativar(funcionario: Funcionario): void {
    this.erro = '';
    this.sucesso = '';

    this.funcionariosService.ativar(funcionario.id).subscribe({
      next: () => {
        this.sucesso = 'Funcionário reativado com sucesso.';
        this.carregarFuncionarios();
      },
      error: (error: unknown) => {
        this.erro = obterMensagemErroApi(error);
      }
    });
  }

  campoInvalido(campo: CampoFormulario): boolean {
    const controle = this.form.controls[campo];
    return controle.invalid && (controle.dirty || controle.touched);
  }

  formatarCpf(cpf: string): string {
    const numeros = cpf.replace(/\D/g, '').slice(0, 11);

    if (numeros.length !== 11) {
      return cpf;
    }

    return `${numeros.slice(0, 3)}.${numeros.slice(3, 6)}.${numeros.slice(6, 9)}-${numeros.slice(9)}`;
  }

  private converterFiltroAtivo(): boolean | undefined {
    if (this.filtroAtivo === 'ativos') {
      return true;
    }

    if (this.filtroAtivo === 'inativos') {
      return false;
    }

    return undefined;
  }

  private montarRequest(): FuncionarioRequest {
    const raw = this.form.getRawValue();

    return {
      nomeCompleto: raw.nomeCompleto.trim(),
      rg: raw.rg.trim(),
      cpf: raw.cpf.replace(/\D/g, ''),
      chavePix: this.normalizarOpcional(raw.chavePix),
      telefone: this.normalizarOpcional(raw.telefone),
      email: this.normalizarOpcional(raw.email),
      funcao: raw.funcao.trim()
    };
  }

  private normalizarOpcional(valor: string): string | null {
    const normalizado = valor.trim();
    return normalizado ? normalizado : null;
  }
}
