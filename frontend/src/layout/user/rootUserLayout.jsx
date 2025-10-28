import { useState, useCallback } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "../../components/ui/Sidebar/Sidebar";
import NewListModal from "../../components/ui/NewListModal/NewListModal";
import apiClient from "../../api/apiClient";
import URL from "../../api/URL";

export default function RootUserLayout({
    lists,
    isLoading,
    error,
    onListCreated,
    onListUpdated = () => { },
    onListDeleted = () => { },
}) {
    const [showCreate, setShowCreate] = useState(false);
    const [activeList, setActiveList] = useState(null);
    const navigate = useNavigate();

    const openCreate = () => setShowCreate(true);
    const closeCreate = () => setShowCreate(false);

    const handleCreateList = useCallback(async (payload) => {
        const res = await apiClient.post(URL.CREATELIST, payload);
        return res.data;
    }, []);

    const handleCreated = useCallback(
        (created) => {
            onListCreated?.(created);
            const tok =
                created?.public_token || created?.publicToken || created?.token || (created?.id != null ? String(created.id) : null);
            if (tok) {
                setActiveList(created);
                navigate(`/l/${encodeURIComponent(tok)}`, { state: { list: created } });
            }
        },
        [onListCreated, navigate]
    );

    const handleSelectList = useCallback(
        async (list) => {
            const tok =
                list?.public_token ??
                list?.publicToken ??
                list?.token ??
                (list?.id != null ? String(list.id) : null);

            if (!tok) return;

            let detail = null;
            try {
                const { data } = await apiClient.get(URL.GETLIST(tok));
                detail = data;
            } catch (e) {
                if (/^\d+$/.test(tok) && URL.GETLIST_BY_ID) {
                    const { data } = await apiClient.get(URL.GETLIST_BY_ID(Number(tok)));
                    detail = data;
                }
            } finally {
                const next = detail || list;
                setActiveList(next);
                navigate(`/l/${encodeURIComponent(tok)}`, { state: { list: next } });
            }
        },
        [navigate]
    );

    const notifyListTasks = useCallback((listWithTasks) => {
        setActiveList(listWithTasks || null);
    }, []);

    return (
        <>
            <Sidebar
                lists={lists}
                isLoading={isLoading}
                error={error}
                onAdd={openCreate}
                onSelectList={handleSelectList}
                activeList={activeList}
            />

            <NewListModal
                show={showCreate}
                onClose={closeCreate}
                onCreate={handleCreateList}
                onCreated={handleCreated}
            />

            <Outlet
                context={{
                    lists,
                    isLoading,
                    notifyListTasks,
                    onListUpdated,
                    onListDeleted,
                }}
            />
        </>
    );
}
