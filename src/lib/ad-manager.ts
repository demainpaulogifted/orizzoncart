/**
 * Ad Manager - Handles frequency capping and ad display logic
 */

export const AdManager = {
  /**
   * Track and check if vignette should show (every N views)
   */
  shouldShowVignette: (storageKey: string, frequency: number): boolean => {
    if (typeof window === 'undefined') return false;
    
    const views = parseInt(sessionStorage.getItem(storageKey) || '0', 10);
    const newViews = views + 1;
    sessionStorage.setItem(storageKey, newViews.toString());
    
    // Show on first view, then every N views
    return views === 0 || (newViews % frequency === 0);
  },

  /**
   * Track page view for dashboard
   */
  trackDashboardView: (): number => {
    if (typeof window === 'undefined') return 0;
    const views = parseInt(sessionStorage.getItem('dash_views') || '0', 10) + 1;
    sessionStorage.setItem('dash_views', views.toString());
    return views;
  },

  /**
   * Track product page view
   */
  trackProductView: (): number => {
    if (typeof window === 'undefined') return 0;
    const views = parseInt(sessionStorage.getItem('prod_views') || '0', 10) + 1;
    sessionStorage.setItem('prod_views', views.toString());
    return views;
  },

  /**
   * Check if we should show dashboard vignette (every 3 page triggers)
   */
  shouldShowDashboardVignette: (): boolean => {
    const views = AdManager.trackDashboardView();
    return views % 3 === 0;
  },

  /**
   * Check if we should show product vignette (every 2 clicks)
   */
  shouldShowProductVignette: (): boolean => {
    const views = AdManager.trackProductView();
    return views % 2 === 0;
  },

  /**
   * Reset all counters (call on logout or session end)
   */
  resetCounters: () => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('dash_views');
      sessionStorage.removeItem('prod_views');
      sessionStorage.removeItem('landing_vignette');
      sessionStorage.removeItem('signup_vignette');
    }
  }
};