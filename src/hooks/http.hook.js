import { useState, useCallback } from "react";

export const useHttp = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const request = useCallback(
    async (url, method = "GET", body = null, headers = null) => {
      setLoading(true);

      // A Content-Type header on a GET makes the request non-simple, which
      // forces a CORS preflight; static hosts (GitHub Pages, jsdelivr) do not
      // answer OPTIONS, so the fetch fails outright. Send it only with a body.
      const finalHeaders =
        headers ?? (body ? { "Content-Type": "application/json" } : undefined);

      try {
        const response = await fetch(url, { method, body, headers: finalHeaders });

        if (!response.ok) {
          throw new Error(`Could not fetch ${url}, status: ${response.status}`);
        }

        const data = await response.json();

        setLoading(false);
        return data;
      } catch (e) {
        setLoading(false);
        setError(e.message);
        throw e;
      }
    },
    []
  );

  const clearError = useCallback(() => setError(null), []);

  return { loading, request, error, clearError };
};
