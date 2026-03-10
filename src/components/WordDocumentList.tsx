import { useState, useEffect, useCallback } from 'react';
import type { WordWindow } from '../types/global';

interface WordDocumentListProps {
  onSelectDocument?: (doc: WordWindow) => void;
}

export function WordDocumentList({ onSelectDocument }: WordDocumentListProps): React.ReactElement {
  const [documents, setDocuments] = useState<WordWindow[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const detectDocuments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const docs = await window.electronAPI.word.detectWindows();
      setDocuments(docs);
    } catch (err) {
      setError('Failed to detect Word documents');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    detectDocuments();
    const interval = setInterval(detectDocuments, 3000);
    return () => clearInterval(interval);
  }, [detectDocuments]);

  const handleSelect = (doc: WordWindow, index: number) => {
    setSelectedDoc(index);
    onSelectDocument?.(doc);
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <span style={styles.headerTitle}>Open Documents</span>
        <button style={styles.refreshButton} onClick={detectDocuments} disabled={loading}>
          {loading ? '...' : '↻'}
        </button>
      </div>

      {error && <div style={styles.error}>{error}</div>}

      <div style={styles.list}>
        {documents.length === 0 && !loading && (
          <div style={styles.empty}>No Word documents open</div>
        )}

        {documents.map((doc, index) => (
          <div
            key={doc.pid}
            style={{
              ...styles.item,
              ...(selectedDoc === index ? styles.itemSelected : {}),
            }}
            onClick={() => handleSelect(doc, index)}
          >
            <span style={styles.docIcon}>📄</span>
            <span style={styles.docTitle} title={doc.title}>
              {doc.title || 'Untitled'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#2d2d2d',
    borderRadius: '8px',
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 12px',
    backgroundColor: '#333333',
    borderBottom: '1px solid #404040',
  },
  headerTitle: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#ffffff',
  },
  refreshButton: {
    background: 'transparent',
    border: 'none',
    color: '#888888',
    cursor: 'pointer',
    fontSize: '16px',
    padding: '2px 6px',
    borderRadius: '4px',
  },
  error: {
    padding: '8px 12px',
    backgroundColor: '#4a2020',
    color: '#ff6b6b',
    fontSize: '12px',
  },
  list: {
    maxHeight: '200px',
    overflowY: 'auto',
  },
  item: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 12px',
    cursor: 'pointer',
    borderBottom: '1px solid #383838',
    transition: 'background-color 0.15s',
  },
  itemSelected: {
    backgroundColor: '#0e639c',
  },
  docIcon: {
    fontSize: '16px',
  },
  docTitle: {
    flex: 1,
    fontSize: '13px',
    color: '#ffffff',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  empty: {
    padding: '20px',
    textAlign: 'center',
    color: '#888888',
    fontSize: '13px',
  },
};
