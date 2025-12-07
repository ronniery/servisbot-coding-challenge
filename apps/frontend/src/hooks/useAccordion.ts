import { useCallback, useState } from "react";

export type AccordionId = string | null;

export type UseAccordionReturn = {
  expandedId: AccordionId;
  toggle: (id: string) => void;
  isExpanded: (id: string) => boolean;
  reset: () => void;
};

export const useAccordion = (
  initialId: AccordionId = null,
): UseAccordionReturn => {
  const [expandedId, setExpandedId] = useState<AccordionId>(initialId);

  const toggle = useCallback((id: string) => {
    setExpandedId((current) => (current === id ? null : id));
  }, []);

  const isExpanded = useCallback(
    (id: string) => expandedId === id,
    [expandedId],
  );

  const reset = useCallback(() => setExpandedId(null), []);

  return { expandedId, toggle, isExpanded, reset };
};
