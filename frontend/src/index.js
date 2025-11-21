import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './App.css'; 

const container = document.getElementById('root');
if (!container) throw new Error('No #root element found. Make sure public/index.html has <div id="root"></div>');

const root = createRoot(container);
root.render(<App />);
