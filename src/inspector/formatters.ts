import type {
  BarcodeCommand,
  CommandCategory,
  ImageCommand,
  ParsedCommand,
  QrCodeCommand,
  TextCommand,
  UnsupportedCommand,
} from '@/types/escpos';

export const CATEGORY_LABELS: Record<CommandCategory, string> = {
  initialize: 'Initialize',
  text: 'Text',
  lineFeed: 'Line Feed',
  alignment: 'Alignment',
  font: 'Font',
  style: 'Style',
  feed: 'Feed',
  cut: 'Cut',
  image: 'Image',
  rasterImage: 'Raster',
  qrCode: 'QR Code',
  barcode: 'Barcode',
  unsupported: 'Unsupported',
  raw: 'Raw',
};

export const CATEGORY_COLORS: Record<CommandCategory, string> = {
  initialize: '#6c8cff',
  text: '#3ecf8e',
  lineFeed: '#8aa0b4',
  alignment: '#c084fc',
  font: '#f59e0b',
  style: '#f472b6',
  feed: '#8aa0b4',
  cut: '#ef4444',
  image: '#38bdf8',
  rasterImage: '#0ea5e9',
  qrCode: '#a78bfa',
  barcode: '#fb923c',
  unsupported: '#f87171',
  raw: '#94a3b8',
};

export function filterCommands(commands: ParsedCommand[], search: string): ParsedCommand[] {
  const query = search.trim().toLowerCase();
  if (!query) return commands;

  return commands.filter((command) => {
    const haystack = [
      command.label,
      command.description,
      command.category,
      command.rawHex,
      command.category === 'text' ? (command as TextCommand).text : '',
      command.category === 'barcode' ? (command as BarcodeCommand).data : '',
      command.category === 'qrCode' ? (command as QrCodeCommand).data : '',
      command.category === 'unsupported' ? (command as UnsupportedCommand).reason : '',
    ]
      .join(' ')
      .toLowerCase();

    return haystack.includes(query);
  });
}

export function getCommandDetails(command: ParsedCommand): Array<{ label: string; value: string }> {
  const details: Array<{ label: string; value: string }> = [
    { label: 'Offset', value: `0x${command.span.offset.toString(16).toUpperCase()} (${command.span.offset})` },
    { label: 'Length', value: `${command.span.length} bytes` },
    { label: 'Index', value: String(command.index) },
  ];

  if (command.category === 'text') {
    details.push({ label: 'Text', value: (command as TextCommand).text });
  }

  if (command.category === 'alignment') {
    const alignment = command as import('@/types/escpos').AlignmentCommand;
    details.push({ label: 'Alignment', value: alignment.alignment });
  }

  if (command.category === 'font') {
    const font = command as import('@/types/escpos').FontCommand;
    details.push({ label: 'Size', value: `${font.width}×${font.height}` });
    details.push({ label: 'Bold', value: String(font.bold) });
  }

  if (command.category === 'image' || command.category === 'rasterImage') {
    const image = command as ImageCommand;
    details.push({ label: 'Mode', value: image.mode });
    details.push({ label: 'Width', value: `${image.width}px` });
    details.push({ label: 'Height', value: `${image.height}px` });
    details.push({ label: 'Image size', value: `${image.imageSize} bytes` });
  }

  if (command.category === 'barcode') {
    const barcode = command as BarcodeCommand;
    details.push({ label: 'Symbology', value: barcode.symbology });
    details.push({ label: 'Data', value: barcode.data });
  }

  if (command.category === 'qrCode') {
    const qr = command as QrCodeCommand;
    if (qr.data) details.push({ label: 'Data', value: qr.data });
    if (qr.size) details.push({ label: 'Module size', value: String(qr.size) });
  }

  if (command.category === 'unsupported') {
    const unsupported = command as import('@/types/escpos').UnsupportedCommand;
    details.push({ label: 'Reason', value: unsupported.reason });
  }

  details.push({ label: 'Raw hex', value: command.rawHex });
  return details;
}
