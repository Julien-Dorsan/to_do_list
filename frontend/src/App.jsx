import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import { useEffect, useMemo, useState } from "react";
import {
    createBrowserRouter,
    createRoutesFromElements,
    Route,
    RouterProvider,
} from "react-router-dom";

import RootUserLayout from "./layout/user/rootUserLayout";
import apiClient from "./api/apiClient";
import URL from "./api/URL";
import ListPage from "./pages/ListPage";
import IndexWelcome from "./pages/indexWelcom";
import AutoRedirect from "./pages/AutoRedirect";

export default function App() {
    const [lists, setLists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const abortController = new AbortController();
        (async () => {
            try {
                setLoading(true);
                const res = await apiClient.get(URL.GETLISTS, { signal: abortController.signal });
                setLists(res?.data || []);
            } catch (e) {
                if (e.name !== "CanceledError" && e.name !== "AbortError") setError(e);
            } finally {
                setLoading(false);
            }
        })();
        return () => abortController.abort();
    }, []);

    const handleListCreated = (created) => {
        setLists((prev) => (Array.isArray(prev) ? [...prev, created] : [created]));
    };

    const handleListUpdated = (updated) => {
        if (!updated) return;
        const key = updated.public_token || updated.publicToken || updated.token || updated.id;
        setLists((prev) =>
            (prev || []).map((l) => {
                const lk = l.public_token || l.publicToken || l.token || l.id;
                return lk === key ? { ...l, ...updated } : l;
            })
        );
    };

    const handleListDeleted = (toRemove) => {
        if (!toRemove) return;
        const key =
            (typeof toRemove === "object" && toRemove !== null
                ? toRemove.public_token || toRemove.publicToken || toRemove.token || toRemove.id
                : toRemove);
        setLists((prev) =>
            (prev || []).filter((l) => {
                const lk = l.public_token || l.publicToken || l.token || l.id;
                return lk !== key;
            })
        );
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
                                onListUpdated={handleListUpdated}
                                onListDeleted={handleListDeleted}
                            />
                        }
                    >
                        <Route index element={<AutoRedirect />} />
                        <Route path="welcome" element={<IndexWelcome />} />
                        <Route path="l/:token" element={<ListPage />} />
                        <Route path="*" element={<IndexWelcome />} />
                    </Route>
                )
            ),
        [lists, loading, error]
    );

    return <RouterProvider router={router} />;
}
