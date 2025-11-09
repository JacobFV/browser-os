import { useState, useEffect, useCallback } from 'react';
import { vfs } from '@browser-os/fs';
import { createId } from '@browser-os/core';

export interface DocumentState {
  id: string;
  fileUri: string | null;
  content: string;
  modified: boolean;
  wordCount: number;
  charCount: number;
  selection: Selection | null;
}

const documents = new Map<string, DocumentState>();

function stripHtml(html: string): string {
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
}

function getWordCount(text: string): number {
  const plainText = stripHtml(text);
  return plainText.trim().split(/\s+/).filter((w) => w.length > 0).length;
}

function getCharCount(text: string): number {
  const plainText = stripHtml(text);
  return plainText.length;
}

export function useDocument(docId: string, initialFileUri?: string) {
  const [state, setState] = useState<DocumentState>(() => {
    const existing = documents.get(docId);
    if (existing) return existing;
    
    const newDoc: DocumentState = {
      id: docId,
      fileUri: initialFileUri || null,
      content: '',
      modified: false,
      wordCount: 0,
      charCount: 0,
      selection: null,
    };
    documents.set(docId, newDoc);
    return newDoc;
  });

  const updateState = useCallback((updates: Partial<DocumentState>) => {
    setState((prev) => {
      const next = { ...prev, ...updates };
      documents.set(docId, next);
      return next;
    });
  }, [docId]);

  const setContent = useCallback((content: string) => {
    updateState({
      content,
      modified: true,
      wordCount: getWordCount(content),
      charCount: getCharCount(content),
    });
  }, [updateState]);

  const setSelection = useCallback((selection: Selection | null) => {
    updateState({ selection });
  }, [updateState]);

  const load = useCallback(async (uri: string) => {
    try {
      const content = await vfs.read(uri, { binary: false }) as string;
      updateState({
        fileUri: uri,
        content,
        modified: false,
        wordCount: getWordCount(content),
        charCount: getCharCount(content),
      });
    } catch (error: any) {
      console.error('Failed to load document:', error);
      alert(`Failed to load document: ${error.message}`);
    }
  }, [updateState]);

  const save = useCallback(async (uri?: string) => {
    const targetUri = uri || state.fileUri;
    if (!targetUri) {
      throw new Error('No file URI specified');
    }
    try {
      await vfs.write(targetUri, state.content);
      updateState({
        fileUri: targetUri,
        modified: false,
      });
    } catch (error: any) {
      console.error('Failed to save document:', error);
      alert(`Failed to save document: ${error.message}`);
      throw error;
    }
  }, [state.fileUri, state.content, updateState]);

  const execCommand = useCallback((command: string, value?: string) => {
    // This will be called on the editor element, not global document
    // The actual execution happens in the Editor component
  }, []);

  return {
    ...state,
    setContent,
    setSelection,
    load,
    save,
    execCommand,
  };
}

