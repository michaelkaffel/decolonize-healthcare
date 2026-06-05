import { StrictMode } from 'react';
import { hydrateRoot, createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { store } from './store';
import './index.css'
import App from './App.jsx';

const rootEl = document.getElementById('root');

const app = (
    <StrictMode>
        <HelmetProvider>
            <Provider store={store}>
                <BrowserRouter>
                    <App />
                </BrowserRouter>
            </Provider>
        </HelmetProvider>
    </StrictMode>
);

// Hydrate if prerendered HTML exists, otherwise fresh render (course player, dashboard)
rootEl.hasChildNodes() ? hydrateRoot(rootEl, app) : createRoot(rootEl).render(app);