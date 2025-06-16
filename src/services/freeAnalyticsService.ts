// 📊 ANALYTICS GRATUITO - Google Analytics + Plausible + Umami
export interface AnalyticsEvent {
  action: string;
  category: string;
  label?: string;
  value?: number;
}

export interface UserBehavior {
  pageViews: number;
  sessionDuration: number;
  bounceRate: number;
  topPages: string[];
  userFlow: string[];
}

export class FreeAnalyticsService {
  private static instance: FreeAnalyticsService;
  private localAnalytics: Map<string, any> = new Map();

  private constructor() {
    this.initializeLocalAnalytics();
  }

  public static getInstance(): FreeAnalyticsService {
    if (!FreeAnalyticsService.instance) {
      FreeAnalyticsService.instance = new FreeAnalyticsService();
    }
    return FreeAnalyticsService.instance;
  }

  // 🆓 GOOGLE ANALYTICS 4 (GRATUITO)
  async initializeGA4(): Promise<void> {
    try {
      // Google Analytics 4 - completamente gratuito
      const script = document.createElement('script');
      script.src = 'https://www.googletagmanager.com/gtag/js?id=G-YOUR-GA4-ID';
      script.async = true;
      document.head.appendChild(script);

      // @ts-ignore
      window.dataLayer = window.dataLayer || [];
      // @ts-ignore
      function gtag(){window.dataLayer.push(arguments);}
      // @ts-ignore
      gtag('js', new Date());
      // @ts-ignore
      gtag('config', 'G-YOUR-GA4-ID');

      console.log('✅ Google Analytics 4 inizializzato');

    } catch (error) {
      console.warn('⚠️ GA4 non disponibile, uso analytics locale');
    }
  }

  // 📈 PLAUSIBLE ANALYTICS (GRATUITO)
  async initializePlausible(): Promise<void> {
    try {
      // Plausible - privacy-focused, gratuito per siti piccoli
      const script = document.createElement('script');
      script.src = 'https://plausible.io/js/plausible.js';
      script.defer = true;
      script.setAttribute('data-domain', 'your-domain.com');
      document.head.appendChild(script);

      console.log('✅ Plausible Analytics inizializzato');

    } catch (error) {
      console.warn('⚠️ Plausible non disponibile');
    }
  }

  // 🔍 UMAMI ANALYTICS (GRATUITO)
  async initializeUmami(): Promise<void> {
    try {
      // Umami - self-hosted gratuito
      const script = document.createElement('script');
      script.src = 'https://your-umami-instance.com/umami.js';
      script.defer = true;
      script.setAttribute('data-website-id', 'your-website-id');
      document.head.appendChild(script);

      console.log('✅ Umami Analytics inizializzato');

    } catch (error) {
      console.warn('⚠️ Umami non disponibile');
    }
  }

  // 📊 ANALYTICS LOCALE AVANZATO
  private initializeLocalAnalytics(): void {
    // Sistema analytics locale completo
    this.localAnalytics.set('sessions', []);
    this.localAnalytics.set('pageViews', []);
    this.localAnalytics.set('events', []);
    this.localAnalytics.set('userActions', []);
    
    // Traccia automaticamente
    this.trackPageView();
    this.trackUserInteractions();
    this.trackPerformance();
  }

  // 📄 TRACCIAMENTO PAGINE
  trackPageView(page?: string): void {
    const pageData = {
      page: page || window.location.pathname,
      timestamp: new Date().toISOString(),
      referrer: document.referrer,
      userAgent: navigator.userAgent,
      sessionId: this.getSessionId()
    };

    const pageViews = this.localAnalytics.get('pageViews') || [];
    pageViews.push(pageData);
    this.localAnalytics.set('pageViews', pageViews);

    // Invia a GA4 se disponibile
    // @ts-ignore
    if (typeof window.gtag !== 'undefined') {
      // @ts-ignore
      window.gtag('event', 'page_view', {
        page_title: document.title,
        page_location: window.location.href
      });
    }
  }

  // 🎯 TRACCIAMENTO EVENTI
  trackEvent(event: AnalyticsEvent): void {
    const eventData = {
      ...event,
      timestamp: new Date().toISOString(),
      sessionId: this.getSessionId(),
      userId: this.getUserId()
    };

    const events = this.localAnalytics.get('events') || [];
    events.push(eventData);
    this.localAnalytics.set('events', events);

    // Invia a GA4
    // @ts-ignore
    if (typeof window.gtag !== 'undefined') {
      // @ts-ignore
      window.gtag('event', event.action, {
        event_category: event.category,
        event_label: event.label,
        value: event.value
      });
    }

    console.log('📊 Evento tracciato:', event);
  }

