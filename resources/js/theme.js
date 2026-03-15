/**
 * Sistema Global de Dark Mode / Light Mode
 * Persiste en localStorage y se aplica inmediatamente al cargar
 */

(function() {
  'use strict';

  // ==========================================
  // PASO 0: Aplicar tema INMEDIATAMENTE (evitar flash)
  // Se ejecuta sincronamente antes de que el DOM se renderice
  // ==========================================
  
  const THEME_KEY = 'varchate_theme';
  const DARK_CLASS = 'dark-mode';
  
  function applyTheme(isDark) {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add(DARK_CLASS);
    } else {
      root.classList.remove(DARK_CLASS);
    }
  }

  // Aplicar tema guardado O preferencia del sistema
  try {
    const saved = localStorage.getItem(THEME_KEY);
    
    if (saved !== null) {
      // Usuario ha guardado una preferencia
      applyTheme(saved === 'dark');
    } else {
      // Primera visita: usar preferencia del sistema
      const prefersDark = window.matchMedia && 
                         window.matchMedia('(prefers-color-scheme: dark)').matches;
      applyTheme(prefersDark);
    }
  } catch (e) {
    // Si localStorage falla, fallback a light
    console.warn('Error al cargar tema desde localStorage:', e);
  }

  // ==========================================
  // PASO 1: Esperar a que el DOM esté listo para configurar el toggle
  // ==========================================

  function initializeThemeToggle() {
    const toggleBtns = [
      document.getElementById('btn-darkmode'),
      document.getElementById('darkmode-btn-mobile')
    ];

    toggleBtns.forEach(themeToggle => {
      if (!themeToggle) return;

      // Handler para cambiar el tema
      themeToggle.addEventListener('click', function(e) {
        e.preventDefault();
        
        const root = document.documentElement;
        const isDark = root.classList.toggle(DARK_CLASS);
        
        // Guardar preferencia
        try {
          localStorage.setItem(THEME_KEY, isDark ? 'dark' : 'light');
        } catch (e) {
          console.warn('Error al guardar tema en localStorage:', e);
        }

        // Disparar evento personalizado para que otras scripts puedan reaccionar
        window.dispatchEvent(new CustomEvent('themechange', { 
          detail: { theme: isDark ? 'dark' : 'light' } 
        }));
      });
    });
  }

  // ==========================================
  // PASO 2: Cuando el DOM esté listo
  // ==========================================

  if (document.readyState === 'loading') {
    // El DOM todavía está cargando
    document.addEventListener('DOMContentLoaded', initializeThemeToggle);
  } else {
    // El DOM ya está listo
    initializeThemeToggle();
  }

  // ==========================================
  // PASO 3: Exponer API global (opcional, para debugging)
  // ==========================================

  window.VarchateTheme = {
    isDark() {
      return document.documentElement.classList.contains(DARK_CLASS);
    },
    setDark(isDark) {
      applyTheme(isDark);
      try {
        localStorage.setItem(THEME_KEY, isDark ? 'dark' : 'light');
      } catch (e) {
        console.warn('Error al guardar tema:', e);
      }
    },
    toggle() {
      const isDark = !window.VarchateTheme.isDark();
      window.VarchateTheme.setDark(isDark);
      return isDark;
    }
  };
})();
