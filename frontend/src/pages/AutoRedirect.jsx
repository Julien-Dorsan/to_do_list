import { Navigate, useOutletContext } from "react-router-dom";

export default function AutoRedirect() {
  const { lists } = useOutletContext() || { lists: [] };
  const first = Array.isArray(lists) && lists.length ? lists[0] : null;
  const tok = first?.public_token || first?.publicToken || first?.token;
  
  if (tok) return <Navigate to={`/l/${tok}`} replace />;
  return <Navigate to="/welcome" replace />;
}