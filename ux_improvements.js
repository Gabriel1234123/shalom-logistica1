// ========================================
// MEJORAS DE EXPERIENCIA DE USUARIO (UX)
// ========================================

// 1. SISTEMA DE BÚSQUEDA INTELIGENTE
class BusquedaInteligente {
  constructor() {
    this.historialBusquedas = [];
    this.sugerenciasPersonalizadas = new Map();
  }
  
  buscar(query, datos) {
    // Normalizar búsqueda
    const queryNormalizada = this.normalizarTexto(query);
    
    // Buscar coincidencias exactas
    let resultados = this.busquedaExacta(queryNormalizada, datos);
    
    // Si no hay resultados exactos, buscar coincidencias parciales
    if (resultados.length === 0) {
      resultados = this.busquedaParcial(queryNormalizada, datos);
    }
    
    // Si aún no hay resultados, búsqueda difusa
    if (resultados.length === 0) {
      resultados = this.busquedaDifusa(queryNormalizada, datos);
    }
    
    // Registrar búsqueda
    this.registrarBusqueda(query, resultados.length);
    
    // Ordenar por relevancia
    return this.ordenarPorRelevancia(resultados, queryNormalizada);
  }
  
  normalizarTexto(texto) {
    return texto.toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Quitar tildes
      .replace(/[^\w\s]/g, ' ') // Quitar caracteres especiales
      .replace(/\s+/g, ' ') // Espacios múltiples a uno
      .trim();
  }
  
  busquedaExacta(query, datos) {
    return datos.filter(item => {
      const campos = this.obtenerCamposBusqueda(item);
      return campos.some(campo => 
        this.normalizarTexto(campo.toString()).includes(query)
      );
    });
  }
  
  busquedaParcial(query, datos) {
    const palabras = query.split(' ');
    return datos.filter(item => {
      const campos = this.obtenerCamposBusqueda(item);
      return palabras.every(palabra =>
        campos.some(campo =>
          this.normalizarTexto(campo.toString()).includes(palabra)
        )
      );
    });
  }
  
  busquedaDifusa(query, datos) {
    return datos.filter(item => {
      const campos = this.obtenerCamposBusqueda(item);
      return campos.some(campo => {
        const similitud = this.calcularSimilitud(query, this.normalizarTexto(campo.toString()));
        return similitud > 0.6; // 60% de similitud mínima
      });
    });
  }
  
  calcularSimilitud(str1, str2) {
    const matriz = Array(str2.length + 1).fill().map(() => Array(str1.length + 1).fill(0));
    
    for (let i = 0; i <= str1.length; i++) matriz[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matriz[j][0] = j;
    
    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        if (str1[i - 1] === str2[j - 1]) {
          matriz[j][i] = matriz[j - 1][i - 1];
        } else {
          matriz[j][i] = Math.min(
            matriz[j - 1][i] + 1,
            matriz[j][i - 1] + 1,
            matriz[j - 1][i - 1] + 1
          );
        }
      }
    }
    
    const distancia = matriz[str2.length][str1.length];
    return 1 - (distancia / Math.max(str1.length, str2.length));
  }
  
  obtenerCamposBusqueda(item) {
    return [
      item.codigo,
      item.destinatario,
      item.dni,
      item.ciudad,
      item.direccion,
      item.contenido,
      item.estado,
      item.usuario
    ].filter(Boolean);
  }
  
  obtenerSugerencias(query) {
    const historial = this.historialBusquedas
      .filter(b => b.query.startsWith(query.toLowerCase()))
      .sort((a, b) => b.frecuencia - a.frecuencia)
      .slice(0, 5);
    
    return historial.map(h => h.query);
  }
  
  registrarBusqueda(query, resultados) {
    const busqueda = this.historialBusquedas.find(b => b.query === query.toLowerCase());
    if (busqueda) {
      busqueda.frecuencia++;
      busqueda.ultimaVez = new Date();
    } else {
      this.historialBusquedas.push({
        query: query.toLowerCase(),
        frecuencia: 1,
        ultimaVez: new Date(),
        resultados
      });
    }
  }
}

// 2. SISTEMA DE ATAJOS DE TECLADO
class SistemaAtajos {
  constructor() {
    this.atajos = new Map();
    this.activo = true;
    this.inicializar();
  }
  
  inicializar() {
    document.addEventListener('keydown', (e) => {
      if (!this.activo) return;
      
      const combinacion = this.obtenerCombinacion(e);
      const accion = this.atajos.get(combinacion);
      
      if (accion) {
        e.preventDefault();
        accion();
        this.mostrarNotificacionAtajo(combinacion);
      }
    });
    
    this.registrarAtajosDefault();
  }
  
