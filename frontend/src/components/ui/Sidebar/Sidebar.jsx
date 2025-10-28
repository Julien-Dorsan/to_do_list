import { useEffect, useState, useMemo } from "react";
import { FiSearch, FiCalendar, FiFilter, FiShare2, FiHelpCircle } from "react-icons/fi";
import { HiPlus } from "react-icons/hi";
import { FaBars } from "react-icons/fa";

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
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isDesktop, setIsDesktop] = useState(
        typeof window !== "undefined" ? window.matchMedia("(min-width: 768px)").matches : false
    );

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

    const WIDTH = 340;
    const RAIL = 76;
    const PANEL = useMemo(() => WIDTH - RAIL, [WIDTH, RAIL]);

    // filters lists list by priority
    const sortedLists = useMemo(() => {
        const clampPriority = (p) =>
            Number.isFinite(p) ? p : 3; // no clamping, just default if invalid
        return [...lists].sort((a, b) => {
            const pa = clampPriority(a?.priority);
            const pb = clampPriority(b?.priority);
            if (pa !== pb) return pa - pb;
            return String(a?.name || "").localeCompare(String(b?.name || ""));
        });
    }, [lists]);

    const IconBtn = ({ title, onClick, children }) => (
        <button
            type="button"
            className="btn btn-outline-secondary w-100 rounded-4 py-2 d-flex align-items-center justify-content-center"
            title={title}
            onClick={onClick}
        >
            <span className="fs-5 d-flex align-items-center">{children}</span>
        </button>
    );

    const AvatarBtn = () => (
        <button
            type="button"
            className="btn w-100 rounded-4 py-2 d-flex align-items-center justify-content-center border-0"
            onClick={onAvatar}
            title={avatar?.name || "Profile"}
        >
            {avatar?.src ? (
                <img
                    src={avatar.src}
                    alt={avatar?.name || "avatar"}
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
    );

    return (
        <>
            {/* Mobile trigger */}
            <button
                type="button"
                className="btn btn-dark position-fixed top-0 start-0 m-2 d-md-none z-3"
                aria-label="Open menu"
                aria-expanded={isOpen}
                onClick={() => setIsOpen(true)}
            >
                <FaBars />
            </button>

            {/* Mobile overlay */}
            {!isDesktop && (
                <div
                    className={`offcanvas-backdrop fade ${isOpen ? "show" : "d-none"}`}
                    onClick={() => setIsOpen(false)}
                    aria-hidden={!isOpen}
                    style={{ zIndex: 1030 }}
                />
            )}

            {/* Sidebar */}
            <aside
                className="position-fixed top-0 start-0 h-100 d-flex shadow bg-body"
                style={{
                    width: WIDTH,
                    zIndex: 1040,
                    transform: isDesktop ? "none" : isOpen ? "translateX(0)" : "translateX(-100%)",
                    transition: isDesktop ? "none" : "transform 0.3s ease-in-out",
                }}
            >
                {/* Left icon rail */}
                <div className="d-flex flex-column gap-3 p-2 border-end" style={{ width: RAIL }}>
                    <IconBtn title="Add" onClick={onAdd}><HiPlus /></IconBtn>
                    <IconBtn title="Search" onClick={onSearch}><FiSearch /></IconBtn>
                    <IconBtn title="Upcoming" onClick={onUpcoming}><FiCalendar /></IconBtn>
                    <IconBtn title="Filter" onClick={onFilter}><FiFilter /></IconBtn>
                    <IconBtn title="Share" onClick={onShare}><FiShare2 /></IconBtn>
                    <div className="flex-grow-1" />
                    <IconBtn title="Help" onClick={onHelp}><FiHelpCircle /></IconBtn>
                    <AvatarBtn />
                </div>

                {/* Right panel */}
                <div className="d-flex flex-column p-3" style={{ width: PANEL }}>
                    <h5 className="fw-semibold mb-3">Mes listes</h5>

                    <div className="border rounded-3 bg-white" style={{ height: 320, overflowY: "auto" }}>
                        {isLoading ? (
                            <div className="d-flex justify-content-center py-5">
                                <div className="spinner-border" role="status" aria-label="Loading lists" />
                            </div>
                        ) : error ? (
                            <div className="alert alert-danger m-2" role="alert">
                                {error.message || "Failed to load lists"}
                            </div>
                        ) : sortedLists.length === 0 ? (
                            <div className="text-muted small m-2">
                                Vous n'avez pas encore créé de liste.
                            </div>
                        ) : (
                            // ---- NEW: Bootstrap List Group (nice & responsive)
                            <div className="list-group list-group-flush">
                                {sortedLists.map((item) => {
                                    const priority =
                                        Number.isFinite(item?.priority) && item.priority >= 0 && item.priority <= 5
                                            ? item.priority
                                            : 3;

                                    return (
                                        <button
                                            key={item.id}
                                            type="button"
                                            className="list-group-item list-group-item-action d-flex align-items-center gap-2"
                                            onClick={() => onSelectList?.(item)}
                                            aria-label={`List ${item.name} with priority ${priority}`}
                                        >
                                            {/* Priority pill (neutral Bootstrap style) */}
                                            <span className="badge rounded-pill text-bg-secondary">
                                                {priority}
                                            </span>

                                            {/* Text block */}
                                            <div className="d-flex flex-column flex-grow-1 text-start">
                                                <span className="fw-semibold text-truncate">{item.name}</span>
                                                {item.meta && (
                                                    <small className="text-muted text-truncate">{item.meta}</small>
                                                )}
                                            </div>

                                            {/* Optional right-side badge (e.g., item.count) */}
                                            {Number.isFinite(item?.count) && (
                                                <span className="badge text-bg-light border">{item.count}</span>
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
