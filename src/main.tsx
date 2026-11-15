import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { PreferencesProvider } from './context/PreferencesContext';
import 'leaflet/dist/leaflet.css';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <PreferencesProvider>
    <App />
  </PreferencesProvider>
);
