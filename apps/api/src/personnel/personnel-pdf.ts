import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import QRCode from 'qrcode';

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

function fold(value: string): string {
  return value
    .replaceAll('č', 'c')
    .replaceAll('ć', 'c')
    .replaceAll('đ', 'd')
    .replaceAll('š', 's')
    .replaceAll('ž', 'z')
    .replaceAll('Č', 'C')
    .replaceAll('Ć', 'C')
    .replaceAll('Đ', 'D')
    .replaceAll('Š', 'S')
    .replaceAll('Ž', 'Z');
}

export async function buildCertificatePdf(input: CertificatePdfInput): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([842, 595]);
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const text = (value: string): string => fold(value);
  const qr = await QRCode.toBuffer(input.verifyUrl, { type: 'png', margin: 1, width: 180 });
  const image = await pdf.embedPng(qr);
  page.drawRectangle({
    x: 28,
    y: 28,
    width: 786,
    height: 539,
    borderColor: rgb(0.1, 0.22, 0.35),
    borderWidth: 2,
  });
  page.drawText(text('CONFORA'), { x: 64, y: 500, size: 14, font, color: rgb(0.1, 0.22, 0.35) });
  page.drawText(text('Certifikat osoblja'), {
    x: 64,
    y: 450,
    size: 32,
    font,
    color: rgb(0.05, 0.1, 0.16),
  });
  page.drawText(text('Ovo nije potvrda o pohađanju kursa.'), { x: 64, y: 418, size: 12, font });
  const lines = [
    `Ime: ${input.holderName}`,
    `Šema: ${input.scheme}`,
    `Verzija šeme: ${input.schemeVersion}`,
    `Broj: ${input.certificateNumber}`,
    `Izdato: ${input.issuedAt.slice(0, 10)}`,
    `Važi do: ${input.expiresAt.slice(0, 10)}`,
    `Status: ${input.status}`,
  ];
  lines.forEach((line, index) => {
    page.drawText(text(line), { x: 64, y: 360 - index * 28, size: 14, font });
  });
  page.drawImage(image, { x: 620, y: 360, width: 140, height: 140 });
  page.drawText(text('Provjera'), { x: 648, y: 336, size: 11, font });
  return pdf.save();
}
