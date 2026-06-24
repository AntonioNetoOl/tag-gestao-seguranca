import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { obterMensagemErroApi } from '../../core/api/api-error.util';
import { FuncionarioOpcao } from '../funcionarios/funcionarios.models';
import { FuncionariosService } from '../funcionarios/funcionarios.service';
import { Evento, EventoFuncionario, EventoStatus } from './eventos.models';
import { EventosService } from './eventos.service';

type AvisoTipo = 'erro' | 'sucesso';

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

  eventoId = '';
  evento: Evento | null = null;
  escala: EventoFuncionario[] = [];
  funcionarios: FuncionarioOpcao[] = [];

  carregandoEvento = true;
  carregandoEscala = true;
  carregandoFuncionarios = true;
  processando = false;
  erro = '';
  aviso: AvisoState | null = null;

  modalRemocaoAberto = false;
  funcionarioParaRemover: EventoFuncionario | null = null;
  modalSubstituicaoAberto = false;
  funcionarioParaSubstituir: EventoFuncionario | null = null;

  readonly adicionarForm = this.formBuilder.nonNullable.group({
    funcionarioId: ['', [Validators.required]]
  });

  readonly remocaoForm = this.formBuilder.nonNullable.group({
    motivoRemocao: ['', [Validators.required, Validators.maxLength(250)]]
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

    if (this.escalaBloqueada()) {
      this.abrirErro('Escala bloqueada', 'Evento cancelado não pode ter escala alterada.');
      return;
    }

    if (this.adicionarForm.invalid) {
      this.adicionarForm.markAllAsTouched();
      this.abrirErro('Selecione um funcionário', 'Escolha um funcionário ativo para adicionar à escala.');
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

  abrirRemocao(funcionario: EventoFuncionario): void {
    if (!this.podeAlterarVinculo(funcionario)) return;

    this.funcionarioParaRemover = funcionario;
    this.remocaoForm.reset({ motivoRemocao: '' });
    this.modalRemocaoAberto = true;
  }

  fecharRemocao(): void {
    if (this.processando) return;
    this.modalRemocaoAberto = false;
    this.funcionarioParaRemover = null;
    this.remocaoForm.reset({ motivoRemocao: '' });
  }

  removerFuncionario(): void {
    if (!this.funcionarioParaRemover) return;

    if (this.remocaoForm.invalid) {
      this.remocaoForm.markAllAsTouched();
      return;
    }

    this.processando = true;
    const motivoRemocao = this.remocaoForm.getRawValue().motivoRemocao.trim();

    this.eventosService.removerFuncionario(this.eventoId, this.funcionarioParaRemover.funcionarioId, { motivoRemocao }).subscribe({
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

  podeAlterarVinculo(funcionario: EventoFuncionario): boolean {
    return !this.escalaBloqueada() && !funcionario.pago;
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

  fecharAviso(): void {
    this.limparTimerAviso();
    this.aviso = null;
  }

  private recarregarDadosOperacionais(): void {
    this.carregarEvento();
    this.carregarEscala();
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
}
