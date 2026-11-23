import { useThemeStore } from "@/store/themeStore";
import Button from "./ui/Button";

// Alterna modo claro / oscuro. La preferencia la guarda themeStore (persist)
function ThemeToggle() {
  const darkMode = useThemeStore((state) => state.darkMode);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);

  return (
    <Button variante="secondary" tamano="sm" onClick={toggleTheme} aria-pressed={darkMode}>
      {darkMode ? "Modo claro" : "Modo oscuro"}
    </Button>
  );
}

export default ThemeToggle;
