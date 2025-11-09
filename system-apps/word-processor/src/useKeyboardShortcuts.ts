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
              document.execCommand('redo', false);
            } else {
              document.execCommand('undo', false);
            }
            break;
          case 'y':
            e.preventDefault();
            document.execCommand('redo', false);
            break;
          case 'x':
            e.preventDefault();
            document.execCommand('cut', false);
            break;
          case 'c':
            e.preventDefault();
            document.execCommand('copy', false);
            break;
          case 'v':
            e.preventDefault();
            document.execCommand('paste', false);
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

