// components/tasks/CategorySection.jsx
import TaskItem from "./TaskItem";

export default function CategorySection({
    name,
    tasks = [],
    onTaskUpdated,
    onEditTask,
    onDeleteTask,
}) {
    const t = {
        addInCategory: "Ajouter une tâche",
    };

    return (
        <section className="mb-4">
            <div className="d-flex align-items-center justify-content-between">
                <h2 className="h6 mb-0">{name || "Sans catégorie"}</h2>
            </div>

            <div className="mt-2 d-flex flex-column gap-2">
                {tasks.map((task) => (
                    <TaskItem
                        key={task.id ?? `${task.name ?? task.title ?? "tache"}-${task.due_at ?? task.due_date ?? "na"}`}
                        task={task}
                        onUpdated={onTaskUpdated}
                        onEdit={onEditTask}
                        onDelete={onDeleteTask}
                    />
                ))}
            </div>
        </section>
    );
}
