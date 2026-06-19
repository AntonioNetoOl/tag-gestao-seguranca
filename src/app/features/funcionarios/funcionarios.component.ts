import { DatePipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';

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
    rg: ['', [Validators.required, Validators.maxLength(12)]],
    cpf: ['', [Validators.required, this.validarCpf]],
    chavePix: ['', [Validators.maxLength(200)]],
    telefone: ['', [Validators.maxLength(15)]],
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
      rg: this.formatarRg(funcionario.rg),
      cpf: this.formatarCpf(funcionario.cpf),
      chavePix: funcionario.chavePix ?? '',
      telefone: funcionario.telefone ? this.formatarTelefone(funcionario.telefone) : '',
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

  aplicarMascaraCpf(event: Event): void {
    const valor = this.formatarCpf((event.target as HTMLInputElement).value);
    this.form.controls.cpf.setValue(valor, { emitEvent: false });
  }

  aplicarMascaraRg(event: Event): void {
    const valor = this.formatarRg((event.target as HTMLInputElement).value);
    this.form.controls.rg.setValue(valor, { emitEvent: false });
  }

  aplicarMascaraTelefone(event: Event): void {
    const valor = this.formatarTelefone((event.target as HTMLInputElement).value);
    this.form.controls.telefone.setValue(valor, { emitEvent: false });
  }

  campoInvalido(campo: CampoFormulario): boolean {
    const controle = this.form.controls[campo];
    return controle.invalid && (controle.dirty || controle.touched);
  }

  formatarCpf(cpf: string): string {
    const numeros = this.somenteNumeros(cpf).slice(0, 11);

    if (numeros.length <= 3) {
      return numeros;
    }

    if (numeros.length <= 6) {
      return `${numeros.slice(0, 3)}.${numeros.slice(3)}`;
    }

    if (numeros.length <= 9) {
      return `${numeros.slice(0, 3)}.${numeros.slice(3, 6)}.${numeros.slice(6)}`;
    }

    return `${numeros.slice(0, 3)}.${numeros.slice(3, 6)}.${numeros.slice(6, 9)}-${numeros.slice(9)}`;
  }

  formatarRg(rg: string): string {
    const caracteres = this.normalizarRg(rg).slice(0, 9);

    if (caracteres.length <= 2) {
      return caracteres;
    }

    if (caracteres.length <= 5) {
      return `${caracteres.slice(0, 2)}.${caracteres.slice(2)}`;
    }

    if (caracteres.length <= 8) {
      return `${caracteres.slice(0, 2)}.${caracteres.slice(2, 5)}.${caracteres.slice(5)}`;
    }

    return `${caracteres.slice(0, 2)}.${caracteres.slice(2, 5)}.${caracteres.slice(5, 8)}-${caracteres.slice(8)}`;
  }

  formatarTelefone(telefone: string): string {
    const numeros = this.somenteNumeros(telefone).slice(0, 11);

    if (numeros.length <= 2) {
      return numeros;
    }

    if (numeros.length <= 6) {
      return `(${numeros.slice(0, 2)}) ${numeros.slice(2)}`;
    }

    if (numeros.length <= 10) {
      return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 6)}-${numeros.slice(6)}`;
    }

    return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 7)}-${numeros.slice(7)}`;
  }

  private validarCpf(control: AbstractControl): ValidationErrors | null {
    const cpf = String(control.value ?? '').replace(/\D/g, '');

    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
      return { cpf: true };
    }

    let soma = 0;
    for (let i = 0; i < 9; i++) {
      soma += Number(cpf[i]) * (10 - i);
    }

    let digito = (soma * 10) % 11;
    digito = digito === 10 ? 0 : digito;

    if (digito !== Number(cpf[9])) {
      return { cpf: true };
    }

    soma = 0;
    for (let i = 0; i < 10; i++) {
      soma += Number(cpf[i]) * (11 - i);
    }

    digito = (soma * 10) % 11;
    digito = digito === 10 ? 0 : digito;

    return digito === Number(cpf[10]) ? null : { cpf: true };
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
      rg: this.normalizarRg(raw.rg),
      cpf: this.somenteNumeros(raw.cpf),
      chavePix: this.normalizarOpcional(raw.chavePix),
      telefone: this.normalizarOpcional(this.somenteNumeros(raw.telefone)),
      email: this.normalizarOpcional(raw.email),
      funcao: raw.funcao.trim()
    };
  }

  private normalizarOpcional(valor: string): string | null {
    const normalizado = valor.trim();
    return normalizado ? normalizado : null;
  }

  private somenteNumeros(valor: string): string {
    return valor.replace(/\D/g, '');
  }

  private normalizarRg(valor: string): string {
    return valor.replace(/[^0-9a-zA-Z]/g, '').toUpperCase();
  }
}
