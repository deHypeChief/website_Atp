import { Fragment } from "react";
import { useQuery } from "@tanstack/react-query";
import { getSiteContent } from "../api/api.endpoints";

/**
 * Reads admin-editable website copy.
 *
 *   const copy = useCopy();
 *   copy("home.hero.title", "Own the court.")
 *
 * The second argument is the text the page ships with. It renders while the request is in
 * flight and if a key is ever missing, so the site is never blank waiting on the CMS.
 * Keys are declared in api/server/src/routes/siteContent/copy.registry.ts.
 */
export function useCopy() {
  const { data } = useQuery({
    queryKey: ["site-content"],
    queryFn: getSiteContent,
    staleTime: 300000,
  });
  const copy = data?.copy || {};
  return (key, fallback = "") => {
    const value = copy[key];
    return typeof value === "string" && value.trim() ? value : fallback;
  };
}

/**
 * Renders copy that contains hard line breaks. Editors type a newline; the design keeps
 * its two-line headings without anyone having to write markup in the admin.
 */
export function Lines({ children }) {
  return String(children ?? "").split("\n").map((line, index) => (
    <Fragment key={index}>{index > 0 && <br />}{line}</Fragment>
  ));
}
