import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { obterMensagemErroApi } from '../../core/api/api-error.util';
import { PagedResponse } from '../../core/models/paged-response.model';
import { Usuario, UsuarioPerfil, UsuarioRequest, UsuarioStatusFiltro } from './usuarios.models';
import { UsuariosService } from './usuarios.service';

type ModoFormulario = 'criar' | 'editar';
type CampoFormulario = 'nome' | 'email' | 'perfil' | 'senha';
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
  selector: 'app-usuarios-page',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './usuarios.component.html',
  styleUrl: './usuarios.component.css'
})
export class UsuariosPageComponent implements OnInit, OnDestroy {
  private readonly usuariosService = inject(UsuariosService);
  private readonly formBuilder = inject(FormBuilder);
  private avisoTimeoutId: ReturnType<typeof setTimeout> | null = null;

  carregando = true;
  salvando = false;
  erro = '';
  modalAberto = false;
  modoFormulario: ModoFormulario = 'criar';
  usuarioSelecionado: Usuario | null = null;
  aviso: AvisoState | null = null;

  page = 1;
  pageSize = 5;
  busca = '';
  perfil: UsuarioPerfil | '' = '';
  status: UsuarioStatusFiltro = 'todos';

  readonly pageSizeOptions = [5, 10, 15, 20];
  readonly perfis: UsuarioPerfil[] = ['Master', 'Administrador', 'Operador'];

  resultado: PagedResponse<Usuario> = { items: [], page: 1, pageSize: 5, totalItems: 0, totalPages: 0 };

  readonly form = this.formBuilder.nonNullable.group({
    nome: ['', [Validators.required, Validators.maxLength(150)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(150)]],
    perfil: ['Operador' as UsuarioPerfil, [Validators.required]],
    senha: ['', [Validators.minLength(8), Validators.maxLength(100)]]
  });

  ngOnInit(): void {
    this.carregarUsuarios();
  }

  ngOnDestroy(): void {
    this.limparTimerAviso();
  }

