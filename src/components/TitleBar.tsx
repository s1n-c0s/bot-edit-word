import { useState, useEffect, useCallback } from 'react';

interface TitleBarProps {
  title?: string;
}

export function TitleBar({ title = 'Word Bot' }: TitleBarProps): React.ReactElement {
  const [isMaximized, setIsMaximized] = useState(false);

  const checkMaximized = useCallback(async () => {
    const maximized = await window.electronAPI.window.isMaximized();
    setIsMaximized(maximized);
  }, []);

  useEffect(() => {
    checkMaximized();
  }, [checkMaximized]);

  const handleMinimize = () => {
    window.electronAPI.window.minimize();
  };

  const handleMaximize = async () => {
    await window.electronAPI.window.maximize();
    checkMaximized();
  };

  const handleClose = () => {
    window.electronAPI.window.close();
  };

  return (
    <div style={styles.container}>
      <div style={styles.dragRegion}>
        <span style={styles.title}>{title}</span>
      </div>
      <div style={styles.controls}>
        <button style={styles.button} onClick={handleMinimize} title="Minimize">
          <svg width="12" height="12" viewBox="0 0 12 12">
            <rect fill="currentColor" width="10" height="1" x="1" y="6" />
          </svg>
        </button>
        <button style={styles.button} onClick={handleMaximize} title={isMaximized ? 'Restore' : 'Maximize'}>
          {isMaximized ? (
            <svg width="12" height="12" viewBox="0 0 12 12">
              <rect fill="none" stroke="currentColor" strokeWidth="1" width="7" height="7" x="1.5" y="3.5" />
              <polyline fill="none" stroke="currentColor" strokeWidth="1" points="3.5,3.5 3.5,1.5 10.5,1.5 10.5,8.5 8.5,8.5" />
            </svg>
          ) : (
            <svg width="12" height="12" viewBox="0 0 12 12">
              <rect fill="none" stroke="currentColor" strokeWidth="1" width="9" height="9" x="1.5" y="1.5" />
            </svg>
          )}
        </button>
        <button style={{ ...styles.button, ...styles.closeButton }} onClick={handleClose} title="Close">
          <svg width="12" height="12" viewBox="0 0 12 12">
            <polygon fill="currentColor" points="11,1.5 10.5,1 6,5.5 1.5,1 1,1.5 5.5,6 1,10.5 1.5,11 6,6.5 10.5,11 11,10.5 6.5,6" />
          </svg>
        </button>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: '32px',
    backgroundColor: '#1e1e1e',
    color: '#ffffff',
    userSelect: 'none',
  },
  dragRegion: {
    flex: 1,
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    paddingLeft: '12px',
    // @ts-expect-error - WebkitAppRegion is a non-standard CSS property
    WebkitAppRegion: 'drag',
  },
  title: {
    fontSize: '13px',
    fontWeight: 500,
  },
  controls: {
    display: 'flex',
    height: '100%',
  },
  button: {
    width: '46px',
    height: '100%',
    border: 'none',
    background: 'transparent',
    color: '#ffffff',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
  },
  closeButton: {
    background: '#e81123',
  },
};
