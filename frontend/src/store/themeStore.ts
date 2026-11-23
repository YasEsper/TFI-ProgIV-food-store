import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ThemeStore {
  darkMode: boolean;
  toggleTheme: () => void;
}

// Preferencia visual: se guarda en localStorage (clave theme-storage) y vuelve al recargar.
// La sesión NO se persiste: solo preferencias de interfaz (RA-09).
export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      darkMode: false,
      toggleTheme: () => set((state) => ({ darkMode: !state.darkMode })),
    }),
    { name: "theme-storage" },
  ),
);

// La variante dark: de Tailwind se activa con la clase "dark" en <html> (ver index.css).
// Se aplica al cargar el store (con el valor recuperado de localStorage) y en cada cambio.
const aplicarTema = (darkMode: boolean) =>
  document.documentElement.classList.toggle("dark", darkMode);

aplicarTema(useThemeStore.getState().darkMode);
useThemeStore.subscribe((state) => aplicarTema(state.darkMode));
