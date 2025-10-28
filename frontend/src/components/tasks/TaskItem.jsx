import { useState } from "react";
import apiClient from "../../api/apiClient";
import URL from "../../api/URL";
import { FiEdit2, FiTrash2, FiCalendar } from "react-icons/fi";

export default function TaskItem({ task, onUpdated, onEdit, onDelete }) {
    const [pending, setPending] = useState(false);

    const done = task.is_done ?? task.done ?? false;
    const title = task.title ?? task.name ?? "";
    const dueRaw = task.due_date ?? task.due_at ?? null;
    const due = dueRaw
        ? new Date(dueRaw).toLocaleString("fr-FR", { year: "numeric", month: "short", day: "2-digit" })
        : null;

    const toggle = async () => {
        const previous = done;
        const next = !done;

        // Optimiste instantané
        onUpdated?.({ ...task, is_done: next, done: next, __optimistic: true });

        try {
            setPending(true);

            // PATCH côté serveur (champ 'done' natif du modèle)
            const res = await apiClient.patch(URL.UPDATE_TASK(task.id), { done: next });
            const srv = res?.data ?? {};
            let srvDone =
                typeof srv.done === "boolean" ? srv.done :
                    typeof srv.is_done === "boolean" ? srv.is_done :
                        undefined;

            // Si la réponse n’est pas claire, on tente l’alias 'is_done'
            if (typeof srvDone !== "boolean") {
                const res2 = await apiClient.patch(URL.UPDATE_TASK(task.id), { is_done: next });
                const srv2 = res2?.data ?? {};
                srvDone =
                    typeof srv2.done === "boolean" ? srv2.done :
                        typeof srv2.is_done === "boolean" ? srv2.is_done :
                            undefined;
            }

            // Applique exactement ce que dit le serveur (ou rollback si inconnu)
            if (typeof srvDone === "boolean") {
                onUpdated?.({ ...task, is_done: srvDone, done: srvDone });
            } else {
                onUpdated?.({ ...task, is_done: previous, done: previous });
                // Facultatif: alert("La mise à jour n'a pas été enregistrée côté serveur.");
            }
        } catch (e) {
            onUpdated?.({ ...task, is_done: previous, done: previous });
            // eslint-disable-next-line no-console
            console.error("Mise à jour échouée", e);
        } finally {
            setPending(false);
        }
    };

    return (
        <div className={`task-item ${done ? "task-done" : ""}`}>
            <div className="d-flex align-items-start justify-content-between gap-2">
                <div className="d-flex align-items-start gap-2 flex-grow-1">
                    <div className="form-check">
                        <input
                            className="form-check-input round"
                            type="checkbox"
                            checked={done}
                            onChange={toggle}
                            disabled={pending}
                            aria-label={done ? "Marquer comme non terminée" : "Marquer comme terminée"}
                        />
                    </div>

                    <div className="flex-grow-1">
                        <div className="task-title fw-semibold text-truncate">{title}</div>
                        {task.description ? (
                            <div className="task-desc small text-muted text-truncate">{task.description}</div>
                        ) : null}

                        <div className="d-flex align-items-center task-meta small text-muted mt-1 flex-wrap">
                            {Number.isFinite(task.priority) && <span>Priorité {task.priority}</span>}
                            {due && (
                                <span className="d-inline-flex align-items-center">
                                    <FiCalendar className="me-1" /> Échéance&nbsp;{due}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="task-actions d-flex align-items-center gap-1">
                    <button
                        type="button"
                        className="btn btn-light border"
                        aria-label="Modifier"
                        onClick={() => onEdit?.(task)}
                        disabled={pending}
                    >
                        <FiEdit2 />
                    </button>
                    <button
                        type="button"
                        className="btn btn-light border"
                        aria-label="Supprimer"
                        onClick={() => onDelete?.(task)}
                        disabled={pending}
                    >
                        <FiTrash2 />
                    </button>
                </div>
            </div>
        </div>
    );
}