  carregarUsuarios(): void {
    this.carregando = true;
    this.erro = '';

    this.usuariosService.listar({
      busca: this.busca.trim() || undefined,
      perfil: this.perfil || undefined,
      ativo: this.converterStatus(),
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

  pesquisar(): void { this.page = 1; this.carregarUsuarios(); }
  limparFiltros(): void { this.busca = ''; this.perfil = ''; this.status = 'todos'; this.page = 1; this.carregarUsuarios(); }
  alterarBusca(event: Event): void { this.busca = (event.target as HTMLInputElement).value; }
  alterarPerfil(event: Event): void { this.perfil = (event.target as HTMLSelectElement).value as UsuarioPerfil | ''; this.pesquisar(); }
  alterarStatus(event: Event): void { this.status = (event.target as HTMLSelectElement).value as UsuarioStatusFiltro; this.pesquisar(); }
  alterarPageSize(event: Event): void { this.pageSize = this.normalizarPageSize(Number((event.target as HTMLSelectElement).value)); this.page = 1; this.carregarUsuarios(); }
  paginaAnterior(): void { if (this.page <= 1) return; this.page--; this.carregarUsuarios(); }
  proximaPagina(): void { if (this.page >= this.resultado.totalPages) return; this.page++; this.carregarUsuarios(); }

  abrirNovo(): void {
    this.modoFormulario = 'criar';
    this.usuarioSelecionado = null;
    this.erro = '';
    this.form.reset({ nome: '', email: '', perfil: 'Operador', senha: '' });
    this.modalAberto = true;
  }

  abrirEdicao(usuario: Usuario): void {
    this.modoFormulario = 'editar';
    this.usuarioSelecionado = usuario;
    this.erro = '';
    this.form.setValue({ nome: usuario.nome, email: usuario.email, perfil: usuario.perfil, senha: '' });
    this.modalAberto = true;
  }

  fecharModal(): void {
    if (this.salvando) return;
    this.modalAberto = false;
    this.usuarioSelecionado = null;
    this.form.reset();
  }

  salvar(): void {
    this.erro = '';

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.abrirErro('Revise o cadastro', 'Existem campos obrigatórios ou inválidos no formulário.', 'Confira nome, e-mail, perfil e senha antes de salvar.');
      return;
    }

    const senha = this.form.getRawValue().senha.trim();
    if (this.modoFormulario === 'criar' && !senha) {
      this.form.controls.senha.markAsTouched();
      this.abrirErro('Informe a senha', 'A senha é obrigatória para criar um usuário.');
      return;
    }

    const request = this.montarRequest();
    const mensagemSucesso = this.modoFormulario === 'criar' ? 'Usuário cadastrado com sucesso.' : 'Usuário atualizado com sucesso.';
    this.salvando = true;

    const operacao = this.modoFormulario === 'criar'
      ? this.usuariosService.criar(request)
      : this.usuariosService.atualizar(this.usuarioSelecionado?.id ?? '', request);

    operacao.subscribe({
      next: () => {
        this.salvando = false;
        this.modalAberto = false;
        this.abrirSucesso('Registro salvo', mensagemSucesso);
        this.carregarUsuarios();
      },
      error: (error: unknown) => {
        const mensagem = obterMensagemErroApi(error);
        this.salvando = false;
        this.erro = mensagem;
        this.abrirErro('Não foi possível salvar', mensagem);
      }
    });
  }

  excluir(usuario: Usuario): void {
    this.abrirConfirmacao({
      tipo: 'pergunta',
      titulo: 'Confirmar exclusão',
      mensagem: `Excluir o usuário ${usuario.nome}?`,
      detalhe: 'O usuário será removido do acesso, mas permanecerá preservado para histórico e auditoria.',
      textoPrincipal: 'Excluir',
      textoSecundario: 'Cancelar',
      aoConfirmar: () => this.executarExclusao(usuario)
    });
  }

  restaurar(usuario: Usuario): void {
    this.abrirConfirmacao({
      tipo: 'pergunta',
      titulo: 'Confirmar restauração',
      mensagem: `Restaurar o usuário ${usuario.nome}?`,
      detalhe: 'Após a restauração, ele poderá acessar o sistema novamente.',
      textoPrincipal: 'Restaurar',
      textoSecundario: 'Cancelar',
      aoConfirmar: () => this.executarRestauracao(usuario)
    });
  }

  confirmarAviso(): void { const acao = this.aviso?.aoConfirmar; this.fecharAviso(); acao?.(); }
  fecharAviso(): void { this.limparTimerAviso(); this.aviso = null; }

  campoInvalido(campo: CampoFormulario): boolean {
    const controle = this.form.controls[campo];
    return controle.invalid && (controle.dirty || controle.touched);
  }

  senhaObrigatoriaInvalida(): boolean {
    return this.modoFormulario === 'criar' && this.form.controls.senha.touched && !this.form.controls.senha.value.trim();
  }

  formatarData(valor: string): string {
    if (!valor) return '-';
    const data = new Date(valor);
    if (Number.isNaN(data.getTime())) return valor;
    return new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC' }).format(data);
  }

  private executarExclusao(usuario: Usuario): void {
    this.erro = '';
    this.usuariosService.excluir(usuario.id).subscribe({
      next: () => { this.abrirSucesso('Registro excluído', 'Usuário excluído com sucesso.'); this.carregarUsuarios(); },
      error: (error: unknown) => { const mensagem = obterMensagemErroApi(error); this.erro = mensagem; this.abrirErro('Não foi possível excluir', mensagem); }
    });
  }

  private executarRestauracao(usuario: Usuario): void {
    this.erro = '';
    this.usuariosService.restaurar(usuario.id).subscribe({
      next: () => { this.abrirSucesso('Registro restaurado', 'Usuário restaurado com sucesso.'); this.carregarUsuarios(); },
      error: (error: unknown) => { const mensagem = obterMensagemErroApi(error); this.erro = mensagem; this.abrirErro('Não foi possível restaurar', mensagem); }
    });
  }

  private montarRequest(): UsuarioRequest {
    const raw = this.form.getRawValue();
    const senha = raw.senha.trim();
    return {
      nome: raw.nome.trim(),
      email: raw.email.trim(),
      perfil: raw.perfil,
      senha: senha ? senha : null
    };
  }

  private converterStatus(): boolean | undefined {
    if (this.status === 'ativos') return true;
    if (this.status === 'excluidos') return false;
    return undefined;
  }

  private abrirConfirmacao(aviso: AvisoState): void { this.limparTimerAviso(); this.aviso = aviso; }
  private abrirErro(titulo: string, mensagem: string, detalhe?: string): void { this.limparTimerAviso(); this.aviso = { tipo: 'erro', titulo, mensagem, detalhe, textoPrincipal: 'Entendi' }; }
  private abrirSucesso(titulo: string, mensagem = 'Registro gravado com sucesso.'): void { this.limparTimerAviso(); this.aviso = { tipo: 'sucesso', titulo, mensagem, textoPrincipal: '' }; this.avisoTimeoutId = setTimeout(() => this.fecharAviso(), 2500); }
  private limparTimerAviso(): void { if (this.avisoTimeoutId) { clearTimeout(this.avisoTimeoutId); this.avisoTimeoutId = null; } }
  private normalizarPageSize(valor: number): number { return this.pageSizeOptions.includes(valor) ? valor : 5; }
}
