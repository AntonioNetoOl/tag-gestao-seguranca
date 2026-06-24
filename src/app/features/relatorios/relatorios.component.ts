import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { obterMensagemErroApi } from '../../core/api/api-error.util';
import { CasaOpcao } from '../casas/casas.models';
import { CasasService } from '../casas/casas.service';
import { RelatorioEscalaFiltros, RelatorioFormato } from './relatorios.models';
import { RelatoriosService } from './relatorios.service';

type AvisoTipo = 'erro' | 'sucesso';

interface AvisoState {
  tipo: AvisoTipo;
  titulo: string;
  mensagem: string;
  detalhe?: string;
}

@Component({
  selector: 'app-relatorios',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './relatorios.component.html',
  styleUrl: './relatorios.component.css'
})
export class RelatoriosComponent implements OnInit, OnDestroy {
  private readonly formBuilder = inject(FormBuilder);
  private readonly casasService = inject(CasasService);
  private readonly relatoriosService = inject(RelatoriosService);
  private avisoTimeoutId: ReturnType<typeof setTimeout> | null = null;
  private relatorioTimeoutId: ReturnType<typeof setTimeout> | null = null;

  casas: CasaOpcao[] = [];
  carregandoCasas = true;
  exportando = false;
  modalFormatoAberto = false;
  relatorioSucesso = false;
  aviso: AvisoState | null = null;

  readonly filtrosEscalaForm = this.formBuilder.nonNullable.group({
    casaId: [''],
    dataInicio: ['', [Validators.required]],
    dataFim: ['', [Validators.required]],
    nomeEvento: ['']
  });

  ngOnInit(): void {
    this.carregarCasas();
  }

  ngOnDestroy(): void {
    this.limparTimerAviso();
    this.limparTimerRelatorio();
  }

  carregarCasas(): void {
    this.carregandoCasas = true;
    this.casasService.listarOpcoes().subscribe({
      next: (casas) => {
        this.casas = casas;
        this.carregandoCasas = false;
      },
      error: (error: unknown) => {
        this.carregandoCasas = false;
        this.abrirErro('Não foi possível carregar as casas', obterMensagemErroApi(error));
      }
    });
  }

  abrirFormatoEscala(): void {
    if (this.filtrosEscalaForm.invalid) {
      this.filtrosEscalaForm.markAllAsTouched();
      this.abrirErro('Informe o período', 'A data inicial e a data final são obrigatórias para emitir o relatório de escala.');
      return;
    }

    const raw = this.filtrosEscalaForm.getRawValue();
    if (raw.dataInicio > raw.dataFim) {
      this.abrirErro('Período inválido', 'A data inicial não pode ser maior que a data final.');
      return;
    }

    this.limparTimerRelatorio();
    this.relatorioSucesso = false;
    this.modalFormatoAberto = true;
  }

  fecharFormatoEscala(): void {
    if (this.exportando) return;
    this.limparTimerRelatorio();
    this.modalFormatoAberto = false;
    this.relatorioSucesso = false;
  }

  emitirEscala(formato: RelatorioFormato): void {
    const filtros = this.montarFiltrosEscala();
    this.exportando = true;

    const operacao = formato === 'excel'
      ? this.relatoriosService.exportarEscalasExcel(filtros)
      : this.relatoriosService.exportarEscalasPdf(filtros);

    operacao.subscribe({
      next: (arquivo) => {
        this.baixarArquivo(arquivo, this.nomeArquivoEscala(formato));
        this.exportando = false;
        this.relatorioSucesso = true;
        this.relatorioTimeoutId = setTimeout(() => this.fecharFormatoEscala(), 1200);
      },
      error: (error: unknown) => {
        this.exportando = false;
        this.fecharFormatoEscala();
        this.abrirErro('Não foi possível emitir o relatório', obterMensagemErroApi(error));
      }
    });
  }

  limparFiltrosEscala(): void {
    this.filtrosEscalaForm.reset({
      casaId: '',
      dataInicio: '',
      dataFim: '',
      nomeEvento: ''
    });
  }

  campoInvalido(campo: 'dataInicio' | 'dataFim'): boolean {
    const controle = this.filtrosEscalaForm.controls[campo];
    return controle.invalid && (controle.dirty || controle.touched);
  }

  fecharAviso(): void {
    this.limparTimerAviso();
    this.aviso = null;
  }

  private montarFiltrosEscala(): RelatorioEscalaFiltros {
    const raw = this.filtrosEscalaForm.getRawValue();
    return {
      casaId: raw.casaId || undefined,
      dataInicio: raw.dataInicio,
      dataFim: raw.dataFim,
      nomeEvento: raw.nomeEvento.trim() || undefined
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

  private nomeArquivoEscala(formato: RelatorioFormato): string {
    const raw = this.filtrosEscalaForm.getRawValue();
    const sufixo = `${raw.dataInicio || 'inicio'}-${raw.dataFim || 'fim'}`;
    return `relatorio-escalas-${sufixo}.${formato === 'excel' ? 'xlsx' : 'pdf'}`;
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
