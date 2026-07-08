// the title comes from a user-supplied file name, so escape it before dropping
// it into the print window markup, otherwise a name like "a<b>.bin" breaks the
// document (or worse, injects markup).
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function printReceipt(imageDataUrl: string, title = 'ESC/POS Receipt'): void {
  const printWindow = window.open('', '_blank', 'noopener,noreferrer,width=480,height=720');
  if (!printWindow) {
    throw new Error('Pop-up blocked. Allow pop-ups to print the receipt preview.');
  }

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${escapeHtml(title)}</title>
        <style>
          body { margin: 0; display: flex; justify-content: center; background: #eee; }
          img { max-width: 100%; height: auto; }
        </style>
      </head>
      <body>
        <img src="${imageDataUrl}" alt="Receipt preview" onload="window.print();" />
      </body>
    </html>
  `);
  printWindow.document.close();
}

export function downloadBinary(data: Uint8Array, fileName: string): void {
  const copy = Uint8Array.from(data);
  const blob = new Blob([copy], { type: 'application/octet-stream' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
}
