import { useEffect, useMemo, useState } from "react";
import Modal from "../ui/Modal/Modal";

const FR = {
    title_new: "Nouvelle tâche",
    title_edit: "Modifier la tâche",
    name: "Nom de la tâche",
    description: "Description",
    chips: { priority: "priorité", due: "échéance", reminder: "rappel" },
    cancel: "Annuler",
    confirm: "Confirmer",
    priority: "Priorité",
    dueDate: "Date d'échéance",
    reminderAt: "Rappel (date et heure)",
    category: "Catégorie",
    none: "Sans catégorie",
};

export default function TaskModal({
    show,
    mode = "create",
    initial = null,
    categories = [],
    defaultCategoryId = null,
    onSubmit,
    onClose,
}) {
    const [title, setTitle] = useState(initial?.title ?? "");
    const [description, setDescription] = useState(initial?.description ?? "");
    const [priority, setPriority] = useState(
        Number.isFinite(initial?.priority) ? initial.priority : 3
    );
    const [dueDate, setDueDate] = useState(initial?.due_date ?? "");
    const [reminderAt, setReminderAt] = useState(initial?.reminder_at ?? "");
    const [categoryId, setCategoryId] = useState(
        initial?.category?.id ?? initial?.category ?? defaultCategoryId ?? ""
    );
    const [pending, setPending] = useState(false);

    useEffect(() => {
        if (!show) return;
        setTitle(initial?.title ?? "");
        setDescription(initial?.description ?? "");
        setPriority(Number.isFinite(initial?.priority) ? initial.priority : 3);
        setDueDate(initial?.due_date ?? "");
        setReminderAt(initial?.reminder_at ?? "");
        setCategoryId(initial?.category?.id ?? initial?.category ?? defaultCategoryId ?? "");
        setPending(false);
    }, [show, initial, defaultCategoryId]);

    const canSubmit = title.trim().length > 0 && !pending;

    const onConfirm = async () => {
        if (!canSubmit) return;
        try {
            setPending(true);
            await onSubmit?.({
                title: title.trim(),
                description: description.trim(),
                priority: Number(priority) || 3,
                due_date: dueDate || null,
                reminder_at: reminderAt || null,
                category: categoryId || null,
            });
            onClose?.();
        } finally {
            setPending(false);
        }
    };

    const footer = (
        <>
            <button type="button" className="btn btn-outline-secondary" onClick={onClose} disabled={pending}>
                {FR.cancel}
            </button>
            <button type="button" className="btn btn-primary" onClick={onConfirm} disabled={!canSubmit}>
                {FR.confirm}
            </button>
        </>
    );

    const titleText = mode === "edit" ? FR.title_edit : FR.title_new;

    const categoryOptions = useMemo(() => {
        const uniques = new Map();
        for (const c of categories) if (c?.id || c?.name) uniques.set(c.id ?? c.name, c);
        return Array.from(uniques.values());
    }, [categories]);

    return (
        <Modal show={show} title={titleText} footer={footer} onClose={onClose}>
            <div className="mb-3">
                <label className="form-label">{FR.name}</label>
                <input
                    className="form-control"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Saisir le nom…"
                    maxLength={255}
                />
            </div>

            <div className="mb-3">
                <label className="form-label">{FR.description}</label>
                <textarea
                    className="form-control"
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Décrivez la tâche…"
                    maxLength={5000}
                />
            </div>

            <div className="row g-3">
                <div className="col-12 col-sm-4">
                    <label className="form-label">{FR.priority}</label>
                    <select className="form-select" value={priority} onChange={(e) => setPriority(Number(e.target.value))}>
                        {[0, 1, 2, 3, 4, 5].map((p) => <option key={p} value={p}>{p}</option>)}
                    </select>
                </div>

                <div className="col-12 col-sm-4">
                    <label className="form-label">{FR.dueDate}</label>
                    <input className="form-control" type="date" value={dueDate || ""} onChange={(e) => setDueDate(e.target.value)} />
                </div>

                <div className="col-12 col-sm-4">
                    <label className="form-label">{FR.reminderAt}</label>
                    <input className="form-control" type="datetime-local" value={reminderAt || ""} onChange={(e) => setReminderAt(e.target.value)} />
                </div>

                <div className="col-12">
                    <label className="form-label">{FR.category}</label>
                    <select className="form-select" value={categoryId || ""} onChange={(e) => setCategoryId(e.target.value)}>
                        <option value="">{FR.none}</option>
                        {categoryOptions.map((c) => (
                            <option key={c.id ?? c.name} value={c.id ?? ""}>{c.name ?? String(c)}</option>
                        ))}
                    </select>
                </div>
            </div>
        </Modal>
    );
}
