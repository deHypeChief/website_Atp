import Clubhouse from "../components/community/clubhouse";

/**
 * The clubhouse on the public website. It renders the same feed players see in their
 * dashboard, read-only until the visitor signs in.
 */
export default function Community() {
  return <div className="clubhousePublicShell"><Clubhouse variant="public" /></div>;
}
