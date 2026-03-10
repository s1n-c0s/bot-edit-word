import { useState } from 'react';
import { TitleBar, WordDocumentList, LinkManager } from './components';
import type { WordWindow } from './types/global';

function App(): React.ReactElement {
  const [activeTab, setActiveTab] = useState<'documents' | 'links'>('documents');
  const [selectedDocument, setSelectedDocument] = useState<WordWindow | null>(null);

  const handleUpdateContent = async (_id: string, content: string): Promise<void> => {
    if (selectedDocument) {
      await window.electronAPI.word.setSelection(content);
    }
  };

  return (
    <div style={styles.container}>
      <TitleBar title="Word Bot" />

      <div style={styles.tabs}>
        <button
          style={{
            ...styles.tab,
            ...(activeTab === 'documents' ? styles.tabActive : {}),
          }}
          onClick={() => setActiveTab('documents')}
        >
          📄 Documents
        </button>
        <button
          style={{
            ...styles.tab,
            ...(activeTab === 'links' ? styles.tabActive : {}),
          }}
          onClick={() => setActiveTab('links')}
        >
          🔗 Linked Content
        </button>
      </div>

      <div style={styles.content}>
        {activeTab === 'documents' && (
          <WordDocumentList
            onSelectDocument={(doc) => setSelectedDocument(doc)}
          />
        )}

        {activeTab === 'links' && (
          <LinkManager onUpdateContent={handleUpdateContent} />
        )}
      </div>

      {selectedDocument && (
        <div style={styles.status}>
          Selected: {selectedDocument.title}
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    backgroundColor: '#1e1e1e',
    color: '#ffffff',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  tabs: {
    display: 'flex',
    backgroundColor: '#252526',
    borderBottom: '1px solid #3c3c3c',
  },
  tab: {
    flex: 1,
    padding: '12px',
    backgroundColor: 'transparent',
    border: 'none',
    color: '#969696',
    cursor: 'pointer',
    fontSize: '13px',
    transition: 'all 0.15s',
  },
  tabActive: {
    color: '#ffffff',
    backgroundColor: '#1e1e1e',
    borderBottom: '2px solid #0e639c',
  },
  content: {
    flex: 1,
    padding: '12px',
    overflowY: 'auto',
  },
  status: {
    padding: '8px 12px',
    backgroundColor: '#0e639c',
    fontSize: '12px',
    textAlign: 'center',
  },
};

export default App;