  registrarAtajosDefault() {
    // Atajos básicos
    this.registrar('ctrl+n', () => this.ejecutarAccion('nuevo_paquete'));
    this.registrar('ctrl+f', () => this.ejecutarAccion('buscar'));
    this.registrar('ctrl+s', () => this.ejecutarAccion('guardar'));
    this.registrar('escape', () => this.ejecutarAccion('cerrar_modal'));
    this.registrar('ctrl+d', () => this.ejecutarAccion('dashboard'));
    this.registrar('ctrl+p', () => this.ejecutarAccion('imprimir'));
    this.registrar('f1', () => this.ejecutarAccion('ayuda'));
    
    // Navegación
    this.registrar('ctrl+1', () => this.ejecutarAccion('ir_dashboard'));
    this.registrar('ctrl+2', () => this.ejecutarAccion('ir_paquetes'));
    this.registrar('ctrl+3', () => this.ejecutarAccion('ir_usuarios'));
    this.registrar('ctrl+4', () => this.ejecutarAccion('ir_reportes'));
  }
  
  registrar(combinacion, accion) {
    this.atajos.set(combinacion, accion);
  }
  
  obtenerCombinacion(evento) {
    const partes = [];
    if (evento.ctrlKey) partes.push('ctrl');
    if (evento.altKey) partes.push('alt');
    if (evento.shiftKey) partes.push('shift');
    partes.push(evento.key.toLowerCase());
    return partes.join('+');
  }
  
  ejecutarAccion(accion) {
    const acciones = {
      'nuevo_paquete': () => {
        if (typeof formPaquete === 'function') formPaquete();
      },
      'buscar': () => {
        const input = document.getElementById('searchInput');
        if (input) input.focus();
      },
      'guardar': () => {
        const formActivo = document.querySelector('form:not([style*="display: none"])');
        if (formActivo) formActivo.dispatchEvent(new Event('submit'));
      },
      'cerrar_modal': () => {
        const modal = document.querySelector('.modal.show');
        if (modal) {
          const btnCerrar = modal.querySelector('.btn-close');
          if (btnCerrar) btnCerrar.click();
        }
      },
      'dashboard': () => {
        if (typeof mostrarPanelAdmin === 'function') mostrarPanelAdmin();
      },
      'ayuda': () => this.mostrarAyuda()
    };
    
    if (acciones[accion]) {
      acciones[accion]();
    }
  }
  
