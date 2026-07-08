function pushText(chunks: number[], text: string): void {
  for (const char of text) {
    chunks.push(char.charCodeAt(0));
  }
}

function pushBytes(chunks: number[], bytes: number[]): void {
  chunks.push(...bytes);
}

function buildSampleRasterLogo(): { width: number; height: number; bytes: number[] } {
  const width = 64;
  const height = 24;
  const rowBytes = width / 8;
  const bytes: number[] = [];

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < rowBytes; x++) {
      let value = 0;
      for (let bit = 0; bit < 8; bit++) {
        const px = x * 8 + bit;
        const edge = px < 4 || px > width - 5 || y < 3 || y > height - 4;
        const stripe = ((px + y) % 7) === 0;
        if (edge || stripe) {
          value |= 1 << (7 - bit);
        }
      }
      bytes.push(value);
    }
  }

  return { width, height, bytes };
}

export function createSampleEscPos(): Uint8Array {
  const chunks: number[] = [];
  const logo = buildSampleRasterLogo();

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
  pushBytes(chunks, [0x1b, 0x4a, 0x18]);

  pushBytes(chunks, [0x1d, 0x76, 0x30, 0x00]);
  pushBytes(chunks, [logo.width / 8, 0]);
  pushBytes(chunks, [logo.height & 0xff, (logo.height >> 8) & 0xff]);
  pushBytes(chunks, logo.bytes);

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
  pushBytes(chunks, [0x1b, 0x64, 0x04]);
  pushBytes(chunks, [0x1d, 0x56, 0x00]);

  return new Uint8Array(chunks);
}

export const SAMPLE_HEX = Array.from(createSampleEscPos())
  .map((b) => b.toString(16).padStart(2, '0'))
  .join(' ');

export const SAMPLE_BASE64 = btoa(String.fromCharCode(...createSampleEscPos()));
