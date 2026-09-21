import { useEffect, useState } from "react";
import { getPublicMenu } from "../services/publicMenu";
import type { PublicMenuData } from "../types/menu";

export function usePublicMenu(slug: string | undefined) {
  const [data, setData] = useState<PublicMenuData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    setNotFound(false);

    getPublicMenu(slug)
      .then((result) => {
        if (cancelled) return;
        if (!result) {
          setNotFound(true);
        } else {
          setData(result);
        }
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Couldn't load the menu");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  return { data, loading, error, notFound };
}
