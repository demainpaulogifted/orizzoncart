import { getThemeVariables } from '@/lib/themes';

export function ThemeWrapper({ themeId, children }: { themeId: string | null; children: React.ReactNode }) {
  const variables = getThemeVariables(themeId);

  return (
    <div 
      style={variables} 
      className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] font-[var(--font-body)] transition-colors duration-300"
    >
      {children}
    </div>
  );
}