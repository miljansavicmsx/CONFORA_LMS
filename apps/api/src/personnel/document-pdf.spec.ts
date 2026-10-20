import { notoSansBytes, openUnicodePdf } from './document-pdf';
import { buildCertificatePdf } from './personnel-pdf';

describe('unicode certificate pdf', () => {
  it('embeds Noto Sans so Bosnian diacritics are not folded', async () => {
    const bytes = await buildCertificatePdf({
      holderName: 'Šefćo Čamdžić',
      scheme: 'Digitalna kompetencija',
      schemeVersion: '1',
      certificateNumber: 'CON-2026-0001',
      issuedAt: '2026-10-21T00:00:00.000Z',
      expiresAt: '2029-10-21T00:00:00.000Z',
      status: 'VALID',
      verifyUrl: 'http://127.0.0.1:3001/verify/CON-2026-0001',
    });
    const pdf = Buffer.from(bytes).toString('latin1');
    expect(notoSansBytes().subarray(0, 4).toString('hex')).toBe('00010000');
    expect(pdf.startsWith('%PDF')).toBe(true);
    expect(bytes.length).toBeGreaterThan(10_000);
    expect(pdf).not.toContain('Sefco Camdzic');
    const { font } = await openUnicodePdf();
    expect(font.name).toContain('Noto');
  });
});
