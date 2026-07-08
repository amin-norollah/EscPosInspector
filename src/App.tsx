import { useCallback, useMemo, useState } from "react";
import { CommandInspector } from "@/inspector";
import { loadFile, loadFromBytes, loadFromText } from "@/fileLoader";
import { parseEscPos } from "@/parser";
import { ReceiptPreview } from "@/preview";
import { renderReceipt } from "@/renderer";
import { printReceipt, downloadBinary } from "@/printService";
import { createSampleEscPos } from "@/samples/sampleReceipt";
import type { InputFormat, LoadedFile } from "@/types/escpos";
import "./App.css";

type InputMode = "file" | "hex" | "base64";

export default function App() {
  const [loadedFile, setLoadedFile] = useState<LoadedFile | null>(null);
  const [inputMode, setInputMode] = useState<InputMode>("file");
  const [textInput, setTextInput] = useState("");
  const [search, setSearch] = useState("");
  const [selectedCommandId, setSelectedCommandId] = useState<string | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);

  // only re parse when the loaded file really changes. parsing is cheap here
  // but the memo keeps the same array ref so the preview does not redraw for
  // no reason (like when you only type in the search box).
  const parseResult = useMemo(() => {
    if (!loadedFile) return null;
    return parseEscPos(loadedFile.data);
  }, [loadedFile]);

  const commands = parseResult?.commands ?? [];
  const paperWidth = parseResult?.paperWidth ?? 384;

  const handleFileChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      try {
        setError(null);
        const loaded = await loadFile(file);
        setLoadedFile(loaded);
        setSelectedCommandId(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load file.");
      }
    },
    [],
  );

  const handleTextLoad = useCallback(() => {
    try {
      setError(null);
      const format: InputFormat = inputMode === "hex" ? "hex" : "base64";
      const loaded = loadFromText(textInput, format);
      setLoadedFile(loaded);
      setSelectedCommandId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to decode input.");
    }
  }, [inputMode, textInput]);

  const handleLoadSample = useCallback(() => {
    setError(null);
    setLoadedFile(loadFromBytes(createSampleEscPos(), "sample-receipt.bin"));
    setSelectedCommandId(null);
  }, []);

  const handlePrint = useCallback(async () => {
    if (!parseResult) return;
    const result = await renderReceipt(commands, paperWidth, selectedCommandId);
    printReceipt(result.imageDataUrl, loadedFile?.name ?? "Receipt");
  }, [commands, paperWidth, selectedCommandId, loadedFile, parseResult]);

  const handleDownload = useCallback(() => {
    if (!loadedFile) return;
    downloadBinary(loadedFile.data, loadedFile.name);
  }, [loadedFile]);

  return (
    <div className="app">
      <header className="app-header">
        <div>
          <p className="eyebrow">
            <a
              href="https://github.com/amin-norollah"
              target="_blank"
              rel="noreferrer"
            >
              Balrug
            </a>
          </p>
          <h1>ESC/POS Receipt Inspector</h1>
          <p className="subtitle">
            Decode ESC/POS command streams, preview thermal receipts, and debug
            raster images without a physical printer.
          </p>
        </div>
        <div className="header-actions">
          <button
            type="button"
            className="btn secondary"
            onClick={handleLoadSample}
          >
            Load sample
          </button>
          {loadedFile && (
            <>
              <button
                type="button"
                className="btn secondary"
                onClick={handleDownload}
              >
                Download binary
              </button>
              <button
                type="button"
                className="btn primary"
                onClick={handlePrint}
              >
                Print preview
              </button>
            </>
          )}
        </div>
      </header>

      <section className="loader-panel">
        <div className="loader-tabs">
          <button
            type="button"
            className={inputMode === "file" ? "active" : ""}
            onClick={() => setInputMode("file")}
          >
            File
          </button>
          <button
            type="button"
            className={inputMode === "hex" ? "active" : ""}
            onClick={() => setInputMode("hex")}
          >
            Hex
          </button>
          <button
            type="button"
            className={inputMode === "base64" ? "active" : ""}
            onClick={() => setInputMode("base64")}
          >
            Base64
          </button>
        </div>

        {inputMode === "file" ? (
          <label className="file-drop">
            <input
              type="file"
              accept=".bin,.escpos,.prn,.txt,.hex,.b64"
              onChange={handleFileChange}
            />
            <span>Drop or choose an ESC/POS binary, hex, or Base64 file</span>
          </label>
        ) : (
          <div className="text-input-block">
            <textarea
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder={
                inputMode === "hex"
                  ? "Paste hexadecimal bytes, e.g. 1B 40 48 65 6C 6C 6F"
                  : "Paste Base64-encoded ESC/POS data"
              }
              rows={5}
            />
            <button
              type="button"
              className="btn primary"
              onClick={handleTextLoad}
            >
              Decode stream
            </button>
          </div>
        )}

        {loadedFile && (
          <div className="file-meta">
            <span>{loadedFile.name}</span>
            <span>{loadedFile.size.toLocaleString()} bytes</span>
            <span>{loadedFile.format}</span>
            <span>{commands.length} commands decoded</span>
          </div>
        )}

        {error && <div className="error-banner">{error}</div>}
        {parseResult?.warnings.map((warning) => (
          <div key={warning} className="warning-banner">
            {warning}
          </div>
        ))}
      </section>

      <main className="workspace">
        <section className="panel preview-column">
          <div className="panel-header">
            <h2>Receipt Preview</h2>
            <span className="muted">Thermal receipt renderer</span>
          </div>
          <ReceiptPreview
            commands={commands}
            paperWidth={paperWidth}
            highlightCommandId={selectedCommandId}
          />
        </section>

        <section className="panel inspector-column">
          <div className="panel-header">
            <h2>ESC/POS Inspector</h2>
            <input
              type="search"
              className="search-input"
              placeholder="Search commands, text, hex…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <CommandInspector
            commands={commands}
            selectedCommandId={selectedCommandId}
            onSelectCommand={setSelectedCommandId}
            search={search}
          />
        </section>
      </main>
    </div>
  );
}
