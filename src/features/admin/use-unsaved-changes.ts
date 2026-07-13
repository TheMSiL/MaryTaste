"use client";

import { useEffect } from "react";

export function useUnsavedChanges(dirty: boolean) {
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  return (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (dirty && !window.confirm("Є незбережені зміни. Вийти без збереження?")) {
      event.preventDefault();
    }
  };
}
