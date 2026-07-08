export function bytesToHex(bytes: Uint8Array, maxLength = 64): string {
  const slice = bytes.length > maxLength ? bytes.subarray(0, maxLength) : bytes;
  const hex = Array.from(slice)
    .map((b) => b.toString(16).padStart(2, '0').toUpperCase())
    .join(' ');
  return bytes.length > maxLength ? `${hex} … (+${bytes.length - maxLength} bytes)` : hex;
}

export function readUint16LE(data: Uint8Array, offset: number): number {
  return data[offset]! | (data[offset + 1]! << 8);
}

export function isPrintableAscii(byte: number): boolean {
  return byte >= 0x20 && byte <= 0x7e;
}

export function isTextByte(byte: number): boolean {
  return (
  byte === 0x09 ||
  byte === 0x0a ||
  byte === 0x0d ||
  (byte >= 0x20 && byte <= 0x7e) ||
  byte >= 0xa0
  );
}

export const BARCODE_TYPES: Record<number, string> = {
  0x41: 'UPC-A',
  0x42: 'UPC-E',
  0x43: 'EAN13',
  0x44: 'EAN8',
  0x45: 'CODE39',
  0x46: 'ITF',
  0x47: 'CODABAR',
  0x48: 'CODE93',
  0x49: 'CODE128',
};

export const QR_ERROR_CORRECTION: Record<number, string> = {
  0x30: 'L (~7%)',
  0x31: 'M (~15%)',
  0x32: 'Q (~25%)',
  0x33: 'H (~30%)',
};

export const DEFAULT_PAPER_WIDTH = 384;
