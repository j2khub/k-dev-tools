"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "alphak-favorites";

function getFavorites(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    setFavorites(getFavorites());

    const handleStorage = () => setFavorites(getFavorites());
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const toggle = useCallback((href: string) => {
    setFavorites((prev) => {
      const next = prev.includes(href)
        ? prev.filter((f) => f !== href)
        : [...prev, href];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
    setTimeout(() => window.dispatchEvent(new Event("storage")), 0);
  }, []);

  const isFavorite = useCallback(
    (href: string) => favorites.includes(href),
    [favorites]
  );

  return { favorites, toggle, isFavorite };
}
