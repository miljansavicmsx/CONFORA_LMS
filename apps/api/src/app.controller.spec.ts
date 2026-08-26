import { AppController } from './app.controller';

describe('AppController', () => {
  it('returns the health status', () => {
    expect(new AppController().health()).toEqual({ status: 'ok' });
  });
});
