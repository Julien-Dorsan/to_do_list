export default function Modal({ show, title, children, footer, onClose }) {
    if (!show) return null;
    return (
        <div className="modal-backdrop-lite" role="dialog" aria-modal="true" aria-label={title || "Fenêtre modale"}>
            <div className="modal-card">
                <div className="modal-header">
                    <h5 className="mb-0">{title}</h5>
                    <button type="button" className="btn-close" aria-label="Fermer" onClick={onClose} />
                </div>
                <div className="modal-body">{children}</div>
                <div className="modal-footer">{footer}</div>
            </div>
        </div>
    );
}
