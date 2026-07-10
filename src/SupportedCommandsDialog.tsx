import { useEffect } from "react";

// the reference list shown in the dialog. it mirrors the "Supported commands"
// table in the README, so keep the two in sync when a handler is added or
// removed from the parser.
interface CommandReference {
  category: string;
  commands: string[];
  note: string;
}

const SUPPORTED_COMMANDS: CommandReference[] = [
  { category: "Printer control", commands: ["ESC @"], note: "Initialize / reset to defaults" },
  { category: "Text", commands: [], note: "Printable ASCII and UTF-8 text runs" },
  { category: "Layout", commands: ["ESC a"], note: "Left / center / right alignment" },
  { category: "Typography", commands: ["ESC !", "GS !", "ESC E", "ESC -"], note: "Print mode, character size, bold, underline" },
  { category: "Paper feed", commands: ["LF", "CR", "ESC d", "ESC J"], note: "Line feeds plus dot / line feeds" },
  { category: "Line spacing", commands: ["ESC 3", "ESC 2"], note: "Set spacing, or restore the default" },
  { category: "Cut", commands: ["GS V"], note: "Full and partial paper cut" },
  { category: "Column image", commands: ["ESC *"], note: "Mode 33 (24-dot) column stripes, reassembled" },
  { category: "Raster image", commands: ["GS v 0", "GS ( L"], note: "Row-major raster and graphics store" },
  { category: "QR code", commands: ["GS ( k"], note: "Model, size, error correction, store, print" },
  { category: "Barcode", commands: ["GS k"], note: "CODE128 and other common symbologies" },
];

interface SupportedCommandsDialogProps {
  onClose: () => void;
}

export function SupportedCommandsDialog({ onClose }: SupportedCommandsDialogProps) {
  // close on Escape so the dialog behaves like a normal modal.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="dialog-backdrop" role="presentation" onClick={onClose}>
      <div
        className="dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="supported-commands-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="dialog-header">
          <h2 id="supported-commands-title">Supported commands</h2>
          <button
            type="button"
            className="dialog-close"
            aria-label="Close"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <p className="dialog-intro">
          Commands the inspector decodes today. Anything else is reported as an
          unsupported command with its raw hex so nothing is dropped silently.
        </p>

        <ul className="command-reference">
          {SUPPORTED_COMMANDS.map((entry) => (
            <li key={entry.category}>
              <div className="command-reference-head">
                <span className="command-reference-category">{entry.category}</span>
                <span className="command-reference-codes">
                  {entry.commands.length > 0 ? (
                    entry.commands.map((code) => <code key={code}>{code}</code>)
                  ) : (
                    <span className="muted">plain bytes</span>
                  )}
                </span>
              </div>
              <p className="command-reference-note">{entry.note}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
