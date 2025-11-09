import { useEffect } from 'react';

export function useKeyboardShortcuts(
  onSave: () => void,
  onOpen: () => void,
  onNew: () => void,
  onFormat: (command: string) => void
) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case 's':
            e.preventDefault();
            if (e.shiftKey) {
              // Save As - handled in menu
            } else {
              onSave();
            }
            break;
          case 'o':
            e.preventDefault();
            onOpen();
            break;
          case 'n':
            e.preventDefault();
            onNew();
            break;
          case 'b':
            e.preventDefault();
            onFormat('bold');
            break;
          case 'i':
            e.preventDefault();
            onFormat('italic');
            break;
          case 'u':
            e.preventDefault();
            onFormat('underline');
            break;
          case 'z':
            e.preventDefault();
            if (e.shiftKey) {
              document.execCommand('redo');
            } else {
              document.execCommand('undo');
            }
            break;
          case 'y':
            e.preventDefault();
            document.execCommand('redo');
            break;
          case 'x':
            e.preventDefault();
            document.execCommand('cut');
            break;
          case 'c':
            e.preventDefault();
            document.execCommand('copy');
            break;
          case 'v':
            e.preventDefault();
            document.execCommand('paste');
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onSave, onOpen, onNew, onFormat]);
}

