import { HttpErrorResponse } from '@angular/common/http';

export function obterMensagemErroApi(error: unknown): string {
  if (error instanceof HttpErrorResponse) {
    const mensagemApi = extrairMensagemApi(error.error);

    if (mensagemApi) {
      return mensagemApi;
    }

    if (error.status === 0) {
      return 'Não foi possível conectar à API. Verifique se o backend está em execução.';
    }

    if (error.status === 401 || error.status === 403) {
      return 'Sessão inválida ou expirada. Faça login novamente.';
    }
  }

  return 'Ocorreu um erro inesperado. Tente novamente.';
}

function extrairMensagemApi(errorBody: unknown): string | null {
  if (!errorBody || typeof errorBody !== 'object') {
    return null;
  }

  const body = errorBody as { mensagem?: unknown; message?: unknown };

  if (typeof body.mensagem === 'string') {
    return body.mensagem;
  }

  if (typeof body.message === 'string') {
    return body.message;
  }

  return null;
}
