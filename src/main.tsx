import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App'; // App => Register sayfasýný render ediyor
import Navbar from './components/navbar';

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <div className="min-h-screen flex flex-col bg-slate-50">
            
            <main className="flex-1">
                <App />
            </main>
        </div>
    </StrictMode>
);
