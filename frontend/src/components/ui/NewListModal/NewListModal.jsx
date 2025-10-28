import { useEffect, useState } from "react";

export default function NewListModal({
    show,
    onClose,
    onCreate,
    onCreated,
}) {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [priority, setPriority] = useState(3);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    // prevents body scroll while modal is open
    useEffect(() => {
        if (!show) return;
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = prev;
        };
    }, [show]);

    useEffect(() => {
        if (!show) {
            setName("");
            setDescription("");
            setPriority(3);
            setSubmitting(false);
            setError(null);
        }
    }, [show]);

    const nameTooLong = name.length > 30;
    const descTooLong = description.length > 200;
    const prioInvalid =
        !Number.isFinite(Number(priority)) ||
        Number(priority) < 0 ||
        Number(priority) > 5;

    const canSubmit =
        !submitting && !nameTooLong && !descTooLong && !prioInvalid && name.trim().length > 0;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!canSubmit) return;

        try {
            setSubmitting(true);
            setError(null);
            const payload = {
                name: name.trim(),
                description: description.trim(),
                priority: Number(priority),
            };
            const created = await onCreate(payload);
            // Optimistically updates the UI
            onCreated?.(created);
            onClose?.();
        } catch (err) {
            setError(err);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <>
            {/* Backdrop */}
            {show && <div className="modal-backdrop fade show" />}

            <div
                className={`modal fade ${show ? "show" : ""}`}
                style={{ display: show ? "block" : "none" }}
                role="dialog"
                aria-modal="true"
                aria-hidden={!show}
            >
                <div className="modal-dialog modal-dialog-centered modal-lg">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h1 className="modal-title fs-5">Créer une nouvelle liste de tâches</h1>
                            <button type="button" className="btn-close" onClick={onClose} aria-label="Close" />
                        </div>

                        <form onSubmit={handleSubmit} noValidate>
                            <div className="modal-body">
                                {error && (
                                    <div className="alert alert-danger" role="alert">
                                        {error?.message || "Échec de la création de la liste"}
                                    </div>
                                )}

                                {/* Name */}
                                <div className="form-floating mb-3">
                                    <input
                                        id="list-name"
                                        className={`form-control ${nameTooLong ? "is-invalid" : ""}`}
                                        type="text"
                                        placeholder="Nom de la liste"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        maxLength={31} // soft cap
                                        required
                                    />
                                    <label htmlFor="list-name">Nom</label>
                                    <div className="form-text d-flex justify-content-between">
                                        <span>Requis</span>
                                        <span>{name.length}/30</span>
                                    </div>
                                    {nameTooLong && <div className="invalid-feedback">Max 30 caractères.</div>}
                                </div>

                                {/* Description */}
                                <div className="form-floating mb-3">
                                    <textarea
                                        id="list-desc"
                                        className={`form-control ${descTooLong ? "is-invalid" : ""}`}
                                        placeholder="Description"
                                        style={{ height: 100 }}
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        maxLength={201}
                                    />
                                    <label htmlFor="list-desc">Description</label>
                                    <div className="form-text d-flex justify-content-between">
                                        <span>Optionnelle</span>
                                        <span>{description.length}/200</span>
                                    </div>
                                    {descTooLong && <div className="invalid-feedback">Max 200 caractères.</div>}
                                </div>
                                <div className="row g-3">
                                    <div className="col-12 col-sm-6">
                                        <div className="form-floating">
                                            <select
                                                id="list-priority"
                                                className={`form-select ${prioInvalid ? "is-invalid" : ""}`}
                                                value={priority}
                                                onChange={(e) => setPriority(Number(e.target.value))}
                                            >
                                                {/* TODO use names instead of numbers for priority */}
                                                {[0, 1, 2, 3, 4, 5].map((p) => (
                                                    <option key={p} value={p}>
                                                        Priorité {p} {p === 0 ? "(plus haute)" : p === 5 ? "(plus basse)" : ""}
                                                    </option>
                                                ))}
                                            </select>
                                            <label htmlFor="list-priority">Priorté</label>
                                            {prioInvalid && <div className="invalid-feedback">La priorté doit être comprise entre 0 et 5.</div>}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button type="button" className="btn btn-outline-secondary" onClick={onClose} disabled={submitting}>
                                    Annuler
                                </button>
                                <button type="submit" className="btn btn-primary" disabled={!canSubmit}>
                                    {submitting ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                                            Création de la liste…
                                        </>
                                    ) : (
                                        "Créer la liste"
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}
