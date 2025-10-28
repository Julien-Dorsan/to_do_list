import 'bootstrap/dist/css/bootstrap.min.css';
import { useEffect, useMemo, useState } from 'react';
import {
    createBrowserRouter,
    createRoutesFromElements,
    Route,
    RouterProvider,
} from 'react-router-dom';

import RootUserLayout from './layout/user/rootUserLayout';
import apiClient from './api/apiClient';
import URL from './api/URL';

export default function App() {
    const [lists, setLists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // initial load
    useEffect(() => {
        const abortController = new AbortController();
        (async () => {
            try {
                setLoading(true);
                const res = await apiClient.get(URL.GETLISTS, { signal: abortController.signal });
                const data = res?.data ?? (await res.json());
                setLists(data || []);
            } catch (e) {
                if (e.name !== 'CanceledError' && e.name !== 'AbortError') setError(e);
            } finally {
                setLoading(false);
            }
        })();
        return () => abortController.abort();
    }, []);

    // Add created lists
    const handleListCreated = (created) => {
        setLists((prev) => (Array.isArray(prev) ? [...prev, created] : [created]));
    };

    const router = useMemo(
        () =>
            createBrowserRouter(
                createRoutesFromElements(
                    <Route
                        path="/"
                        element={
                            <RootUserLayout
                                lists={lists}
                                isLoading={loading}
                                error={error}
                                onListCreated={handleListCreated}
                            />
                        }
                    />
                )
            ),
        [lists, loading, error]
    );

    return <RouterProvider router={router} />;
}
