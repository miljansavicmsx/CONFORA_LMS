const BRAND_HEX = "#071a3d";
const LIGHT_HEX = "#ffffff";

const FONT_STACK = "Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif";

export type ConforaLogoVariant = "dark" | "light";
export type ConforaLogoMode = "full" | "icon";

export type ExportLogoOptions = {
  readonly variant: ConforaLogoVariant;
  readonly mode: ConforaLogoMode;
};

export type ExportLogoPngOptions = ExportLogoOptions & {
  readonly heightPx?: number;
  readonly devicePixelRatio?: number;
};

function iconGroupFull(color: string): string {
  return `<g>
  <path fill="${color}" d="M8 6h7v20H8a2 2 0 01-2-2V8a2 2 0 012-2zm9 0h7a2 2 0 012 2v16a2 2 0 01-2 2h-7V6z"/>
  <path d="M16 6v20" stroke="${color}" stroke-width="1.5" stroke-linecap="round"/>
  <circle cx="24" cy="7.5" r="2" fill="${color}"/>
  <path d="M10 18l2.5 2.5L15 15" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</g>`;
}

function iconGroupCompact(color: string): string {
  const s = 2;
  return `<g>
  <rect x="4" y="14" width="11" height="14" rx="2" ry="2" fill="none" stroke="${color}" stroke-width="${s}" stroke-linejoin="round"/>
  <rect x="17" y="14" width="11" height="14" rx="2" ry="2" fill="none" stroke="${color}" stroke-width="${s}" stroke-linejoin="round"/>
  <circle cx="16" cy="10" r="4" fill="${color}"/>
</g>`;
}

function wordmark(color: string): string {
  return `<text x="40" y="23" fill="${color}" font-family="${FONT_STACK}" font-size="17" font-weight="700" letter-spacing="-0.03em">CONFORA</text>`;
}

export function getConforaLogoSvgString(options: ExportLogoOptions): string {
  const color = options.variant === "light" ? LIGHT_HEX : BRAND_HEX;
  if (options.mode === "icon") {
    return `<svg xmlns="http://www.w3.org/2000/svg" role="img" aria-label="CONFORA logo" viewBox="0 0 32 32">${iconGroupCompact(color)}</svg>`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" role="img" aria-label="CONFORA logo" viewBox="0 0 148 32">${iconGroupFull(color)}${wordmark(color)}</svg>`;
}

export async function exportConforaLogoPng(options: ExportLogoPngOptions): Promise<Blob | null> {
  if (typeof document === "undefined") {
    return null;
  }
  const heightPx = options.heightPx ?? (options.mode === "icon" ? 64 : 48);
  const dpr = Math.max(1, options.devicePixelRatio ?? 2);
  const svg = getConforaLogoSvgString({ variant: options.variant, mode: options.mode });
  const svgBlob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(svgBlob);

  const img = new Image();
  const loaded = new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error("Logo image load failed"));
  });
  img.src = url;
  await loaded;

  const aspect = img.width / img.height;
  const w = Math.round(heightPx * aspect * dpr);
  const h = Math.round(heightPx * dpr);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    URL.revokeObjectURL(url);
    return null;
  }
  ctx.clearRect(0, 0, w, h);
  ctx.drawImage(img, 0, 0, w, h);
  URL.revokeObjectURL(url);

  return new Promise((resolve) => {
    canvas.toBlob((b) => resolve(b), "image/png");
  });
}

export const CONFORA_LOGO_BRAND_HEX = BRAND_HEX;
export const CONFORA_LOGO_EMAIL_SAFE_DARK = getConforaLogoSvgString({ variant: "dark", mode: "full" });
