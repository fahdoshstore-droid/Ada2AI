import { useEffect } from "react";
import { useLocation } from "wouter";

/**
 * ScrollToTop — scrolls window to top on every route change
 */
export default function ScrollToTop() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [setLocation]);

  return null;
}
