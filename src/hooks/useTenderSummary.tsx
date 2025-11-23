import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { BoampTender } from "./useBoampTenders";

// Cache for summaries
const summaryCache = new Map<string, string>();

export function useTenderSummary(tender: BoampTender | null) {
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!tender) {
      setSummary(null);
      setLoading(false);
      setError(null);
      return;
    }

    // Check cache first
    const cached = summaryCache.get(tender.id);
    if (cached) {
      setSummary(cached);
      setLoading(false);
      return;
    }

    // Generate summary
    const generateSummary = async () => {
      setLoading(true);
      setError(null);

      try {
        const { data, error: functionError } = await supabase.functions.invoke(
          "generate-tender-summary",
          {
            body: { tender },
          }
        );

        if (functionError) {
          throw functionError;
        }

        if (data?.summary) {
          summaryCache.set(tender.id, data.summary);
          setSummary(data.summary);
        } else {
          throw new Error("No summary returned");
        }
      } catch (err) {
        console.error("Error generating summary:", err);
        setError(err instanceof Error ? err.message : "Failed to generate summary");
        setSummary(null);
      } finally {
        setLoading(false);
      }
    };

    generateSummary();
  }, [tender?.id]);

  return { summary, loading, error };
}
