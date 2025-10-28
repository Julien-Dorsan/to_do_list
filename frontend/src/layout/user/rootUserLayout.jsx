import { useState, useCallback } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../../components/ui/Sidebar/Sidebar";
import NewListModal from "../../components/ui/NewListModal/NewListModal";
import apiClient from "../../api/apiClient";
import URL from "../../api/URL";

export default function RootUserLayout({ lists, isLoading, error, onListCreated }) {
    const [showCreate, setShowCreate] = useState(false);

    const openCreate = () => setShowCreate(true);
    const closeCreate = () => setShowCreate(false);

    const handleCreateList = useCallback(async (payload) => {
        const res = await apiClient.post(URL.CREATELIST, payload);
        return res.data;
    }, []);

    const handleCreated = useCallback((created) => {
        // Immediately update lists in the parent state
        onListCreated?.(created);
    }, [onListCreated]);

    return (
        <>
            <Sidebar
                lists={lists}
                isLoading={isLoading}
                error={error}
                onAdd={openCreate}
            />
            <NewListModal
                show={showCreate}
                onClose={closeCreate}
                onCreate={handleCreateList}
                onCreated={handleCreated}
            />
            <Outlet />
        </>
    );
}
