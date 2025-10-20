import React, { useState, useRef, useEffect } from 'react';
import { useNotifications } from '../../contexts/NotificationContext';

interface FileSystem {
  [key: string]: string | FileSystem;
}

export const Terminal: React.FC = () => {
  const { addNotification } = useNotifications();
  const [history, setHistory] = useState<string[]>([
    'Last login: ' + new Date().toLocaleString(),
    'Welcome to macOS Terminal',
    'Type "help" for available commands',
    '',
  ]);
  const [input, setInput] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [currentPath, setCurrentPath] = useState<string[]>(['~']);
  const terminalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Simulated file system
  const fileSystem: FileSystem = {
    '~': {
      Desktop: {
        'README.txt': 'Welcome to your Desktop!',
        'project.md': '# My Project\n\nThis is a test project.',
      },
      Documents: {
        'notes.txt': 'My personal notes...',
        'todo.txt': '1. Learn Terminal\n2. Build apps\n3. Have fun!',
      },
      Downloads: {},
      Pictures: {
        'photo.jpg': '[Image file]',
      },
      Music: {},
    },
  };

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [history]);

  const getPrompt = () => {
    return currentPath.join('/') + ' %';
  };

  const getCurrentDir = (): FileSystem | string => {
    let current: FileSystem | string = fileSystem;
    for (const dir of currentPath) {
      if (typeof current === 'object' && current[dir]) {
        current = current[dir];
      }
    }
    return current;
  };

  const executeCommand = (cmd: string) => {
    const trimmedCmd = cmd.trim();
    if (!trimmedCmd) return;

    setCommandHistory(prev => [...prev, trimmedCmd]);
    setHistory(prev => [...prev, `${getPrompt()} ${trimmedCmd}`]);

    const [command, ...args] = trimmedCmd.split(' ');

    // Command execution
    switch (command.toLowerCase()) {
      case 'clear':
        setHistory([]);
        return;
      case 'help':
        setHistory(prev => [
          ...prev,
          'Available commands:',
          '',
          'File System:',
          '  ls [dir]       - List directory contents',
          '  cd <dir>       - Change directory',
          '  pwd            - Print working directory',
          '  cat <file>     - Display file contents',
          '  tree           - Show directory tree',
          '',
          'System:',
          '  clear          - Clear the terminal',
          '  date           - Show current date and time',
          '  whoami         - Display current user',
          '  uname          - System information',
          '  echo <text>    - Display text',
          '  history        - Show command history',
          '',
          'Notifications:',
          '  notify         - Send an info notification',
          '  notify-success - Send a success notification',
          '  notify-warning - Send a warning notification',
          '  notify-error   - Send an error notification',
          '  notify-action  - Send a notification with actions',
          '',
        ]);
        return;
      case 'date':
        setHistory(prev => [...prev, new Date().toString(), '']);
        return;
      case 'whoami':
        setHistory(prev => [...prev, 'user', '']);
        return;
      case 'uname':
        setHistory(prev => [...prev, 'Darwin MacOS 14.0 x86_64', '']);
        return;
      case 'pwd':
        setHistory(prev => [...prev, '/' + currentPath.join('/').replace('~', 'Users/user'), '']);
        return;
      case 'ls': {
        const current = getCurrentDir();
        if (typeof current === 'object') {
          const items = Object.keys(current);
          if (items.length === 0) {
            setHistory(prev => [...prev, '', '']);
          } else {
            const output = items.map(item => {
              const isDir = typeof current[item] === 'object';
              return isDir ? `\x1b[34m${item}/\x1b[0m` : item;
            }).join('    ');
            setHistory(prev => [...prev, output, '']);
          }
        }
        return;
      }
      case 'cd': {
        const target = args[0];
        if (!target || target === '~') {
          setCurrentPath(['~']);
          setHistory(prev => [...prev, '']);
        } else if (target === '..') {
          if (currentPath.length > 1) {
            setCurrentPath(currentPath.slice(0, -1));
            setHistory(prev => [...prev, '']);
          } else {
            setHistory(prev => [...prev, '']);
          }
        } else {
          const current = getCurrentDir();
          if (typeof current === 'object' && current[target] && typeof current[target] === 'object') {
            setCurrentPath([...currentPath, target]);
            setHistory(prev => [...prev, '']);
          } else {
            setHistory(prev => [...prev, `cd: no such file or directory: ${target}`, '']);
          }
        }
        return;
      }
      case 'cat': {
        const filename = args[0];
        if (!filename) {
          setHistory(prev => [...prev, 'cat: missing file argument', '']);
          return;
        }
        const current = getCurrentDir();
        if (typeof current === 'object' && current[filename]) {
          const content = current[filename];
          if (typeof content === 'string') {
            setHistory(prev => [...prev, content, '']);
          } else {
            setHistory(prev => [...prev, `cat: ${filename}: Is a directory`, '']);
          }
        } else {
          setHistory(prev => [...prev, `cat: ${filename}: No such file or directory`, '']);
        }
        return;
      }
      case 'tree': {
        const renderTree = (obj: FileSystem | string, prefix = ''): string[] => {
          if (typeof obj === 'string') return [];
          const lines: string[] = [];
          const entries = Object.entries(obj);
          entries.forEach(([key, value], index) => {
            const isLastEntry = index === entries.length - 1;
            const marker = isLastEntry ? '└── ' : '├── ';
            const isDir = typeof value === 'object';
            lines.push(prefix + marker + (isDir ? `\x1b[34m${key}/\x1b[0m` : key));
            if (isDir) {
              const newPrefix = prefix + (isLastEntry ? '    ' : '│   ');
              lines.push(...renderTree(value, newPrefix));
            }
          });
          return lines;
        };
        const current = getCurrentDir();
        if (typeof current === 'object') {
          const tree = renderTree(current);
          setHistory(prev => [...prev, '.', ...tree, '']);
        }
        return;
      }
      case 'echo':
        setHistory(prev => [...prev, args.join(' '), '']);
        return;
      case 'history':
        const historyOutput = commandHistory.map((cmd, i) => `  ${i + 1}  ${cmd}`);
        setHistory(prev => [...prev, ...historyOutput, '']);
        return;
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
        setHistory(prev => [...prev, `zsh: command not found: ${command}`, '']);
        return;
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
          <div 
            key={i} 
            className="terminal-line"
            dangerouslySetInnerHTML={{
              __html: line
                .replace(/\x1b\[34m/g, '<span style="color: #0a84ff;">')
                .replace(/\x1b\[0m/g, '</span>')
            }}
          />
        ))}
        <div className="terminal-input-line">
          <span className="terminal-prompt">{getPrompt()}</span>
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
