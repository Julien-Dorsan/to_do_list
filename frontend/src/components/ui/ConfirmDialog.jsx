import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export default function ConfirmDialog({
    show,
    title,
    message,
    confirmText = "Confirmer",
    cancelText = "Annuler",
    onClose,
    onConfirm,
}) {
    const [pending, setPending] = useState(false);
    const [error, setError] = useState(null);
    const closeBtnRef = useRef(null);

    useEffect(() => {
        if (!show) return;
        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        document.body.classList.add("modal-open");
        // focus sur la croix
        setTimeout(() => closeBtnRef.current?.focus(), 0);

        return () => {
            document.body.style.overflow = prevOverflow;
            document.body.classList.remove("modal-open");
        };
    }, [show]);

    if (!show) return null;

    const handleBackdropClick = (e) => {
        if (pending) return;
        if (e.target === e.currentTarget) onClose?.();
    };

    const handleKeyDown = (e) => {
        if (pending) return;
        if (e.key === "Escape") onClose?.();
    };

    const handleConfirm = async () => {
        try {
            setPending(true);
            setError(null);
            await onConfirm?.();
            onClose?.();
        } catch (e) {
            setError("La suppression a échoué. Réessayez.");
        } finally {
            setPending(false);
        }
    };

    const node = (
        <>
            <div
                className="modal fade show"
                style={{ display: "block" }}
                role="dialog"
                aria-modal="true"
                onClick={handleBackdropClick}
                onKeyDown={handleKeyDown}
            >
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">{title}</h5>
                            <button
                                ref={closeBtnRef}
                                type="button"
                                className="btn-close"
                                aria-label="Fermer"
                                onClick={() => !pending && onClose?.()}
                            />
                        </div>
                        <div className="modal-body">
                            <p className="mb-0">{message}</p>
                            {error && <div className="alert alert-danger mt-2 mb-0">{error}</div>}
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={pending}>
                                {cancelText}
                            </button>
                            <button type="button" className="btn btn-danger" onClick={handleConfirm} disabled={pending}>
                                {pending ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                                        Suppression…
                                    </>
                                ) : (
                                    confirmText
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <div className="modal-backdrop fade show" />
        </>
    );

    return createPortal(node, document.body);
}
