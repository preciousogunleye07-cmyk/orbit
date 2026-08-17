import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initSoundSystem } from './utils/soundEffects';

initSoundSystem();

const container = document.getElementById('root')!;

const globalWindow = window as any;
if (!globalWindow.__app_root__) {
  globalWindow.__app_root__ = createRoot(container);
}

globalWindow.__app_root__.render(
  <StrictMode>
    <App />
  </StrictMode>
);


