function pushText(chunks: number[], text: string): void {
  for (const char of text) {
    chunks.push(char.charCodeAt(0));
  }
}

function pushBytes(chunks: number[], bytes: number[]): void {
  chunks.push(...bytes);
}

// build the logo the way the new printer contract expects it: a run of
// 24-dot ESC * (mode 33) stripes stored in COLUMN format. each column holds
// 3 bytes (24 dots) and the MSB of a byte is the topmost dot.
function buildSampleLogoStripes(): { width: number; stripes: number[][] } {
  const width = 64;
  const height = 48; // two 24-dot stripes
  const stripes: number[][] = [];

  for (let bandY = 0; bandY < height; bandY += 24) {
    const band: number[] = [];
    for (let x = 0; x < width; x++) {
      for (let byteRow = 0; byteRow < 3; byteRow++) {
        let value = 0;
        for (let bit = 0; bit < 8; bit++) {
          const y = bandY + byteRow * 8 + bit;
          const edge = x < 4 || x > width - 5 || y < 3 || y > height - 4;
          const diagonal = ((x + y) % 7) === 0;
          if (edge || diagonal) {
            value |= 1 << (7 - bit); // MSB = top dot of the column
          }
        }
        band.push(value);
      }
    }
    stripes.push(band);
  }

  return { width, stripes };
}

export function createSampleEscPos(): Uint8Array {
  const chunks: number[] = [];
  const logo = buildSampleLogoStripes();

  pushBytes(chunks, [0x1b, 0x40]);
  pushBytes(chunks, [0x1b, 0x61, 0x01]);
  pushText(chunks, 'ESC/POS RECEIPT INSPECTOR\n');
  pushBytes(chunks, [0x1b, 0x61, 0x00]);
  pushText(chunks, 'Sample thermal receipt for debugging\n');
  pushText(chunks, '--------------------------------\n');
  pushBytes(chunks, [0x1b, 0x45, 0x01]);
  pushText(chunks, 'Bold item');
  pushBytes(chunks, [0x1b, 0x45, 0x00]);
  pushText(chunks, '          $12.50\n');
  pushText(chunks, 'Coffee                    $3.00\n');
  pushText(chunks, 'Muffin                    $4.50\n');
  pushBytes(chunks, [0x1b, 0x61, 0x02]);
  pushText(chunks, 'Total: $20.00\n');
  pushBytes(chunks, [0x1b, 0x61, 0x01]);

  // logo as an ESC * mode-33 column-stripe job: tighten the line spacing to
  // 24 dots so the stripes butt together, emit each stripe, then restore it.
  pushBytes(chunks, [0x1b, 0x33, 0x18]);
  const wL = logo.width & 0xff;
  const wH = (logo.width >> 8) & 0xff;
  for (const stripe of logo.stripes) {
    pushBytes(chunks, [0x1b, 0x2a, 0x21, wL, wH]);
    pushBytes(chunks, stripe);
    pushBytes(chunks, [0x0a]);
  }
  pushBytes(chunks, [0x1b, 0x32]);

  pushBytes(chunks, [0x1b, 0x61, 0x01]);
  pushBytes(chunks, [0x1d, 0x6b, 0x49, 0x0a, 0x31, 0x32, 0x33, 0x34, 0x35, 0x36, 0x37, 0x38, 0x39, 0x30]);
  pushBytes(chunks, [0x1b, 0x64, 0x02]);
  pushBytes(chunks, [0x1d, 0x28, 0x6b, 0x04, 0x00, 0x31, 0x41, 0x32, 0x00]);
  pushBytes(chunks, [0x1d, 0x28, 0x6b, 0x03, 0x00, 0x31, 0x43, 0x05]);
  pushBytes(chunks, [0x1d, 0x28, 0x6b, 0x03, 0x00, 0x31, 0x45, 0x31]);
  const qr = 'https://github.com/example/escpos-inspector';
  pushBytes(chunks, [0x1d, 0x28, 0x6b, qr.length + 3, 0x00, 0x31, 0x50, 0x30]);
  pushText(chunks, qr);
  pushBytes(chunks, [0x1d, 0x28, 0x6b, 0x03, 0x00, 0x31, 0x51, 0x30]);

  // the job now ends with a feed instead of a cut command.
  pushBytes(chunks, [0x1b, 0x64, 0x04]);

  return new Uint8Array(chunks);
}

export const SAMPLE_HEX = Array.from(createSampleEscPos())
  .map((b) => b.toString(16).padStart(2, '0'))
  .join(' ');

export const SAMPLE_BASE64 = btoa(String.fromCharCode(...createSampleEscPos()));
