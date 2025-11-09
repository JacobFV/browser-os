import React from 'react';
import ReactDOM from 'react-dom/client';
import { WebShell } from './App';
import { initWebShell } from './init';
import './index.css';

async function main() {
  // Initialize desktop shell state before rendering
  const state = await initWebShell();

  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <WebShell state={state} />
    </React.StrictMode>
  );
}

main().catch(console.error);

