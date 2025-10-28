import { useEffect, useMemo, useState } from "react";
import { useParams, useOutletContext, useLocation, useNavigate } from "react-router-dom";
import apiClient from "../api/apiClient";
import URL from "../api/URL";
import CategorySection from "../components/tasks/CategorySelection";
import TaskModal from "../components/tasks/TaskModal";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import ListModal from "../components/lists/ListModal";

const FR = {
  selectHint: "Sélectionnez une liste à gauche pour afficher ses tâches.",
  loading: "Chargement des tâches…",
  loadError: "Impossible de charger les tâches de cette liste.",
  empty: "Aucune tâche pour le moment.",
  headerAdd: "Ajouter une tâche",
  headerManage: "Gérer la liste",
  deleteTitle: "Supprimer la tâche",
  deleteMsg: "Voulez-vous vraiment supprimer cette tâche ? Cette action est irréversible.",
};

function toISOZ(value) {
  if (!value) return null;
  if (/Z$/.test(value)) return value;
  if (value.length > 10) return new Date(value).toISOString();
  return new Date(`${value}T00:00:00Z`).toISOString();
}

function extractTasks(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.results)) return payload.results;
  if (Array.isArray(payload?.tasks)) return payload.tasks;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
}

function categoryNamesOf(task, catDict) {
  const cats = task?.categories;
  if (Array.isArray(cats) && cats.length) {
    const names = cats
      .map((c) => {
        if (typeof c === "object" && c) {
          if (typeof c.name === "string") return c.name;
          if (c.id != null) return catDict.get(c.id) ?? `Catégorie #${c.id}`;
          return null;
        }
        if (typeof c === "number") return catDict.get(c) ?? `Catégorie #${c}`;
        if (typeof c === "string") return catDict.get(Number(c)) ?? c;
        return null;
      })
      .filter(Boolean);
    return [...new Set(names)];
  }
  const single =
    task?.category?.name ??
    task?.category_name ??
    (task?.category ? String(task.category) : null);
  return single ? [single] : [];
}

function groupByCategories(tasks, listInfo) {
  const dict = new Map();
  if (Array.isArray(listInfo?.categories)) {
    for (const c of listInfo.categories) {
      const name = c.name ?? (c.id != null ? `Catégorie #${c.id}` : "Sans catégorie");
      if (c.id != null) dict.set(c.id, name);
      if (typeof c.name === "string") dict.set(c.name, name);
    }
  }

  const groups = new Map();
  for (const task of tasks) {
    let names = categoryNamesOf(task, dict);
    if (!names.length) names = ["Sans catégorie"];
    for (const name of names) {
      if (!groups.has(name)) groups.set(name, []);
      groups.get(name).push(task);
    }
  }

  return Array.from(groups.entries()).sort(([aName, aTasks], [bName, bTasks]) => {
    const aOpen = aTasks.some((t) => !(t.is_done ?? t.done));
    const bOpen = bTasks.some((t) => !(t.is_done ?? t.done));
    if (aOpen !== bOpen) return aOpen ? -1 : 1;
    return aName.localeCompare(bName, "fr");
  });
}