  // 👤 TRACCIAMENTO COMPORTAMENTO UTENTE
  private trackUserInteractions(): void {
    // Click tracking
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      this.trackEvent({
        action: 'click',
        category: 'user_interaction',
        label: target.tagName + (target.className ? '.' + target.className : '')
      });
    });

    // Form submissions
    document.addEventListener('submit', (e) => {
      const form = e.target as HTMLFormElement;
      this.trackEvent({
        action: 'form_submit',
        category: 'user_interaction',
        label: form.id || form.className
      });
    });

    // Scroll depth
    let maxScroll = 0;
    window.addEventListener('scroll', () => {
      const scrollPercent = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
      if (scrollPercent > maxScroll) {
        maxScroll = scrollPercent;
        if (scrollPercent % 25 === 0) { // Track at 25%, 50%, 75%, 100%
          this.trackEvent({
            action: 'scroll',
            category: 'user_engagement',
            label: `${scrollPercent}%`,
            value: scrollPercent
          });
        }
      }
    });
  }

  // ⚡ TRACCIAMENTO PERFORMANCE
  private trackPerformance(): void {
    // Page load time
    window.addEventListener('load', () => {
      const loadTime = performance.now();
      this.trackEvent({
        action: 'page_load_time',
        category: 'performance',
        value: Math.round(loadTime)
      });
    });

    // Core Web Vitals
    if ('web-vitals' in window) {
      import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
        getCLS((metric) => this.trackEvent({
          action: 'CLS',
          category: 'web_vitals',
          value: Math.round(metric.value * 1000)
        }));

        getFID((metric) => this.trackEvent({
          action: 'FID',
          category: 'web_vitals',
          value: Math.round(metric.value)
        }));

        getLCP((metric) => this.trackEvent({
          action: 'LCP',
          category: 'web_vitals',
          value: Math.round(metric.value)
        }));
      });
    }
  }

  // 📈 ANALISI DATI
  async getAnalytics(): Promise<UserBehavior> {
    const pageViews = this.localAnalytics.get('pageViews') || [];
    const events = this.localAnalytics.get('events') || [];

    // Calcola metriche
    const sessionDurations = this.calculateSessionDurations();
    const avgSessionDuration = sessionDurations.reduce((a, b) => a + b, 0) / sessionDurations.length || 0;

    const topPages = this.getTopPages(pageViews);
    const bounceRate = this.calculateBounceRate();

    return {
      pageViews: pageViews.length,
      sessionDuration: Math.round(avgSessionDuration),
      bounceRate: Math.round(bounceRate * 100),
      topPages,
      userFlow: this.getUserFlow()
    };
  }

  // 🎯 EVENTI BUSINESS SPECIFICI
  trackBusinessEvent(eventType: string, data?: any): void {
    this.trackEvent({
      action: eventType,
      category: 'business',
      label: data?.details || '',
      value: data?.value || 1
    });
  }

  // 📊 DASHBOARD ANALYTICS
  async getDashboardMetrics(): Promise<any> {
    const analytics = await this.getAnalytics();
    const events = this.localAnalytics.get('events') || [];

    // Metriche business
    const businessEvents = events.filter((e: any) => e.category === 'business');
    const preventiviCreati = businessEvents.filter((e: any) => e.action === 'preventivo_created').length;
    const lavoriCompletati = businessEvents.filter((e: any) => e.action === 'lavoro_completed').length;
    const clientiAggiunti = businessEvents.filter((e: any) => e.action === 'cliente_added').length;

    return {
      ...analytics,
      businessMetrics: {
        preventiviCreati,
        lavoriCompletati,
        clientiAggiunti,
        loginGiornalieri: businessEvents.filter((e: any) => 
          e.action === 'login' && 
          new Date(e.timestamp).toDateString() === new Date().toDateString()
        ).length
      }
    };
  }

  // 🔧 UTILITY METHODS
  private getSessionId(): string {
    let sessionId = sessionStorage.getItem('analytics_session_id');
    if (!sessionId) {
      sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      sessionStorage.setItem('analytics_session_id', sessionId);
    }
    return sessionId;
  }

  private getUserId(): string {
    let userId = localStorage.getItem('analytics_user_id');
    if (!userId) {
      userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('analytics_user_id', userId);
    }
    return userId;
  }

  private calculateSessionDurations(): number[] {
    const pageViews = this.localAnalytics.get('pageViews') || [];
    const sessions = new Map();

    pageViews.forEach((pv: any) => {
      if (!sessions.has(pv.sessionId)) {
        sessions.set(pv.sessionId, []);
      }
      sessions.get(pv.sessionId).push(new Date(pv.timestamp).getTime());
    });

    const durations: number[] = [];
    sessions.forEach((timestamps) => {
      if (timestamps.length > 1) {
        const duration = (Math.max(...timestamps) - Math.min(...timestamps)) / 1000;
        durations.push(duration);
      }
    });

    return durations;
  }

  private getTopPages(pageViews: any[]): string[] {
    const pageCounts = new Map();
    pageViews.forEach(pv => {
      pageCounts.set(pv.page, (pageCounts.get(pv.page) || 0) + 1);
    });

    return Array.from(pageCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(entry => entry[0]);
  }

  private calculateBounceRate(): number {
    const sessions = new Map();
    const pageViews = this.localAnalytics.get('pageViews') || [];

    pageViews.forEach((pv: any) => {
      if (!sessions.has(pv.sessionId)) {
        sessions.set(pv.sessionId, 0);
      }
      sessions.set(pv.sessionId, sessions.get(pv.sessionId) + 1);
    });

    const singlePageSessions = Array.from(sessions.values()).filter(count => count === 1).length;
    return sessions.size > 0 ? singlePageSessions / sessions.size : 0;
  }

  private getUserFlow(): string[] {
    const pageViews = this.localAnalytics.get('pageViews') || [];
    const sortedViews = pageViews.sort((a: any, b: any) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    
    return sortedViews.slice(0, 10).map((pv: any) => pv.page);
  }
}

export const freeAnalyticsService = FreeAnalyticsService.getInstance();