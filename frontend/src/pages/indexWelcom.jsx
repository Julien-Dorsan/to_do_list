import { Navigate, useOutletContext } from "react-router-dom";

export default function IndexWelcome() {
  const { lists = [], isLoading = false } = useOutletContext() || {};

  const first = Array.isArray(lists) && lists.length ? lists[0] : null;
  const tok = first?.public_token || first?.publicToken || first?.token;

  if (isLoading) {
    return (
      <main className="app-main">
        <div className="d-flex align-items-center gap-2">
          <div className="spinner-border spinner-border-sm" role="status" aria-label="Chargement" />
          <span>Chargement…</span>
        </div>
      </main>
    );
  }

  if (tok) return <Navigate to={`/l/${tok}`} replace />;

  return (
    <main className="app-main">
      <h1 className="list-title">Bienvenue</h1>
      <hr className="hr-thin" />
      <p className="text-muted">Sélectionnez une liste à gauche pour afficher ses tâches.</p>
    </main>
  );
}
