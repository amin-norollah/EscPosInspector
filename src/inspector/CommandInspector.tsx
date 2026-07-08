import { useEffect, useRef } from 'react';
import type { ParsedCommand } from '@/types/escpos';
import {
  CATEGORY_COLORS,
  CATEGORY_LABELS,
  filterCommands,
  getCommandDetails,
} from './formatters';
import type { ImageCommand } from '@/types/escpos';

interface CommandInspectorProps {
  commands: ParsedCommand[];
  selectedCommandId: string | null;
  onSelectCommand: (commandId: string) => void;
  search: string;
}

export function CommandInspector({
  commands,
  selectedCommandId,
  onSelectCommand,
  search,
}: CommandInspectorProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const filtered = filterCommands(commands, search);

  useEffect(() => {
    if (!selectedCommandId || !listRef.current) return;
    const selected = listRef.current.querySelector(`[data-command-id="${selectedCommandId}"]`);
    selected?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [selectedCommandId]);

  if (commands.length === 0) {
    return (
      <div className="inspector-empty">
        <p>Load an ESC/POS stream to inspect decoded commands.</p>
      </div>
    );
  }

  return (
    <div className="inspector" ref={listRef}>
      <div className="inspector-summary">
        <span>{filtered.length} commands</span>
        {search && <span className="muted">filtered from {commands.length}</span>}
      </div>

      <div className="command-list">
        {filtered.map((command) => {
          const isSelected = selectedCommandId === command.id;
          const details = getCommandDetails(command);
          const showPreview = command.category === 'image' || command.category === 'rasterImage';

          return (
            <button
              key={command.id}
              type="button"
              data-command-id={command.id}
              className={`command-item ${isSelected ? 'selected' : ''} ${command.previewable ? 'previewable' : ''}`}
              onClick={() => onSelectCommand(command.id)}
            >
              <div className="command-item-header">
                <span
                  className="command-badge"
                  style={{ backgroundColor: CATEGORY_COLORS[command.category] }}
                >
                  {CATEGORY_LABELS[command.category]}
                </span>
                <span className="command-index">#{command.index}</span>
              </div>

              <div className="command-label">{command.label}</div>
              <div className="command-description">{command.description}</div>

              <div className="command-meta">
                <span>offset {command.span.offset}</span>
                <span>{command.span.length} bytes</span>
                {!command.previewable && <span className="muted">no preview link</span>}
              </div>

              <dl className="command-details">
                {details.map((detail) => (
                  <div key={`${command.id}-${detail.label}`} className="detail-row">
                    <dt>{detail.label}</dt>
                    <dd>{detail.value}</dd>
                  </div>
                ))}
              </dl>

              {showPreview && (
                <div className="image-preview-block">
                  <img
                    src={(command as ImageCommand).imageDataUrl}
                    alt={`${command.label} preview`}
                    className="command-image-preview"
                  />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export { CATEGORY_LABELS, CATEGORY_COLORS, filterCommands, getCommandDetails } from './formatters';
