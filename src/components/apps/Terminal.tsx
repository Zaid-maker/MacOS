import React, { useState, useRef, useEffect } from 'react';
import { useNotifications } from '../../contexts/NotificationContext';

export const Terminal: React.FC = () => {
  const { addNotification } = useNotifications();
  const [history, setHistory] = useState<string[]>([
    'Last login: ' + new Date().toLocaleString(),
    'Welcome to macOS Terminal',
    '',
  ]);
  const [input, setInput] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const terminalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [history]);

  const executeCommand = (cmd: string) => {
    const trimmedCmd = cmd.trim();
    if (!trimmedCmd) return;

    setCommandHistory(prev => [...prev, trimmedCmd]);
    setHistory(prev => [...prev, `~ % ${trimmedCmd}`]);

    // Simple command execution
    switch (trimmedCmd.toLowerCase()) {
      case 'clear':
        setHistory([]);
        break;
      case 'help':
        setHistory(prev => [
          ...prev,
          'Available commands:',
          '  help     - Show this help message',
          '  clear    - Clear the terminal',
          '  date     - Show current date and time',
          '  whoami   - Display current user',
          '  ls       - List directory contents',
          '  pwd      - Print working directory',
          '',
          'Notification commands:',
          '  notify         - Send an info notification',
          '  notify-success - Send a success notification',
          '  notify-warning - Send a warning notification',
          '  notify-error   - Send an error notification',
          '  notify-action  - Send a notification with actions',
          '',
        ]);
        break;
      case 'date':
        setHistory(prev => [...prev, new Date().toString(), '']);
        break;
      case 'whoami':
        setHistory(prev => [...prev, 'user', '']);
        break;
      case 'ls':
        setHistory(prev => [...prev, 'Desktop    Documents    Downloads    Pictures    Music', '']);
        break;
      case 'pwd':
        setHistory(prev => [...prev, '/Users/user', '']);
        break;
      case 'notify':
        addNotification(
          'Terminal Notification',
          'This is a test notification from the Terminal app!',
          'info',
          { appIcon: '⌨️', duration: 5000 }
        );
        setHistory(prev => [...prev, 'Notification sent!', '']);
        break;
      case 'notify-success':
        addNotification(
          'Success!',
          'Operation completed successfully.',
          'success',
          { duration: 5000 }
        );
        setHistory(prev => [...prev, 'Success notification sent!', '']);
        break;
      case 'notify-warning':
        addNotification(
          'Warning',
          'This action may have consequences.',
          'warning',
          { duration: 5000 }
        );
        setHistory(prev => [...prev, 'Warning notification sent!', '']);
        break;
      case 'notify-error':
        addNotification(
          'Error',
          'Something went wrong!',
          'error',
          { duration: 5000 }
        );
        setHistory(prev => [...prev, 'Error notification sent!', '']);
        break;
      case 'notify-action':
        addNotification(
          'New Message',
          'You have received a new message',
          'info',
          {
            appIcon: '💬',
            duration: 10000,
            actions: [
              {
                label: 'Reply',
                onClick: () => {
                  addNotification('Reply Sent', 'Your reply has been sent!', 'success');
                },
              },
              {
                label: 'Dismiss',
                onClick: () => {},
              },
            ],
          }
        );
        setHistory(prev => [...prev, 'Action notification sent!', '']);
        break;
      default:
        setHistory(prev => [...prev, `command not found: ${trimmedCmd}`, '']);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      executeCommand(input);
      setInput('');
      setHistoryIndex(-1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex = historyIndex + 1;
        if (newIndex < commandHistory.length) {
          setHistoryIndex(newIndex);
          setInput(commandHistory[commandHistory.length - 1 - newIndex]);
        }
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setInput(commandHistory[commandHistory.length - 1 - newIndex]);
      } else {
        setHistoryIndex(-1);
        setInput('');
      }
    }
  };

  return (
    <div className="terminal" onClick={() => inputRef.current?.focus()}>
      <div className="terminal-content" ref={terminalRef}>
        {history.map((line, i) => (
          <div key={i} className="terminal-line">
            {line}
          </div>
        ))}
        <div className="terminal-input-line">
          <span className="terminal-prompt">~ %</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="terminal-input"
            autoFocus
          />
        </div>
      </div>
    </div>
  );
};
