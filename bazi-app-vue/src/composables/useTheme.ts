import { ref, watch, onMounted, onUnmounted } from 'vue';

export type Theme = 'light' | 'dark' | 'auto';

const THEME_KEY = 'user-theme';

/**
 * Theme management composable
 * Handles theme state, localStorage persistence, and system preference synchronization
 *
 * Features:
 * - Three theme modes: 'light', 'dark', 'auto'
 * - Persists user preference to localStorage
 * - Syncs with system preference when in 'auto' mode
 * - Applies theme by setting .dark class and data-theme attribute on <html>
 */
export function useTheme() {
  const theme = ref<Theme>('auto');

  // Media Query Listener for system preference
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

  /**
   * Apply theme to document root
   * - Sets .dark class on <html> for Tailwind-style dark mode
   * - Sets data-theme attribute for custom CSS variable switching
   */
  const applyTheme = (newTheme: Theme) => {
    const root = document.documentElement;
    const isDark =
      newTheme === 'dark' || (newTheme === 'auto' && mediaQuery.matches);

    if (isDark) {
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
    } else {
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
    }
  };

  /**
   * Handle system preference changes
   * Only applies if current theme is 'auto'
   */
  const handleSystemChange = () => {
    if (theme.value === 'auto') {
      applyTheme('auto');
    }
  };

  /**
   * Set theme and persist to localStorage
   */
  const setTheme = (newTheme: Theme) => {
    theme.value = newTheme;
    localStorage.setItem(THEME_KEY, newTheme);
  };

  // Watch for theme changes and apply them
  watch(theme, (newTheme) => {
    applyTheme(newTheme);
  });

  onMounted(() => {
    // Initialize from localStorage or default to 'auto'
    const storedTheme = localStorage.getItem(THEME_KEY) as Theme | null;
    if (storedTheme && ['light', 'dark', 'auto'].includes(storedTheme)) {
      theme.value = storedTheme;
    } else {
      theme.value = 'auto';
    }

    // Apply initial theme
    applyTheme(theme.value);

    // Listen for system preference changes
    mediaQuery.addEventListener('change', handleSystemChange);
  });

  onUnmounted(() => {
    mediaQuery.removeEventListener('change', handleSystemChange);
  });

  return {
    theme,
    setTheme,
  };
}
