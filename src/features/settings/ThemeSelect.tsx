import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useSetThemeMode, useThemeMode } from '@/store/themeStore';
import type { ThemeMode } from '@/store/themeStore';

interface ThemeOption {
  value: ThemeMode;
  label: string;
}

const THEME_OPTIONS: ThemeOption[] = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'System' },
];

// Theme choice control for the Settings page.
export default function ThemeSelect() {
  const mode = useThemeMode();
  const setMode = useSetThemeMode();

  return (
    <div className="space-y-2">
      <label htmlFor="theme-select" className="text-sm font-medium">
        Theme
      </label>
      <Select
        value={mode}
        onValueChange={(value) => {
          const option = THEME_OPTIONS.find((item) => item.value === value);
          if (option) {
            setMode(option.value);
          }
        }}
      >
        <SelectTrigger id="theme-select" className="w-48">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {THEME_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <p className="text-sm text-muted-foreground">
        Saved in this browser only. System follows your operating system setting.
      </p>
    </div>
  );
}
