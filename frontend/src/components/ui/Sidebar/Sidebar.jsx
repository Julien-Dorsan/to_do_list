import { useEffect, useState, useMemo } from "react";
import {
  FiSearch,
  FiCalendar,
  FiFilter,
  FiShare2,
  FiHelpCircle,
} from "react-icons/fi";
import { HiPlus } from "react-icons/hi";
import { FaBars } from "react-icons/fa";

// TODO Logic display

export default function Sidebar({
  lists = [
    { id: 1, name: "placeholder 1", meta: "done(12/4)" },
    { id: 2, name: "placeholder 2", meta: "done(8/14)" },
    { id: 3, name: "placeholder 3", meta: "done(10/3)" },
  ],
  avatar = { name: "ME", src: "" },
  onAdd,
  onSearch,
  onUpcoming,
  onFilter,
  onShare,
  onHelp,
  onAvatar,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(
    typeof window !== "undefined"
      ? window.matchMedia("(min-width: 768px)").matches
      : false
  );

  // breakpoint changes
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(min-width: 768px)");
    const onChange = (e) => setIsDesktop(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  // lock scroll on mobile when open
  useEffect(() => {
    if (isDesktop) return;
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen, isDesktop]);

  const WIDTH = 340;
  const RAIL = 76;
  const PANEL = useMemo(() => WIDTH - RAIL, [WIDTH, RAIL]);

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
          style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            background: "#e9ecef",
          }}
        >
          {(avatar?.name || "U").slice(0, 2).toUpperCase()}
        </div>
      )}
    </button>
  );

  return (
    <>
      {/* Mobile hamburger */}
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

      {/* Sidebar container */}
      <aside
        className="position-fixed top-0 start-0 h-100 d-flex shadow bg-body"
        style={{
          width: WIDTH,
          zIndex: 1040,
          transform: isDesktop ? "none" : isOpen ? "translateX(0)" : "translateX(-100%)",
          transition: isDesktop ? "none" : "transform 0.3s ease-in-out",
        }}
      >
        {/* Left button rail (icons only) */}
        <div
          className="d-flex flex-column gap-3 p-2 border-end"
          style={{ width: RAIL }}
        >
          <IconBtn title="Add" onClick={onAdd}>
            <HiPlus />
          </IconBtn>

          <IconBtn title="Search" onClick={onSearch}>
            <FiSearch />
          </IconBtn>

          <IconBtn title="Upcoming" onClick={onUpcoming}>
            <FiCalendar />
          </IconBtn>

          <IconBtn title="Filter" onClick={onFilter}>
            <FiFilter />
          </IconBtn>

          <IconBtn title="Share" onClick={onShare}>
            <FiShare2 />
          </IconBtn>

          {/* push the next group to the bottom */}
          <div className="flex-grow-1" />

          <IconBtn title="Help" onClick={onHelp}>
            <FiHelpCircle />
          </IconBtn>

          <AvatarBtn />
        </div>

        {/* Right panel: "My lists" preview */}
        <div className="d-flex flex-column p-3" style={{ width: PANEL }}>
          <h5 className="fw-semibold mb-3">My lists</h5>

          <div
            className="border rounded-1 p-2 bg-white"
            style={{ height: 320, overflowY: "auto" }}
          >
            <ul className="list-unstyled mb-0 small">
              {lists.map((item) => (
                <li
                  key={item.id}
                  className="d-flex justify-content-between align-items-center py-1 px-1 rounded-1 hover-bg"
                  style={{ cursor: "pointer" }}
                >
                  <a href="#" className="link-primary text-decoration-none">
                    {item.name}
                  </a>
                  <span className="text-muted">{item.meta}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </aside>
    </>
  );
}
