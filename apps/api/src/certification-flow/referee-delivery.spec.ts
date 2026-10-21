import { FlowRuleError } from './certification-flow-rules';
import { openDelivery, sealDelivery } from './referee-delivery';

describe('referee delivery', () => {
  const previousEnv = process.env['NODE_ENV'];
  const previousKey = process.env['REFEREE_DELIVERY_KEY'];

  afterEach(() => {
    if (previousEnv === undefined) {
      delete process.env['NODE_ENV'];
    } else {
      process.env['NODE_ENV'] = previousEnv;
    }
    if (previousKey === undefined) {
      delete process.env['REFEREE_DELIVERY_KEY'];
    } else {
      process.env['REFEREE_DELIVERY_KEY'] = previousKey;
    }
  });

  it('seals a link so the stored payload does not contain the secret', () => {
    process.env['NODE_ENV'] = 'test';
    delete process.env['REFEREE_DELIVERY_KEY'];
    const token = 'referee-secret-token-value';
    const sealed = sealDelivery(`https://app.example/referee/${token}`);
    expect(sealed.startsWith('enc:v1:')).toBe(true);
    expect(sealed).not.toContain(token);
    expect(openDelivery(sealed)).toContain(token);
  });

  it('refuses to seal when the delivery key is unset outside development and test', () => {
    process.env['NODE_ENV'] = 'production';
    delete process.env['REFEREE_DELIVERY_KEY'];
    expect(() => {
      sealDelivery('https://app.example/referee/secret');
    }).toThrow(FlowRuleError);
    try {
      sealDelivery('https://app.example/referee/secret');
    } catch (error) {
      expect(error).toBeInstanceOf(FlowRuleError);
      expect((error as FlowRuleError).code).toBe('DELIVERY_KEY_UNCONFIGURED');
    }
  });
});
