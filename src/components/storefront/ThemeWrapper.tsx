import { getThemeVariables } from '@/lib/themes';

const FONT_LINK =
  'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Montserrat:wght@300..800&family=Cormorant+Garamond:ital,wght@0,400..700;1,400..700&family=Inter:wght@300..800&family=Lato:wght@300;400;700&family=Roboto:wght@300;400;500;700&display=swap';

export function ThemeWrapper({ themeId, children }: { themeId: string | null; children: React.ReactNode }) {
  const variables = getThemeVariables(themeId);

  return (
    <>
      <link rel="stylesheet" href={FONT_LINK} />
      <div
        style={variables}
        className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] font-[var(--font-body)] transition-colors duration-300"
      >
        {children}
      </div>
    </>
  );
}