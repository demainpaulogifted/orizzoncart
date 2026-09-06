'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { THEMES } from '@/lib/themes';

export default function ThemeSettingsPage() {
  const [currentThemeId, setCurrentThemeId] = useState('luxe-minimal');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchTheme = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      const { data: merchant } = await supabase.from('merchants').select('theme_id').eq('user_id', user?.id).single();
      if (merchant?.theme_id) setCurrentThemeId(merchant.theme_id);
    };
    fetchTheme();
  }, []);

  const handleSelectTheme = async (themeId: string) => {
    setIsSaving(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    const { error } = await supabase.from('merchants').update({ theme_id: themeId }).eq('user_id', user?.id);
    
    if (error) {
      toast.error('Failed to update theme');
    } else {
      setCurrentThemeId(themeId);
      toast.success('Theme updated successfully!');
    }
    setIsSaving(false);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 font-display">Store Themes</h1>
        <p className="text-gray-600 mt-2">Choose a premium theme to transform your storefront.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.values(THEMES).map((theme) => {
          const isSelected = currentThemeId === theme.name;
          return (
            <div key={theme.name} className={`bg-white rounded-2xl shadow-sm border-2 overflow-hidden transition-all ${isSelected ? 'border-blue-500 ring-4 ring-blue-100' : 'border-gray-200 hover:border-gray-300'}`}>
              {/* Theme Preview Color Block */}
              <div className="h-32 w-full" style={{ backgroundColor: theme.variables['--color-bg'], color: theme.variables['--color-text'] }}>
                <div className="flex items-center justify-center h-full">
                  <span className="text-2xl font-bold" style={{ fontFamily: theme.variables['--font-heading'] }}>
                    {theme.display_name}
                  </span>
                </div>
              </div>
              
              <div className="p-6 space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{theme.display_name}</h3>
                  <p className="text-sm text-gray-500 mt-1">{theme.description}</p>
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t">
                  <div>
                    <span className="text-xs font-bold text-gray-500 uppercase">Price</span>
                    <p className="text-lg font-bold text-gray-900">₦{theme.price.toLocaleString()}</p>
                  </div>
                  <button 
                    onClick={() => handleSelectTheme(theme.name)}
                    disabled={isSaving || isSelected}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                      isSelected 
                        ? 'bg-green-100 text-green-700 cursor-default' 
                        : 'bg-gray-900 text-white hover:bg-gray-800'
                    }`}
                  >
                    {isSelected ? 'Active' : 'Select Theme'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}