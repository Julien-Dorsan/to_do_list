import { useEffect, useMemo, useState, useRef, useCallback } from "react";
import { FiSearch, FiCalendar, FiFilter, FiShare2, FiHelpCircle } from "react-icons/fi";
import { HiPlus } from "react-icons/hi";
import { FaBars } from "react-icons/fa";
import apiClient from "../../../api/apiClient";
import URL from "../../../api/URL";

const Sidebar = ({
    lists = [],
    isLoading = false,
    error = null,
    avatar = { name: "U", src: "" },
    onAdd,
    onSearch,
    onUpcoming,
    onFilter,
    onShare,
    onHelp,
    onAvatar,
    onSelectList,
    activeList,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isDesktop, setIsDesktop] = useState(
        typeof window !== "undefined" ? window.matchMedia("(min-width: 768px)").matches : false
    );
    const [countsCache, setCountsCache] = useState({});

    const closeBtnRef = useRef(null);

    const t = {
        openMenu: "Ouvrir le menu",
        closeMenu: "Fermer le menu",
        add: "Ajouter",
        search: "Rechercher",
        upcoming: "À venir",
        filter: "Filtrer",
        share: "Partager",
        help: "Aide",
        profile: "Profil",
        myLists: "Mes listes",
        loadingLists: "Chargement des listes…",
        loadError: "Une erreur est survenue lors du chargement des listes.",
        emptyLists: "Vous n'avez pas encore créé de liste.",
    };

    const keyOf = (l) => {
        if (!l) return null;
        return l.public_token || l.publicToken || l.token || (l.id != null ? `#${l.id}` : null);
    };

    const putCounts = useCallback((listLike, counts) => {
        const k = keyOf(listLike);
        if (!k) return;
        setCountsCache((prev) => {
            const old = prev[k];
            if (old && old.done === counts.done && old.open === counts.open) return prev;
            return { ...prev, [k]: counts };
        });
    }, []);

    const computeFromTasks = (l) => {
        let done = 0, open = 0;
        for (const t of l.tasks) {
            const isDone = (t?.is_done ?? t?.done) === true;
            if (isDone) done += 1; else open += 1;
        }
        return { done, open };
    };

    // Quand la liste active change, on met à jour son compteur dans le cache
    useEffect(() => {
        if (activeList && Array.isArray(activeList.tasks)) {
            putCounts(activeList, computeFromTasks(activeList));
        }
    }, [activeList, putCounts]);

    useEffect(() => {
        let canceled = false;

        const fetchCounts = async (l) => {
            const tok = keyOf(l);
            if (!tok) return;

            try {
                const { data } = await apiClient.get(URL.GETLIST(tok));
                if (canceled) return;
                if (Array.isArray(data?.tasks)) {
                    putCounts(l, computeFromTasks(data));
                }
            } catch {
                // silencieux si l’endpoint ne renvoie pas les tasks
            }
        };

        (async () => {
            for (const l of lists || []) {
                const k = keyOf(l);
                if (!k) continue;
                if (!countsCache[k]) {
                    fetchCounts(l);
                }
            }
        })();

        return () => { canceled = true; };
    }, [lists, countsCache, putCounts]);

    useEffect(() => {
        if (typeof window === "undefined") return;
        const mediaQuery = window.matchMedia("(min-width: 768px)");
        const onChange = (e) => setIsDesktop(e.matches);
        mediaQuery.addEventListener("change", onChange);
        return () => mediaQuery.removeEventListener("change", onChange);
    }, []);

    useEffect(() => {
        if (isDesktop) return;
        document.body.style.overflow = isOpen ? "hidden" : "";
        return () => (document.body.style.overflow = "");
    }, [isOpen, isDesktop]);

    useEffect(() => {
        const onKey = (e) => {
            if (e.key === "Escape" && !isDesktop && isOpen) setIsOpen(false);
        };
        if (!isDesktop && isOpen) {
            closeBtnRef.current?.focus();
            window.addEventListener("keydown", onKey);
        }
        return () => window.removeEventListener("keydown", onKey);
    }, [isOpen, isDesktop]);

    const RAIL = 72;

    const sortedLists = useMemo(() => {
        const norm = (p) => (Number.isFinite(p) ? p : 3);
        return [...(lists || [])].sort((a, b) => {
            const pa = norm(a?.priority);
            const pb = norm(b?.priority);
            if (pa !== pb) return pa - pb;
            return String(a?.name || "").localeCompare(String(b?.name || ""));
        });
    }, [lists]);

    const close = useCallback(() => setIsOpen(false), []);

    return (
        <>
            <button
                type="button"
                className="btn btn-dark position-fixed top-0 start-0 m-2 d-md-none z-3"
                aria-label={t.openMenu}
                aria-expanded={isOpen}
                onClick={() => setIsOpen(true)}
            >
                <FaBars />
            </button>

            {!isDesktop && (
                <div
                    className={`offcanvas-backdrop fade ${isOpen ? "show" : "d-none"}`}
                    onClick={close}
                    aria-hidden={!isOpen}
                    style={{ zIndex: 1030 }}
                />
            )}

            <aside
                className="position-fixed top-0 start-0 h-100 d-flex shadow bg-body"
                role={!isDesktop ? "dialog" : "complementary"}
                aria-modal={!isDesktop && isOpen ? "true" : undefined}
                aria-label="Barre latérale"
                style={{
                    width: isDesktop ? "clamp(280px, 28vw, 380px)" : "min(92vw, 360px)",
                    zIndex: 1040,
                    transform: isDesktop ? "none" : isOpen ? "translateX(0)" : "translateX(-100%)",
                    transition: isDesktop ? "none" : "transform 0.3s ease-in-out",
                    contain: "layout style paint",
                }}
            >
                <div className="d-flex flex-column gap-3 p-2 border-end" style={{ width: RAIL }}>
                    <button
                        type="button"
                        className="btn btn-outline-secondary w-100 rounded-4 py-2 d-flex align-items-center justify-content-center"
                        title={t.add}
                        onClick={onAdd}
                    >
                        <span className="fs-5 d-flex align-items-center"><HiPlus /></span>
                    </button>
                    <button
                        type="button"
                        className="btn btn-outline-secondary w-100 rounded-4 py-2 d-flex align-items-center justify-content-center"
                        title={t.search}
                        onClick={onSearch}
                    >
                        <span className="fs-5 d-flex align-items-center"><FiSearch /></span>
                    </button>
                    <button
                        type="button"
                        className="btn btn-outline-secondary w-100 rounded-4 py-2 d-flex align-items-center justify-content-center"
                        title={t.upcoming}
                        onClick={onUpcoming}
                    >
                        <span className="fs-5 d-flex align-items-center"><FiCalendar /></span>
                    </button>
                    <button
                        type="button"
                        className="btn btn-outline-secondary w-100 rounded-4 py-2 d-flex align-items-center justify-content-center"
                        title={t.filter}
                        onClick={onFilter}
                    >
                        <span className="fs-5 d-flex align-items-center"><FiFilter /></span>
                    </button>
                    <button
                        type="button"
                        className="btn btn-outline-secondary w-100 rounded-4 py-2 d-flex align-items-center justify-content-center"
                        title={t.share}
                        onClick={onShare}
                    >
                        <span className="fs-5 d-flex align-items-center"><FiShare2 /></span>
                    </button>
                    <div className="flex-grow-1" />
                    <button
                        type="button"
                        className="btn btn-outline-secondary w-100 rounded-4 py-2 d-flex align-items-center justify-content-center"
                        title={t.help}
                        onClick={onHelp}
                    >
                        <span className="fs-5 d-flex align-items-center"><FiHelpCircle /></span>
                    </button>
                    <button
                        type="button"
                        className="btn w-100 rounded-4 py-2 d-flex align-items-center justify-content-center border-0"
                        onClick={onAvatar}
                        title={avatar?.name || "Profil"}
                    >
                        {avatar?.src ? (
                            <img
                                src={avatar.src}
                                alt="avatar"
                                style={{ width: 36, height: 36, borderRadius: "50%", objectFit: "cover" }}
                            />
                        ) : (
                            <div
                                className="d-flex align-items-center justify-content-center fw-semibold"
                                style={{ width: 36, height: 36, borderRadius: "50%", background: "#e9ecef" }}
                            >
                                {(avatar?.name || "U").slice(0, 2).toUpperCase()}
                            </div>
                        )}
                    </button>
                </div>

                <div className="d-flex flex-column p-3" style={{ width: `calc(100% - ${RAIL}px)` }}>
                    <div className="d-flex align-items-center mb-3 position-relative">
                        <h5 className="fw-semibold mb-0 flex-grow-1">Mes listes</h5>
                        <button
                            ref={closeBtnRef}
                            type="button"
                            className="btn-close d-md-none ms-2"
                            aria-label={t.closeMenu}
                            onClick={close}
                        />
                    </div>

                    <div className="border rounded-3 bg-white flex-grow-1 overflow-auto">
                        {isLoading ? (
                            <div className="d-flex justify-content-center py-5">
                                <div className="spinner-border" role="status" aria-label={t.loadingLists} />
                            </div>
                        ) : error ? (
                            <div className="alert alert-danger m-2" role="alert">
                                {t.loadError}
                            </div>
                        ) : (lists || []).length === 0 ? (
                            <div className="text-muted small m-2">{t.emptyLists}</div>
                        ) : (
                            <div className="list-group list-group-flush">
                                {sortedLists.map((item) => {
                                    const priority =
                                        Number.isFinite(item?.priority) && item.priority >= 0 && item.priority <= 5
                                            ? item.priority
                                            : 3;

                                    const k = keyOf(item);
                                    const counts =
                                        countsCache[k] ||
                                        (Array.isArray(item?.tasks) ? computeFromTasks(item) : null);

                                    return (
                                        <button
                                            key={item.id}
                                            type="button"
                                            className="list-group-item list-group-item-action d-flex align-items-center gap-2"
                                            onClick={() => { onSelectList?.(item); !isDesktop && setIsOpen(false); }}
                                            aria-label={`Liste ${item.name} — priorité ${priority}${counts ? ` — ${counts.done} terminées, ${counts.open} à faire` : ""
                                                }`}
                                        >
                                            <span className="badge rounded-pill text-bg-secondary">{priority}</span>

                                            <div className="d-flex flex-column flex-grow-1 text-start">
                                                <span className="fw-semibold text-truncate">{item.name}</span>
                                                {item.meta && (
                                                    <small className="text-muted text-truncate">{item.meta}</small>
                                                )}
                                            </div>

                                            {counts && (
                                                <div className="d-flex align-items-center gap-1 ms-auto">
                                                    <span className="badge rounded-pill text-bg-success" title={`${counts.done} terminées`}>
                                                        {counts.done}
                                                    </span>
                                                    <span className="badge rounded-pill text-bg-danger" title={`${counts.open} à faire`}>
                                                        {counts.open}
                                                    </span>
                                                </div>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
