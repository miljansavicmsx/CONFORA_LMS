import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import fontkit from '@pdf-lib/fontkit';
import { PDFDocument, rgb, type PDFFont, type PDFPage } from 'pdf-lib';
import QRCode from 'qrcode';

let cachedFont: Buffer | null = null;

export function notoSansBytes(): Buffer {
  if (cachedFont) {
    return cachedFont;
  }
  const candidates = [
    join(process.cwd(), 'assets/fonts/NotoSans-Regular.ttf'),
    join(process.cwd(), 'apps/api/assets/fonts/NotoSans-Regular.ttf'),
  ];
  for (const path of candidates) {
    try {
      cachedFont = readFileSync(path);
      return cachedFont;
    } catch {
      /* try the next location */
    }
  }
  throw new Error('NOTO_FONT_MISSING');
}

export async function openUnicodePdf(): Promise<{ pdf: PDFDocument; font: PDFFont }> {
  const pdf = await PDFDocument.create();
  pdf.registerFontkit(fontkit);
  const font = await pdf.embedFont(notoSansBytes(), { subset: true });
  return { pdf, font };
}

export async function drawDocumentPage(
  pdf: PDFDocument,
  font: PDFFont,
  input: {
    kicker: string;
    title: string;
    statement: string;
    lines: readonly string[];
    verifyUrl: string;
  },
): Promise<void> {
  const page: PDFPage = pdf.addPage([842, 595]);
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
  page.drawText('CONFORA', { x: 64, y: 510, size: 14, font, color: rgb(0.1, 0.22, 0.35) });
  page.drawText(input.kicker, { x: 64, y: 478, size: 12, font, color: rgb(0.2, 0.28, 0.36) });
  page.drawText(input.title, { x: 64, y: 440, size: 26, font, color: rgb(0.05, 0.1, 0.16) });
  page.drawText(input.statement, { x: 64, y: 400, size: 11, font, maxWidth: 520 });
  input.lines.forEach((line, index) => {
    page.drawText(line, { x: 64, y: 340 - index * 26, size: 13, font });
  });
  page.drawImage(image, { x: 620, y: 360, width: 140, height: 140 });
  page.drawText('Provjera', { x: 648, y: 336, size: 11, font });
}
