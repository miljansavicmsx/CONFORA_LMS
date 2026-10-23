import type { PersonnelPublicVerification } from './personnel-rules';
import { drawDocumentPage, openUnicodePdf } from './document-pdf';

export type CertificatePdfInput = {
  holderName: string;
  scheme: string;
  schemeVersion: string;
  certificateNumber: string;
  issuedAt: string;
  expiresAt: string;
  status: string;
  verifyUrl: string;
};

export async function buildCertificatePdf(input: CertificatePdfInput): Promise<Uint8Array> {
  const { pdf, font } = await openUnicodePdf();
  await drawDocumentPage(pdf, font, {
    kicker: 'Profesionalni certifikat osoblja',
    title: 'Certifikat osoblja',
    statement: 'Ovo nije potvrda o pohađanju kursa.',
    lines: [
      `Ime: ${input.holderName}`,
      `Šema: ${input.scheme}`,
      `Verzija šeme: ${input.schemeVersion}`,
      `Broj: ${input.certificateNumber}`,
      `Izdato: ${input.issuedAt.slice(0, 10)}`,
      `Važi do: ${input.expiresAt.slice(0, 10)}`,
      `Status: ${input.status}`,
    ],
    verifyUrl: input.verifyUrl,
  });
  return pdf.save();
}

/** Public PDF follows the same disclosure rule as the public JSON view. */
export async function buildPersonnelVerificationPdf(
  view: PersonnelPublicVerification,
  verifyUrl: string,
): Promise<Uint8Array> {
  const { pdf, font } = await openUnicodePdf();
  const lines =
    view.status === 'INVALID' || !view.documentType || !view.issuedAt
      ? ['Status: INVALID']
      : [
          'Vrsta: Certifikat osoblja',
          `Datum izdavanja: ${view.issuedAt}`,
          `Status: ${view.status}`,
          ...(view.holderName ? [`Ime: ${view.holderName}`] : []),
        ];
  await drawDocumentPage(pdf, font, {
    kicker: 'Javna provjera',
    title: 'Provjera certifikata osoblja',
    statement:
      'Javna provjera autentičnosti dokumenta. Ime se prikazuje samo uz poseban pristanak nosioca.',
    lines,
    verifyUrl,
  });
  return pdf.save();
}
