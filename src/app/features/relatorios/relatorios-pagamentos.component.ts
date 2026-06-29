import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { obterMensagemErroApi } from '../../core/api/api-error.util';
import { RelatorioFormato, RelatorioPagamentoFiltros } from './relatorios.models';
import { RelatoriosService } from './relatorios.service';

type AvisoTipo = 'erro' | 'sucesso';

interface AvisoState {
  tipo: AvisoTipo;
  titulo: string;
  mensagem: string;
  detalhe?: string;
}

@Component({
  selector: 'app-relatorios-pagamentos',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './relatorios-pagamentos.component.html',
  styleUrl: './relatorios.component.css'
})
export class RelatoriosPagamentosComponent implements OnInit, OnDestroy {
  private readonly formBuilder = inject(FormBuilder);
  private readonly relatoriosService = inject(RelatoriosService);
  private avisoTimeoutId: ReturnType<typeof setTimeout> | null = null;
  private relatorioTimeoutId: ReturnType<typeof setTimeout> | null = null;

  exportando = false;
  modalFormatoAberto = false;
  relatorioSucesso = false;
  aviso: AvisoState | null = null;

  readonly filtrosPagamentoForm = this.formBuilder.nonNullable.group({
    busca: [''],
    dataInicio: ['', [Validators.required]],
    dataFim: ['', [Validators.required]]
  });

  ngOnInit(): void {
    this.aplicarPeriodoUltimosSeteDias();
  }

  ngOnDestroy(): void {
    this.limparTimerAviso();
    this.limparTimerRelatorio();
  }

  abrirFormatoPagamento(): void {
    if (this.filtrosPagamentoForm.invalid) {
      this.filtrosPagamentoForm.markAllAsTouched();
      this.abrirErro('Informe o período', 'A data inicial e a data final são obrigatórias para emitir o relatório de pagamentos.');
      return;
    }

    const raw = this.filtrosPagamentoForm.getRawValue();
    if (raw.dataInicio > raw.dataFim) {
      this.abrirErro('Período inválido', 'A data inicial não pode ser maior que a data final.');
      return;
    }

    this.limparTimerRelatorio();
    this.relatorioSucesso = false;
    this.modalFormatoAberto = true;
  }

  fecharFormatoPagamento(): void {
    if (this.exportando) return;
    this.limparTimerRelatorio();
    this.modalFormatoAberto = false;
    this.relatorioSucesso = false;
  }

  emitirPagamento(formato: RelatorioFormato): void {
    const filtros = this.montarFiltrosPagamento();
    this.exportando = true;

    const operacao = formato === 'excel'
      ? this.relatoriosService.exportarPagamentosExcel(filtros)
      : this.relatoriosService.exportarPagamentosPdf(filtros);

    operacao.subscribe({
      next: (arquivo) => {
        this.baixarArquivo(arquivo, this.nomeArquivoPagamento(formato));
        this.exportando = false;
        this.relatorioSucesso = true;
        this.relatorioTimeoutId = setTimeout(() => this.fecharFormatoPagamento(), 1200);
      },
      error: (error: unknown) => {
        this.exportando = false;
        this.fecharFormatoPagamento();
        this.abrirErro('Não foi possível emitir o relatório', obterMensagemErroApi(error));
      }
    });
  }

  limparFiltrosPagamento(): void {
    this.filtrosPagamentoForm.reset({
      busca: '',
      dataInicio: '',
      dataFim: ''
    });
    this.aplicarPeriodoUltimosSeteDias();
  }

  campoInvalido(campo: 'dataInicio' | 'dataFim'): boolean {
    const controle = this.filtrosPagamentoForm.controls[campo];
    return controle.invalid && (controle.dirty || controle.touched);
  }

  fecharAviso(): void {
    this.limparTimerAviso();
    this.aviso = null;
  }

  private montarFiltrosPagamento(): RelatorioPagamentoFiltros {
    const raw = this.filtrosPagamentoForm.getRawValue();
    return {
      busca: raw.busca.trim() || undefined,
      dataInicio: raw.dataInicio,
      dataFim: raw.dataFim
    };
  }

  private baixarArquivo(arquivo: Blob, nomeArquivo: string): void {
    const url = URL.createObjectURL(arquivo);
    const link = document.createElement('a');
    link.href = url;
    link.download = nomeArquivo;
    link.click();
    URL.revokeObjectURL(url);
  }

  private nomeArquivoPagamento(formato: RelatorioFormato): string {
    const raw = this.filtrosPagamentoForm.getRawValue();
    const sufixo = `${raw.dataInicio || 'inicio'}-${raw.dataFim || 'fim'}`;
    return `relatorio-pagamentos-${sufixo}.${formato === 'excel' ? 'xlsx' : 'pdf'}`;
  }

  private aplicarPeriodoUltimosSeteDias(): void {
    const fim = new Date();
    const inicio = new Date();
    inicio.setDate(fim.getDate() - 6);

    this.filtrosPagamentoForm.patchValue({
      dataInicio: this.formatarDataInput(inicio),
      dataFim: this.formatarDataInput(fim)
    });
  }

  private formatarDataInput(data: Date): string {
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const dia = String(data.getDate()).padStart(2, '0');
    return `${ano}-${mes}-${dia}`;
  }

  private abrirErro(titulo: string, mensagem: string, detalhe?: string): void {
    this.limparTimerAviso();
    this.aviso = { tipo: 'erro', titulo, mensagem, detalhe };
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
