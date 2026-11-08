import { Navigate, useLocation, useParams } from "react-router-dom";

/** Preserve older bookmarks and login return URLs after the student route rename. */
export function LegacyStudentTaskRedirect() {
  const { id } = useParams();
  const { search, hash, state } = useLocation();
  return (
    <Navigate
      to={`${id ? `/tasks/${encodeURIComponent(id)}` : "/tasks"}${search}${hash}`}
      replace
      state={state}
    />
  );
}
