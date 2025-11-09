import React, { useState, useCallback } from 'react';
import { createId } from '@browser-os/core';
import { openWindow } from '@browser-os/windowing';
import { DocumentWindow } from './DocumentWindow';
import './App.css';

export const WordProcessorApp: React.FC = () => {
  const [documents, setDocuments] = useState<Map<string, { id: string; fileUri: string | null }>>(new Map());

  const handleNewDocument = useCallback(() => {
    const docId = createId();
    const win = openWindow({
      appId: 'os.word-processor',
      title: 'Untitled',
      bounds: { x: 100, y: 100, w: 1000, h: 700 },
      payload: { documentId: docId },
    });
    setDocuments((prev) => {
      const next = new Map(prev);
      next.set(docId, { id: docId, fileUri: null });
      return next;
    });
  }, []);

  return (
    <div className="word-processor-app">
      <div className="word-processor-welcome">
        <h1>Word Processor</h1>
        <p>Create a new document to get started</p>
        <button onClick={handleNewDocument} className="new-document-btn">
          New Document
        </button>
      </div>
    </div>
  );
};

