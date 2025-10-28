import { useEffect, useMemo, useState } from "react";
import ConfirmDialog from "../ui/ConfirmDialog";

export default function ListModal({
    show,
    mode = "edit",
    initial = null,
    onClose,
    onSubmit,
    onDelete,
}) {
    const isEdit = mode === "edit";

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [priority, setPriority] = useState(3);
    const [pending, setPending] = useState(false);
    const [err, setErr] = useState(null);
    const [askDelete, setAskDelete] = useState(false);

    // Pré-remplissage
    useEffect(() => {
        if (!show) return;
        setErr(null);
        if (isEdit && initial) {
            setName(initial.name ?? "");
            setDescription(initial.description ?? "");
            setPriority(Number.isFinite(initial.priority) ? Number(initial.priority) : 3);
        } else {
            setName("");
            setDescription("");
            setPriority(3);
        }
    }, [show, isEdit, initial]);

    const canSubmit = useMemo(() => name.trim().length > 0 && !pending, [name, pending]);

    const handleSubmit = async (e) => {
        e?.preventDefault?.();
        if (!canSubmit) return;
        try {
            setPending(true);
            setErr(null);
            await onSubmit?.({
                name: name.trim(),
                description: description.trim(),
                priority: Number(priority) || 3,
            });
            onClose?.();
        } catch (e2) {
            setErr("Impossible d’enregistrer la liste. Réessayez.");
        } finally {
            setPending(false);
        }
    };

    return show ? (
        <>
            <div
                className="modal fade show"
                style={{ display: "block" }}
                role="dialog"
                aria-modal="true"
                onClick={(e) => e.target === e.currentTarget && !pending && onClose?.()}
                onKeyDown={(e) => e.key === "Escape" && !pending && onClose?.()}
            >
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <form onSubmit={handleSubmit}>
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    {isEdit ? "Modifier la liste" : "Créer une liste"}
                                </h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    aria-label="Fermer"
                                    onClick={() => !pending && onClose?.()}
                                />
                            </div>

                            <div className="modal-body">
                                <div className="mb-3">
                                    <label className="form-label">Nom *</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Nom de la liste"
                                        required
                                    />
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Description</label>
                                    <textarea
                                        className="form-control"
                                        rows={3}
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Courte description"
                                    />
                                </div>

                                <div className="mb-2">
                                    <label className="form-label">Priorité</label>
                                    <select
                                        className="form-select"
                                        value={priority}
                                        onChange={(e) => setPriority(Number(e.target.value))}
                                    >
                                        <option value={0}>0 (basse)</option>
                                        <option value={1}>1</option>
                                        <option value={2}>2</option>
                                        <option value={3}>3 (par défaut)</option>
                                        <option value={4}>4</option>
                                        <option value={5}>5 (haute)</option>
                                    </select>
                                </div>

                                {err && <div className="alert alert-danger mt-3 mb-0">{err}</div>}
                            </div>

                            <div className="modal-footer">
                                {isEdit && (
                                    <button
                                        type="button"
                                        className="btn btn-outline-danger me-auto"
                                        onClick={() => setAskDelete(true)}
                                        disabled={pending}
                                    >
                                        Supprimer la liste
                                    </button>
                                )}

                                <button type="button" className="btn btn-secondary" onClick={onClose} disabled={pending}>
                                    Annuler
                                </button>
                                <button type="submit" className="btn btn-primary" disabled={!canSubmit}>
                                    {pending ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                                            Enregistrement…
                                        </>
                                    ) : isEdit ? (
                                        "Enregistrer"
                                    ) : (
                                        "Créer"
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {/* Backdrop */}
            <div className="modal-backdrop fade show" />

            {/* Confirmation suppression */}
            <ConfirmDialog
                show={askDelete}
                title="Supprimer la liste"
                message="Voulez-vous vraiment supprimer cette liste ? Cette action est irréversible."
                onClose={() => setAskDelete(false)}
                onConfirm={async () => {
                    await onDelete?.();
                    setAskDelete(false);
                    onClose?.();
                }}
            />
        </>
    ) : null;
}
