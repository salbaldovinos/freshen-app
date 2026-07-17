import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { HttpError, requireUser } from '../lib/auth';

import { verifyToken } from '@clerk/backend';

vi.mock('@clerk/backend', () => ({
  verifyToken: vi.fn(),
}));

const mockedVerifyToken = vi.mocked(verifyToken);

function requestWithAuth(header?: string): Request {
  const headers = new Headers();
  if (header !== undefined) {
    headers.set('authorization', header);
  }
  return new Request('https://example.com/api/sync/upload', { method: 'POST', headers });
}

beforeEach(() => {
  vi.stubEnv('CLERK_SECRET_KEY', 'sk_test_123');
  mockedVerifyToken.mockReset();
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('requireUser', () => {
  it('throws HttpError(401) when the Authorization header is missing', async () => {
    await expect(requireUser(requestWithAuth())).rejects.toBeInstanceOf(HttpError);
    await expect(requireUser(requestWithAuth())).rejects.toMatchObject({ status: 401 });
    expect(mockedVerifyToken).not.toHaveBeenCalled();
  });

  it('throws HttpError(401) for a malformed (non-Bearer) header', async () => {
    await expect(requireUser(requestWithAuth('Token abc.def.ghi'))).rejects.toMatchObject({
      status: 401,
    });
    expect(mockedVerifyToken).not.toHaveBeenCalled();
  });

  it('throws HttpError(401) when the bearer token is empty', async () => {
    await expect(requireUser(requestWithAuth('Bearer '))).rejects.toMatchObject({ status: 401 });
    expect(mockedVerifyToken).not.toHaveBeenCalled();
  });

  it('returns the sub claim for a valid token', async () => {
    mockedVerifyToken.mockResolvedValue({ sub: 'user_abc' } as never);
    await expect(requireUser(requestWithAuth('Bearer good.jwt.token'))).resolves.toBe('user_abc');
  });

  it('throws HttpError(401) when verifyToken rejects', async () => {
    mockedVerifyToken.mockRejectedValue(new Error('expired'));
    await expect(requireUser(requestWithAuth('Bearer bad.jwt.token'))).rejects.toMatchObject({
      status: 401,
    });
  });

  it('throws HttpError(401) when the token payload has no sub', async () => {
    mockedVerifyToken.mockResolvedValue({} as never);
    await expect(requireUser(requestWithAuth('Bearer no.sub.token'))).rejects.toMatchObject({
      status: 401,
    });
  });
});
