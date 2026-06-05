import { renderToString } from 'react-dom/server';
import { Provider } from 'react-redux';
import { StaticRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { configureStore } from '@reduxjs/toolkit';
import userReducer from './store/userSlice';
import enrollmentsReducer from './store/enrollmentsSlice';
import progressReducer from './store/progressSlice';
import coursesReducer from './store/coursesSlice';
import App from './App.jsx';

export const render = (url, preloadedState = {}) => {
    // Fresh store per render
    const store = configureStore({
        reducer: {
            user: userReducer,
            enrollments: enrollmentsReducer,
            progress: progressReducer,
            courses: coursesReducer,
        },
        preloadedState,
    });

    const helmetContext = {};

    const html = renderToString(
        <HelmetProvider context={helmetContext}>
            <Provider store={store}>
                <StaticRouter location={url}>
                    <App />
                </StaticRouter>
            </Provider>
        </HelmetProvider>
    );

    const { helmet } = helmetContext;
    return { html, helmet, state: store.getState() };
}