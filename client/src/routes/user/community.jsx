import Clubhouse from "../../components/community/clubhouse";

// The signed-in view. The public website renders the same feed from routes/community.jsx.
export default function PlayerCommunity() {
  return <Clubhouse variant="member" />;
}
