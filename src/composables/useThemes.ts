import { InjectionKey, onMounted, provide, Ref, ref } from 'vue';

type TTheme = 'dark' | 'light';

export const ThemeKey: InjectionKey<Ref<TTheme>> = Symbol('theme');
export const ToggleThemeKey: InjectionKey<() => void> = Symbol('toggleTheme');

export function useTheme() {
  const theme = ref<TTheme>(
    (localStorage.getItem('dashboard_theme') as TTheme) || 'dark',
  );

  function toggleTheme() {
    theme.value = theme.value === 'dark' ? 'light' : 'dark';
    document.body.setAttribute('data-theme', theme.value);
    localStorage.setItem('dashboard_theme', theme.value);
  }

  onMounted(() => document.body.setAttribute('data-theme', theme.value));

  provide(ThemeKey, theme);
  provide(ToggleThemeKey, toggleTheme);
}