export default function ListPage() {
  const navigate = useNavigate();
  const { token } = useParams();

  const { lists, notifyListTasks, onListUpdated, onListDeleted } =
    useOutletContext() || { lists: [], notifyListTasks: () => {}, onListUpdated: () => {}, onListDeleted: () => {} };

  const location = useLocation();

  const listFromNav = location.state?.list || null;
  const listFromContext = useMemo(
    () =>
      listFromNav ||
      (lists || []).find(
        (l) => l?.public_token === token || l?.publicToken === token || l?.token === token
      ),
    [listFromNav, lists, token]
  );

  const [listInfo, setListInfo] = useState(listFromContext || null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  // Modales TÂCHES
  const [showEditor, setShowEditor] = useState(false);
  const [editorMode, setEditorMode] = useState("create");
  const [editorInitial, setEditorInitial] = useState(null);
  const [toDelete, setToDelete] = useState(null);

  // Modale LISTE
  const [showListModal, setShowListModal] = useState(false);

  useEffect(() => {
    if (!token) return;
    let canceled = false;

    (async () => {
      try {
        setLoading(true);
        setErr(null);

        if (listFromNav && Array.isArray(listFromNav.tasks)) {
          if (!canceled) {
            setListInfo(listFromNav);
            setTasks(listFromNav.tasks || []);
            notifyListTasks({ ...listFromNav });
            setLoading(false);
          }
          return;
        }

        setListInfo(null);
        setTasks([]);

        let list = listFromContext;
        if (!list || !Array.isArray(list.tasks)) {
          try {
            const { data } = await apiClient.get(URL.GETLIST(token));
            list = data;
          } catch (e) {
            if (/^\d+$/.test(token) && URL.GETLIST_BY_ID) {
              const { data } = await apiClient.get(URL.GETLIST_BY_ID(Number(token)));
              list = data;
            } else {
              throw e;
            }
          }
        }

        if (canceled) return;

        setListInfo(list);
        if (Array.isArray(list?.tasks)) {
          setTasks(list.tasks);
          notifyListTasks({ ...list });
          setLoading(false);
          return;
        }

        const listId = list?.id;
        if (!listId) throw new Error("Identifiant de liste introuvable.");

        try {
          const { data: tasksById } = await apiClient.get(URL.GET_TASKS_BY_LIST_ID(listId));
          if (!canceled) {
            const tx = extractTasks(tasksById);
            setTasks(tx);
            const merged = { ...list, tasks: tx };
            setListInfo(merged);
            notifyListTasks(merged);
            setLoading(false);
            return;
          }
        } catch {}

        try {
          const { data: byPath } = await apiClient.get(URL.GET_TASKS_BY_LIST_PATH(token));
          if (!canceled) {
            const tx = extractTasks(byPath);
            setTasks(tx);
            const merged = { ...list, tasks: tx };
            setListInfo(merged);
            notifyListTasks(merged);
            setLoading(false);
            return;
          }
        } catch {}

        try {
          const { data: byTok } = await apiClient.get(URL.GET_TASKS_BY_LIST_TOKEN(token));
          if (!canceled) {
            const tx = extractTasks(byTok);
            setTasks(tx);
            const merged = { ...list, tasks: tx };
            setListInfo(merged);
            notifyListTasks(merged);
            setLoading(false);
            return;
          }
        } catch {}

        if (!canceled) {
          setTasks([]);
          setListInfo(list);
          notifyListTasks(list);
          setLoading(false);
        }
      } catch (e) {
        if (!canceled) {
          setErr(e);
          setLoading(false);
        }
      }
    })();

    return () => {
      canceled = true;
    };
  }, [token, listFromNav, listFromContext, notifyListTasks]);

  const categories = useMemo(() => {
    const map = new Map();
    if (Array.isArray(listInfo?.categories)) {
      for (const c of listInfo.categories) map.set(c.id ?? c.name, { id: c.id ?? null, name: c.name });
    }
    for (const t of tasks) {
      if (Array.isArray(t?.categories)) {
        for (const c of t.categories) {
          const name =
            (typeof c === "object" && c?.name) ? c.name :
            (typeof c === "number" ? `Catégorie #${c}` :
            (typeof c === "string" ? c : null));
          if (name && !Array.from(map.values()).some((v) => v.name === name)) {
            map.set(name, { id: typeof c === "object" ? (c.id ?? null) : null, name });
          }
        }
      } else {
        const name = t?.category?.name ?? t?.category_name ?? (t?.category ? String(t.category) : null);
        if (name && !Array.from(map.values()).some((v) => v.name === name)) {
          map.set(name, { id: t?.category?.id ?? null, name });
        }
      }
    }
    return Array.from(map.values());
  }, [listInfo, tasks]);

  const grouped = useMemo(() => groupByCategories(tasks, listInfo), [tasks, listInfo]);

  // ----------- UPDATE LISTE / DELETE LISTE -----------
  const updateList = async (form) => {
    let data = null;
    try {
      const res = await apiClient.patch(URL.GETLIST(token), {
        name: form.name,
        description: form.description,
        priority: Number(form.priority) || 3,
      });
      data = res.data;
    } catch (e) {
      if (/^\d+$/.test(token) && URL.GETLIST_BY_ID) {
        const res = await apiClient.patch(URL.GETLIST_BY_ID(Number(token)), {
          name: form.name,
          description: form.description,
          priority: Number(form.priority) || 3,
        });
        data = res.data;
      } else {
        throw e;
      }
    }

    const merged = {
      ...(listInfo || {}),
      ...data,
      tasks: Array.isArray(data?.tasks) ? data.tasks : (listInfo?.tasks || []),
    };
    setListInfo(merged);
    notifyListTasks(merged);
    onListUpdated?.(merged);
    return merged;
  };

  const deleteList = async () => {
    // on identifie la liste à retirer (id ou token)
    const keyObj = listInfo || { token };

    try {
      await apiClient.delete(URL.GETLIST(token));
    } catch (e) {
      if (/^\d+$/.test(token) && URL.GETLIST_BY_ID) {
        await apiClient.delete(URL.GETLIST_BY_ID(Number(token)));
      } else {
        throw e;
      }
    }

    // Nettoyage local + mise à jour globale + redirection
    notifyListTasks(null);
    onListDeleted?.(keyObj);
    setListInfo(null);
    setTasks([]);
    navigate("/welcome");
  };

  const handleToggleUpdated = (updated) => {
    const nextDone = updated.is_done ?? updated.done;
    const nextTasks = tasks.map((t) =>
      t.id === updated.id ? { ...t, is_done: nextDone, done: nextDone } : t
    );
    setTasks(nextTasks);
    const merged = listInfo ? { ...listInfo, tasks: nextTasks } : listInfo;
    setListInfo(merged);
    notifyListTasks(merged);
  };

  const openCreate = () => {
    setEditorInitial(null);
    setEditorMode("create");
    setShowEditor(true);
  };
  const openEdit = (task) => {
    setEditorInitial(task);
    setEditorMode("edit");
    setShowEditor(true);
  };

  const createTask = async (form) => {
    const listId = listInfo?.id;
    if (!listId) throw new Error("Identifiant de liste introuvable.");

    const payload = {
      name: form.title,
      description: form.description ?? "",
      priority: Number(form.priority) || 3,
      due_at: toISOZ(form.due_date),
      list: listId,
      public_token: token,
    };

    const { data } = await apiClient.post(URL.CREATE_TASK, payload);
    const next = [data, ...tasks];
    setTasks(next);
    const merged = listInfo ? { ...listInfo, tasks: next } : listInfo;
    setListInfo(merged);
    notifyListTasks(merged);
  };

  const updateTask = async (task, form) => {
    const patch = {
      name: form.title,
      description: form.description,
      priority: Number(form.priority) || 3,
      due_at: toISOZ(form.due_date),
    };
    const old = tasks;
    const oldList = listInfo;
    const next = tasks.map((t) => (t.id === task.id ? { ...t, ...patch } : t));
    setTasks(next);
    setListInfo((prev) => (prev ? { ...prev, tasks: next } : prev));
    notifyListTasks({ ...(listInfo || {}), tasks: next });

    try {
      await apiClient.patch(URL.UPDATE_TASK(task.id), patch);
    } catch (e) {
      setTasks(old);
      setListInfo(oldList);
      notifyListTasks(oldList);
      throw e;
    }
  };

  const deleteTask = async (task) => {
    const old = tasks;
    const oldList = listInfo;
    const next = tasks.filter((t) => t.id !== task.id);
    setTasks(next);
    setListInfo((prev) => (prev ? { ...prev, tasks: next } : prev));
    notifyListTasks({ ...(listInfo || {}), tasks: next });

    try {
      await apiClient.delete(URL.DELETE_TASK(task.id));
    } catch (e) {
      setTasks(old);
      setListInfo(oldList);
      notifyListTasks(oldList);
      throw e;
    }
  };

  const onAddToCategory = () => openCreate();
  const onEditTask = (task) => openEdit(task);
  const onDeleteTask = (task) => setToDelete(task);

  return (
    <main className="app-main">
      {!token ? (
        <div className="text-muted">{FR.selectHint}</div>
      ) : loading ? (
        <div className="d-flex align-items-center gap-2">
          <div className="spinner-border spinner-border-sm" role="status" aria-label="Chargement" />
          <span>{FR.loading}</span>
        </div>
      ) : err ? (
        <div className="alert alert-danger" role="alert">{FR.loadError}</div>
      ) : (
        <>
          <div className="d-flex align-items-center justify-content-between">
            <h1 className="list-title mb-0">{listInfo?.name ?? "Nom de la liste"}</h1>

            <div className="d-flex gap-2">
              <button type="button" className="btn btn-primary" onClick={openCreate}>
                {FR.headerAdd}
              </button>
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => setShowListModal(true)}
              >
                {FR.headerManage}
              </button>
            </div>
          </div>

          <hr className="hr-thin" />

          {tasks.length === 0 ? (
            <div className="text-muted">{FR.empty}</div>
          ) : (
            grouped.map(([name, items]) => (
              <CategorySection
                key={name}
                name={name}
                tasks={items}
                onTaskUpdated={handleToggleUpdated}
                onAddTask={onAddToCategory}
                onEditTask={onEditTask}
                onDeleteTask={onDeleteTask}
              />
            ))
          )}
        </>
      )}

      <ListModal
        show={showListModal}
        mode="edit"
        initial={listInfo}
        onClose={() => setShowListModal(false)}
        onSubmit={updateList}
        onDelete={deleteList}
      />

      <TaskModal
        show={showEditor}
        mode={editorMode}
        initial={editorInitial}
        categories={Array.isArray(listInfo?.categories) ? listInfo.categories : []}
        defaultCategoryId={null}
        onClose={() => setShowEditor(false)}
        onSubmit={(form) =>
          editorMode === "edit" ? updateTask(editorInitial, form) : createTask(form)
        }
      />

      <ConfirmDialog
        show={!!toDelete}
        title={FR.deleteTitle}
        message={FR.deleteMsg}
        onClose={() => setToDelete(null)}
        onConfirm={async () => {
          const t = toDelete; setToDelete(null);
          await deleteTask(t);
        }}
      />
    </main>
  );
}
