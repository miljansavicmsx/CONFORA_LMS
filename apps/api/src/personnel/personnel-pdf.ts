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