  mostrarNotificacionAtajo(combinacion) {
    const notif = document.createElement('div');
    notif.className = 'atajo-notification';
    notif.textContent = `Atajo: ${combinacion}`;
    notif.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #007bff;
      color: white;
      padding: 8px 12px;
      border-radius: 4px;
      font-size: 12px;
      z-index: 10000;
      animation: fadeInOut 2s ease-in-out;
    `;
    
    document.body.appendChild(notif);
    setTimeout(() => notif.remove(), 2000);
  }
  
  mostrarAyuda() {
    const ayuda = `
    📋 ATAJOS DE TECLADO DISPONIBLES:
    
    🆕 Ctrl + N: Nuevo paquete
    🔍 Ctrl + F: Buscar
    💾 Ctrl + S: Guardar
    ❌ Escape: Cerrar modal
    📊 Ctrl + D: Dashboard
    🖨️ Ctrl + P: Imprimir
    ❓ F1: Esta ayuda
    
    📍 NAVEGACIÓN:
    Ctrl + 1: Dashboard
    Ctrl + 2: Paquetes
    Ctrl + 3: Usuarios
    Ctrl + 4: Reportes
    `;
    
    alert(ayuda);
  }
}

// 3. SISTEMA DE MODO OFFLINE
class ModoOffline {
  constructor() {
    this.activo = false;
    this.datosPendientes = [];
    this.ultimaSincronizacion = null;
    this.inicializar();
  }
  
  inicializar() {
    // Detectar estado de conexión
    window.addEventListener('online', () => this.irOnline());
    window.addEventListener('offline', () => this.irOffline());
    
    // Verificar estado inicial
    if (!navigator.onLine) {
      this.irOffline();
    }
  }
  
  irOffline() {
    this.activo = true;
    this.mostrarNotificacionOffline();
    this.configurarModoOffline();
  }
  
  irOnline() {
    if (this.activo) {
      this.activo = false;
      this.mostrarNotificacionOnline();
      this.sincronizarDatos();
    }
  }
  
  mostrarNotificacionOffline() {
    notificar('📡 Modo offline activado. Los cambios se sincronizarán automáticamente al reconectar.', 'warning');
  }
  
  mostrarNotificacionOnline() {
    notificar('📡 Conexión restaurada. Sincronizando datos...', 'info');
  }
  
  configurarModoOffline() {
    // Interceptar llamadas a la API para guardarlas localmente
    const originalFetch = window.fetch;
    
    window.fetch = async (url, options = {}) => {
      if (this.activo && url.includes('/api/')) {
        this.guardarOperacionPendiente(url, options);
        return Promise.resolve(new Response(JSON.stringify({mensaje: 'Guardado offline'})));
      }
      
      return originalFetch(url, options);
    };
  }
  
  guardarOperacionPendiente(url, options) {
    const operacion = {
      id: Date.now(),
      url,
      method: options.method || 'GET',
      body: options.body,
      headers: options.headers,
      timestamp: new Date().toISOString()
    };
    
    this.datosPendientes.push(operacion);
    localStorage.setItem('operaciones_pendientes', JSON.stringify(this.datosPendientes));
    
    notificar(`Operación guardada para sincronizar: ${options.method} ${url.split('/').pop()}`, 'info');
  }
  
  async sincronizarDatos() {
    const operacionesPendientes = JSON.parse(localStorage.getItem('operaciones_pendientes') || '[]');
    
    if (operacionesPendientes.length === 0) {
      notificar('✅ No hay datos pendientes de sincronizar', 'success');
      return;
    }
    
    let exitosas = 0;
    let fallidas = 0;
    
    for (const operacion of operacionesPendientes) {
      try {
        const response = await fetch(operacion.url, {
          method: operacion.method,
          headers: operacion.headers,
          body: operacion.body
        });
        
        if (response.ok) {
          exitosas++;
        } else {
          fallidas++;
        }
      } catch (error) {
        fallidas++;
        console.error('Error sincronizando:', error);
      }
    }
    
    // Limpiar operaciones sincronizadas
    this.datosPendientes = [];
    localStorage.removeItem('operaciones_pendientes');
    this.ultimaSincronizacion = new Date();
    
    notificar(`✅ Sincronización completa: ${exitosas} exitosas, ${fallidas} fallidas`, 
              fallidas === 0 ? 'success' : 'warning');
  }
}

// 4. SISTEMA DE TEMAS PERSONALIZABLES
class SistemaTemas {
  constructor() {
    this.temaActual = localStorage.getItem('tema') || 'claro';
    this.temas = {
      claro: {
        '--primary': '#e84545',
        '--secondary': '#903749',
        '--background': '#ffffff',
        '--surface': '#f8f9fa',
        '--text': '#212529',
        '--border': '#dee2e6'
      },
      oscuro: {
        '--primary': '#ff6b6b',
        '--secondary': '#51cf66',
        '--background': '#121212',
        '--surface': '#1e1e1e',
        '--text': '#ffffff',
        '--border': '#333333'
      },
      azul: {
        '--primary': '#0066cc',
        '--secondary': '#004499',
        '--background': '#f0f8ff',
        '--surface': '#e6f3ff',
        '--text': '#003366',
        '--border': '#b3d9ff'
      },
      verde: {
        '--primary': '#28a745',
        '--secondary': '#20c997',
        '--background': '#f8fff8',
        '--surface': '#e8f5e8',
        '--text': '#155724',
        '--border': '#c3e6cb'
      }
    };
    
    this.aplicarTema(this.temaActual);
  }
  
  aplicarTema(nombreTema) {
    const tema = this.temas[nombreTema];
    if (!tema) return;
    
    const root = document.documentElement;
    Object.entries(tema).forEach(([propiedad, valor]) => {
      root.style.setProperty(propiedad, valor);
    });
    
    this.temaActual = nombreTema;
    localStorage.setItem('tema', nombreTema);
    
    // Aplicar clase al body para estilos específicos
    document.body.className = document.body.className.replace(/tema-\w+/g, '');
    document.body.classList.add(`tema-${nombreTema}`);
  }
  
  obtenerTemas() {
    return Object.keys(this.temas);
  }
  
  crearSelectorTemas() {
    const selector = document.createElement('select');
    selector.className = 'form-select form-select-sm';
    selector.id = 'selectorTema';
    
    this.obtenerTemas().forEach(tema => {
      const option = document.createElement('option');
      option.value = tema;
      option.textContent = tema.charAt(0).toUpperCase() + tema.slice(1);
      option.selected = tema === this.temaActual;
      selector.appendChild(option);
    });
    
    selector.addEventListener('change', (e) => {
      this.aplicarTema(e.target.value);
    });
    
    return selector;
  }
}

// Instancias globales
const busquedaInteligente = new BusquedaInteligente();
const sistemaAtajos = new SistemaAtajos();
const modoOffline = new ModoOffline();
const sistemaTemas = new SistemaTemas();

// Agregar CSS para animaciones
const estilos = `
@keyframes fadeInOut {
  0%, 100% { opacity: 0; transform: translateY(-10px); }
  20%, 80% { opacity: 1; transform: translateY(0); }
}

.tema-oscuro {
  background: #121212 !important;
  color: #ffffff !important;
}

.tema-oscuro .card {
  background: #1e1e1e !important;
  border-color: #333333 !important;
}

.tema-oscuro .form-control {
  background: #2a2a2a !important;
  border-color: #444444 !important;
  color: #ffffff !important;
}
`;

const styleSheet = document.createElement('style');
styleSheet.textContent = estilos;
document.head.appendChild(styleSheet);

// EJEMPLO DE USO:
/*
// Búsqueda inteligente
const resultados = busquedaInteligente.buscar('lima pendiente', paquetes);

// Cambiar tema
sistemaTemas.aplicarTema('oscuro');

// Los atajos y modo offline se activan automáticamente
*/


