import { useCallback, useState } from "react";

export type AccordionId = string | null;

export type UseAccordion = {
  expandedId: AccordionId;
  toggle: (id: string) => void;
  isExpanded: (id: string) => boolean;
  reset: () => void;
};

export const useAccordion = (initialId: AccordionId = null): UseAccordion => {
  const [expandedId, setExpandedId] = useState<AccordionId>(initialId);

  const toggle = useCallback((id: string): void => {
    setExpandedId((current) => (current === id ? null : id));
  }, []);

  const isExpanded = useCallback(
    (id: string): boolean => expandedId === id,
    [expandedId],
  );

  const reset = useCallback((): void => setExpandedId(null), []);

  return { expandedId, toggle, isExpanded, reset };
};
