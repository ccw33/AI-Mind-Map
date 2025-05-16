import React from 'react';
import ReactDOM from 'react-dom/client';
import MindMapCanvas from './components/MindMapCanvas';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <MindMapCanvas />
  </React.StrictMode>
);
