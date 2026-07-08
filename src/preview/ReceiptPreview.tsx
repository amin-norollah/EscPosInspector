import { useEffect, useState } from 'react';
import { renderReceipt } from '@/renderer';
import type { ParsedCommand } from '@/types/escpos';

interface ReceiptPreviewProps {
  commands: ParsedCommand[];
  paperWidth: number;
  highlightCommandId: string | null;
}

export function ReceiptPreview({
  commands,
  paperWidth,
  highlightCommandId,
}: ReceiptPreviewProps) {
  const [imageDataUrl, setImageDataUrl] = useState('');
  const [loading, setLoading] = useState(false);

  // re draw the receipt whenever the commands, paper width or the selected
  // command change. rendering is async, so we use a "cancelled" flag to make
  // sure an old slow render does not overwrite a newer one (race condition).
  useEffect(() => {
    let cancelled = false;

    async function draw() {
      if (commands.length === 0) {
        setImageDataUrl('');
        return;
      }

      setLoading(true);
      try {
        const result = await renderReceipt(commands, paperWidth, highlightCommandId);
        if (!cancelled) setImageDataUrl(result.imageDataUrl);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void draw();
    return () => {
      cancelled = true;
    };
  }, [commands, paperWidth, highlightCommandId]);

  if (commands.length === 0) {
    return (
      <div className="preview-empty">
        <div className="receipt-shell placeholder">
          <p>Receipt preview will appear here.</p>
          <p className="muted">Load a binary, hex, or Base64 ESC/POS stream to begin.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="preview-panel">
      <div className="preview-toolbar">
        <span>{paperWidth}px paper</span>
        {loading && <span className="muted">Rendering…</span>}
        {highlightCommandId && <span className="highlight-pill">Highlight active</span>}
      </div>

      <div className="receipt-scroll">
        <div className="receipt-shell">
          {imageDataUrl ? (
            <img
              src={imageDataUrl}
              alt="Thermal receipt preview"
              className="receipt-image"
            />
          ) : (
            <div className="preview-loading">Rendering receipt…</div>
          )}
        </div>
      </div>

      <p className="preview-hint">
        Click a command in the inspector to highlight matching receipt content when available.
      </p>
    </div>
  );
}
