import { IS_PUBLIC_KEY } from './auth/public.decorator';
import { AppController } from './app.controller';

describe('AppController', () => {
  it('returns the health status', () => {
    expect(new AppController().health()).toEqual({ status: 'ok' });
  });

  it('marks health controller public via explicit @Public() metadata only', () => {
    expect(Reflect.getMetadata(IS_PUBLIC_KEY, AppController)).toBe(true);
  });
});
