import { afterEach, describe, expect, it, vi } from 'vitest';

import { api, ApiError, apiPost } from './api';

function response(data, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: new Headers({ 'content-type': 'application/json' }),
    json: vi.fn().mockResolvedValue(data),
  };
}

describe('cliente HTTP da API', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('envia JSON e autenticação Bearer e decodifica a resposta', async () => {
    const fetchMock = vi.fn().mockResolvedValue(response([{ id: '1' }]));
    vi.stubGlobal('fetch', fetchMock);

    await expect(apiPost('/challenges/', { titulo: 'Novo desafio' }, 'token-teste'))
      .resolves.toEqual([{ id: '1' }]);

    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe('/api/challenges/');
    expect(options.method).toBe('POST');
    expect(options.headers.get('Content-Type')).toBe('application/json');
    expect(options.headers.get('Authorization')).toBe('Bearer token-teste');
    expect(options.body).toBe(JSON.stringify({ titulo: 'Novo desafio' }));
  });

  it('converte erros HTTP em ApiError com detalhes do backend', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response({ detail: 'Acesso negado.' }, 403)));

    await expect(api('/private/')).rejects.toMatchObject({
      name: 'ApiError',
      statusCode: 403,
      details: { detail: 'Acesso negado.' },
      message: 'Acesso negado.',
    });
  });

  it('notifica observadores quando a sessão autenticada expira', async () => {
    const windowEvents = new EventTarget();
    const observer = vi.fn();
    windowEvents.addEventListener('talenthub:unauthorized', observer);
    vi.stubGlobal('window', windowEvents);
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response({ detail: 'Token inválido.' }, 401)));

    await expect(api('/auth/me/', { token: 'expirado' })).rejects.toBeInstanceOf(ApiError);

    expect(observer).toHaveBeenCalledOnce();
  });

  it('expõe uma mensagem clara quando o backend não está acessível', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('connection refused')));

    await expect(api('/challenges/')).rejects.toMatchObject({
      name: 'ApiError',
      statusCode: 0,
      message: 'Não foi possível conectar ao servidor. Verifique se o backend Django está rodando.',
    });
  });
});
