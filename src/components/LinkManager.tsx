import { useState, useCallback } from 'react';

export interface LinkedContent {
  id: string;
  name: string;
  content: string;
  instances: number;
  createdAt: number;
}

interface LinkManagerProps {
  onUpdateContent?: (id: string, content: string) => void;
}

export function LinkManager({ onUpdateContent }: LinkManagerProps): React.ReactElement {
  const [links, setLinks] = useState<LinkedContent[]>([]);
  const [selectedLink, setSelectedLink] = useState<string | null>(null);
  const [newLinkName, setNewLinkName] = useState('');
  const [newLinkContent, setNewLinkContent] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);

  const createLink = useCallback(() => {
    if (!newLinkName.trim()) return;

    const newLink: LinkedContent = {
      id: `link_${Date.now()}`,
      name: newLinkName.trim(),
      content: newLinkContent,
      instances: 1,
      createdAt: Date.now(),
    };

    setLinks((prev) => [...prev, newLink]);
    setNewLinkName('');
    setNewLinkContent('');
    setShowCreateForm(false);
    setSelectedLink(newLink.id);
  }, [newLinkName, newLinkContent]);

  const updateLinkContent = useCallback(
    (id: string, content: string) => {
      setLinks((prev) =>
        prev.map((link) => (link.id === id ? { ...link, content } : link))
      );
      onUpdateContent?.(id, content);
    },
    [onUpdateContent]
  );

  const deleteLink = useCallback((id: string) => {
    setLinks((prev) => prev.filter((link) => link.id !== id));
    setSelectedLink((current) => (current === id ? null : current));
  }, []);

  const syncToWord = useCallback(async (link: LinkedContent) => {
    try {
      await window.electronAPI.word.setSelection(link.content);
    } catch (err) {
      console.error('Failed to sync to Word:', err);
    }
  }, []);

  const captureFromWord = useCallback(async () => {
    try {
      const text = await window.electronAPI.word.getSelection();
      if (text) {
        setNewLinkContent(text);
      }
    } catch (err) {
      console.error('Failed to capture from Word:', err);
    }
  }, []);

  const selectedLinkData = links.find((l) => l.id === selectedLink);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <span style={styles.headerTitle}>Linked Content</span>
        <button style={styles.addButton} onClick={() => setShowCreateForm(true)}>
          +
        </button>
      </div>

      {showCreateForm && (
        <div style={styles.form}>
          <input
            style={styles.input}
            placeholder="Link name..."
            value={newLinkName}
            onChange={(e) => setNewLinkName(e.target.value)}
          />
          <textarea
            style={styles.textarea}
            placeholder="Content to link..."
            value={newLinkContent}
            onChange={(e) => setNewLinkContent(e.target.value)}
            rows={3}
          />
          <div style={styles.formButtons}>
            <button style={styles.captureButton} onClick={captureFromWord}>
              📋 From Word
            </button>
            <button style={styles.cancelButton} onClick={() => setShowCreateForm(false)}>
              Cancel
            </button>
            <button style={styles.saveButton} onClick={createLink}>
              Create
            </button>
          </div>
        </div>
      )}

      <div style={styles.list}>
        {links.length === 0 && !showCreateForm && (
          <div style={styles.empty}>
            No linked content yet.
            <br />
            Create a link to sync text across Word.
          </div>
        )}

        {links.map((link) => (
          <div
            key={link.id}
            style={{
              ...styles.item,
              ...(selectedLink === link.id ? styles.itemSelected : {}),
            }}
            onClick={() => setSelectedLink(link.id)}
          >
            <div style={styles.itemHeader}>
              <span style={styles.linkName}>{link.name}</span>
              <span style={styles.instanceCount}>{link.instances}x</span>
            </div>
            <div style={styles.linkPreview}>
              {link.content.substring(0, 50)}
              {link.content.length > 50 ? '...' : ''}
            </div>
          </div>
        ))}
      </div>

      {selectedLinkData && (
        <div style={styles.editor}>
          <div style={styles.editorHeader}>
            <span>Edit: {selectedLinkData.name}</span>
            <button style={styles.syncButton} onClick={() => syncToWord(selectedLinkData)}>
              �推送 to Word
            </button>
          </div>
          <textarea
            style={styles.editorTextarea}
            value={selectedLinkData.content}
            onChange={(e) => updateLinkContent(selectedLinkData.id, e.target.value)}
            rows={5}
          />
          <button style={styles.deleteButton} onClick={() => deleteLink(selectedLinkData.id)}>
            Delete Link
          </button>
        </div>
      )}
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
  addButton: {
    width: '24px',
    height: '24px',
    borderRadius: '4px',
    border: 'none',
    backgroundColor: '#0e639c',
    color: '#ffffff',
    cursor: 'pointer',
    fontSize: '18px',
    lineHeight: 1,
  },
  form: {
    padding: '12px',
    backgroundColor: '#383838',
    borderBottom: '1px solid #404040',
  },
  input: {
    width: '100%',
    padding: '8px',
    marginBottom: '8px',
    backgroundColor: '#252525',
    border: '1px solid #555555',
    borderRadius: '4px',
    color: '#ffffff',
    fontSize: '13px',
    boxSizing: 'border-box',
  },
  textarea: {
    width: '100%',
    padding: '8px',
    marginBottom: '8px',
    backgroundColor: '#252525',
    border: '1px solid #555555',
    borderRadius: '4px',
    color: '#ffffff',
    fontSize: '13px',
    resize: 'vertical',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
  },
  formButtons: {
    display: 'flex',
    gap: '8px',
    justifyContent: 'flex-end',
  },
  captureButton: {
    padding: '6px 10px',
    backgroundColor: '#444444',
    border: 'none',
    borderRadius: '4px',
    color: '#ffffff',
    cursor: 'pointer',
    fontSize: '12px',
  },
  cancelButton: {
    padding: '6px 10px',
    backgroundColor: '#444444',
    border: 'none',
    borderRadius: '4px',
    color: '#ffffff',
    cursor: 'pointer',
    fontSize: '12px',
  },
  saveButton: {
    padding: '6px 10px',
    backgroundColor: '#0e639c',
    border: 'none',
    borderRadius: '4px',
    color: '#ffffff',
    cursor: 'pointer',
    fontSize: '12px',
  },
  list: {
    maxHeight: '180px',
    overflowY: 'auto',
  },
  item: {
    padding: '8px 12px',
    cursor: 'pointer',
    borderBottom: '1px solid #383838',
    transition: 'background-color 0.15s',
  },
  itemSelected: {
    backgroundColor: '#0e639c',
  },
  itemHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '4px',
  },
  linkName: {
    fontSize: '13px',
    fontWeight: 500,
    color: '#ffffff',
  },
  instanceCount: {
    fontSize: '11px',
    color: '#888888',
    backgroundColor: '#444444',
    padding: '2px 6px',
    borderRadius: '10px',
  },
  linkPreview: {
    fontSize: '12px',
    color: '#aaaaaa',
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
  editor: {
    padding: '12px',
    backgroundColor: '#333333',
    borderTop: '1px solid #404040',
  },
  editorHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
    fontSize: '13px',
    color: '#ffffff',
  },
  syncButton: {
    padding: '4px 8px',
    backgroundColor: '#0e639c',
    border: 'none',
    borderRadius: '4px',
    color: '#ffffff',
    cursor: 'pointer',
    fontSize: '11px',
  },
  editorTextarea: {
    width: '100%',
    padding: '8px',
    marginBottom: '8px',
    backgroundColor: '#252525',
    border: '1px solid #555555',
    borderRadius: '4px',
    color: '#ffffff',
    fontSize: '13px',
    resize: 'vertical',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
  },
  deleteButton: {
    width: '100%',
    padding: '8px',
    backgroundColor: '#8b2020',
    border: 'none',
    borderRadius: '4px',
    color: '#ffffff',
    cursor: 'pointer',
    fontSize: '12px',
  },
};
