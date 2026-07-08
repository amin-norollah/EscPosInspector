import type { InputFormat, LoadedFile } from '@/types/escpos';

// people give us data in 3 shapes: raw binary, a hex string, or base64.
// we try to guess which one it is from the file name first, then from the
// content. it is only a guess so the user can still pick the tab by hand.
function detectFormat(bytes: Uint8Array, fileName: string): InputFormat {
  const lower = fileName.toLowerCase();
  if (lower.endsWith('.bin') || lower.endsWith('.escpos') || lower.endsWith('.prn')) {
    return 'binary';
  }

  const text = new TextDecoder('ascii', { fatal: false }).decode(bytes.slice(0, Math.min(bytes.length, 256)));
  const trimmed = text.trim();

  if (/^[0-9a-fA-F\s]+$/.test(trimmed) && trimmed.length >= 2) {
    return 'hex';
  }

  if (/^[A-Za-z0-9+/=\s]+$/.test(trimmed) && trimmed.length >= 4) {
    return 'base64';
  }

  return 'binary';
}

// drop everything that is not a hex digit (spaces, new lines, commas...).
// after that we need an even count, otherwise the last byte is half missing.
function parseHexString(input: string): Uint8Array {
  const cleaned = input.replace(/[^0-9a-fA-F]/g, '');
  if (cleaned.length % 2 !== 0) {
    throw new Error('Hex input has an odd number of characters.');
  }
  const bytes = new Uint8Array(cleaned.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(cleaned.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

function parseBase64String(input: string): Uint8Array {
  const cleaned = input.replace(/\s/g, '');
  let binary: string;
  try {
    binary = atob(cleaned);
  } catch {
    throw new Error('Input is not valid Base64.');
  }
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

// turns whatever the user gave us into plain bytes that the parser can eat.
export function decodeInput(bytes: Uint8Array, format: InputFormat): Uint8Array {
  if (format === 'binary') return bytes;

  const text = new TextDecoder('utf-8', { fatal: false }).decode(bytes);
  if (format === 'hex') return parseHexString(text);
  if (format === 'base64') return parseBase64String(text);
  return bytes;
}

export async function loadFile(file: File): Promise<LoadedFile> {
  const buffer = await file.arrayBuffer();
  const raw = new Uint8Array(buffer);
  const format = detectFormat(raw, file.name);
  const data = decodeInput(raw, format);

  return {
    name: file.name,
    data,
    format,
    size: data.length,
  };
}

export function loadFromText(text: string, format: InputFormat): LoadedFile {
  const encoder = new TextEncoder();
  const raw = encoder.encode(text);
  const data = decodeInput(raw, format);

  return {
    name: format === 'hex' ? 'pasted.hex' : format === 'base64' ? 'pasted.b64' : 'pasted.txt',
    data,
    format,
    size: data.length,
  };
}

export function loadFromBytes(data: Uint8Array, name = 'sample.bin'): LoadedFile {
  return {
    name,
    data,
    format: 'binary',
    size: data.length,
  };
}
