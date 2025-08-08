// ========================================
// SISTEMA DE MONITOREO Y ANALÍTICAS
// ========================================

// 1. MONITOREO DE RENDIMIENTO
class MonitoreoRendimiento {
  constructor() {
    this.metricas = new Map();
    this.umbrales = {
      tiempoCargaPagina: 3000, // 3 segundos
      tiempoRespuestaAPI: 2000, // 2 segundos
      usoMemoria: 100 * 1024 * 1024, // 100MB
      errorRate: 0.05 // 5%
    };
    
    this.inicializar();
  }
  
  inicializar() {
    // Monitorear rendimiento de la página
    if ('performance' in window) {
      this.monitorearCargaPagina();
      this.monitorearRespuestasAPI();
      this.monitorearMemoria();
    }
    
    // Monitorear errores JavaScript
    this.monitorearErrores();
    
    // Reportar métricas cada 30 segundos
    setInterval(() => this.reportarMetricas(), 30000);
  }
  
  monitorearCargaPagina() {
    window.addEventListener('load', () => {
      const timing = performance.timing;
      const tiempoCarga = timing.loadEventEnd - timing.navigationStart;
      
      this.registrarMetrica('tiempo_carga_pagina', tiempoCarga);
      
      if (tiempoCarga > this.umbrales.tiempoCargaPagina) {
        this.alertaRendimiento('Página carga lenta', tiempoCarga);
      }
    });
  }
  
  monitorearRespuestasAPI() {
    const originalFetch = window.fetch;
    
    window.fetch = async (...args) => {
      const inicio = performance.now();
      
      try {
        const response = await originalFetch(...args);
        const duracion = performance.now() - inicio;
        
        this.registrarMetrica('tiempo_respuesta_api', duracion);
        this.registrarMetrica('requests_exitosos', 1);
        
        if (duracion > this.umbrales.tiempoRespuestaAPI) {
          this.alertaRendimiento('API respuesta lenta', duracion, args[0]);
        }
        
        return response;
      } catch (error) {
        const duracion = performance.now() - inicio;
        this.registrarMetrica('tiempo_respuesta_api', duracion);
        this.registrarMetrica('requests_fallidos', 1);
        
        throw error;
      }
    };
  }
  
  monitorearMemoria() {
    if ('memory' in performance) {
      setInterval(() => {
        const memoria = performance.memory;
        this.registrarMetrica('uso_memoria', memoria.usedJSHeapSize);
        
        if (memoria.usedJSHeapSize > this.umbrales.usoMemoria) {
          this.alertaRendimiento('Alto uso de memoria', memoria.usedJSHeapSize);
        }
      }, 10000);
    }
  }
  
  monitorearErrores() {
    window.addEventListener('error', (event) => {
      this.registrarError({
        tipo: 'javascript',
        mensaje: event.message,
        archivo: event.filename,
        linea: event.lineno,
        columna: event.colno,
        stack: event.error?.stack
      });
    });
    
    window.addEventListener('unhandledrejection', (event) => {
      this.registrarError({
        tipo: 'promise',
        mensaje: event.reason.toString(),
        stack: event.reason?.stack
      });
    });
  }
  
  registrarMetrica(nombre, valor) {
    const timestamp = Date.now();
    
    if (!this.metricas.has(nombre)) {
      this.metricas.set(nombre, []);
    }
    
    const metrica = this.metricas.get(nombre);
    metrica.push({ timestamp, valor });
    
    // Mantener solo las últimas 1000 mediciones
    if (metrica.length > 1000) {
      metrica.splice(0, metrica.length - 1000);
    }
  }
  
  registrarError(error) {
    const errorLog = {
      timestamp: new Date().toISOString(),
      ...error,
      userAgent: navigator.userAgent,
      url: window.location.href
    };
    
    const errores = JSON.parse(localStorage.getItem('errores_sistema') || '[]');
    errores.push(errorLog);
    
    // Mantener solo los últimos 100 errores
    if (errores.length > 100) {
      errores.splice(0, errores.length - 100);
    }
    
    localStorage.setItem('errores_sistema', JSON.stringify(errores));
    
    // Enviar error al servidor si es crítico
    if (error.tipo === 'javascript') {
      this.enviarErrorAlServidor(errorLog);
    }
  }
  
  alertaRendimiento(tipo, valor, contexto = '') {
    console.warn(`⚠️ Alerta de rendimiento: ${tipo}`, { valor, contexto });
    
    // Notificar al usuario si es muy grave
    if (valor > this.umbrales.tiempoCargaPagina * 2) {
      notificar('El sistema está experimentando lentitud', 'warning');
    }
  }
  
  obtenerEstadisticas(nombre, periodoHoras = 24) {
    const metrica = this.metricas.get(nombre) || [];
    const cutoff = Date.now() - (periodoHoras * 60 * 60 * 1000);
    const datosFiltrados = metrica.filter(m => m.timestamp > cutoff);
    
    if (datosFiltrados.length === 0) return null;
    
    const valores = datosFiltrados.map(m => m.valor);
    
    return {
      count: valores.length,
      min: Math.min(...valores),
      max: Math.max(...valores),
      avg: valores.reduce((a, b) => a + b, 0) / valores.length,
      p95: this.percentil(valores, 95),
      p99: this.percentil(valores, 99)
    };
  }
  
  percentil(valores, percentil) {
    const sorted = [...valores].sort((a, b) => a - b);
    const index = Math.ceil((percentil / 100) * sorted.length) - 1;
    return sorted[index];
  }
  
  enviarErrorAlServidor(error) {
    fetch('/api/errores', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(error)
    }).catch(() => {
      // Si falla el envío, guardar localmente
      console.log('Error almacenado localmente para envío posterior');
    });
  }
  
  reportarMetricas() {
    const reporte = {
      timestamp: new Date().toISOString(),
      metricas: {}
    };
    
    for (const [nombre, _] of this.metricas) {
      reporte.metricas[nombre] = this.obtenerEstadisticas(nombre, 1); // Última hora
    }
    
    console.log('📊 Reporte de métricas:', reporte);
    
    // Enviar al servidor
    this.enviarMetricasAlServidor(reporte);
  }
  
  enviarMetricasAlServidor(reporte) {
    fetch('/api/metricas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reporte)
    }).catch(() => {
      console.log('Métricas almacenadas localmente');
    });
  }
}

// 2. ANALÍTICAS DE NEGOCIO
class AnaliticasNegocio {
  constructor() {
    this.eventos = [];
    this.sesionActual = {
      id: this.generarIdSesion(),
      inicio: Date.now(),
      eventos: []
    };
  }
  
  // Rastrear eventos de usuario
  rastrearEvento(categoria, accion, etiqueta = '', valor = 0) {
    const evento = {
      timestamp: Date.now(),
      sesionId: this.sesionActual.id,
      categoria,
      accion,
      etiqueta,
      valor,
      url: window.location.pathname,
      userAgent: navigator.userAgent
    };
    
    this.eventos.push(evento);
    this.sesionActual.eventos.push(evento);
    
    // Almacenar localmente
    this.guardarEventosLocalmente();
    
    // Enviar al servidor
    this.enviarEventoAlServidor(evento);
  }
  
  // Eventos específicos del negocio
  rastrearCreacionPaquete(codigoPaquete, tipoServicio, monto) {
    this.rastrearEvento('paquete', 'crear', codigoPaquete, monto);
    this.rastrearEvento('servicio', 'utilizar', tipoServicio, monto);
  }
  
  rastrearBusqueda(termino, resultados) {
    this.rastrearEvento('busqueda', 'realizar', termino, resultados);
  }
  
  rastrearPago(metodo, monto, exito) {
    this.rastrearEvento('pago', exito ? 'exitoso' : 'fallido', metodo, monto);
  }
  
  rastrearLogin(usuario, exito) {
    this.rastrearEvento('auth', exito ? 'login_exitoso' : 'login_fallido', usuario);
  }
  
  rastrearNavegacion(seccion) {
    this.rastrearEvento('navegacion', 'visitar', seccion);
  }
  
  rastrearTiempoEnPagina(seccion, tiempoSegundos) {
    this.rastrearEvento('engagement', 'tiempo_en_pagina', seccion, tiempoSegundos);
  }
  
  // Generar reportes de analíticas
  generarReporteUsuarios(fechaInicio, fechaFin) {
    const eventos = this.filtrarEventosPorFecha(fechaInicio, fechaFin);
    const sesiones = [...new Set(eventos.map(e => e.sesionId))];
    
    const usuarios = this.contarUsuariosUnicos(eventos);
    const paginasVistas = eventos.filter(e => e.categoria === 'navegacion').length;
    const tiempoPromedioSesion = this.calcularTiempoPromedioSesion(eventos);
    
    return {
      periodo: { inicio: fechaInicio, fin: fechaFin },
      usuarios_unicos: usuarios,
      sesiones_total: sesiones.length,
      paginas_vistas: paginasVistas,
      tiempo_promedio_sesion: tiempoPromedioSesion,
      tasa_rebote: this.calcularTasaRebote(eventos)
    };
  }
  
  generarReporteConversiones(fechaInicio, fechaFin) {
    const eventos = this.filtrarEventosPorFecha(fechaInicio, fechaFin);
    
    const paquetesCreados = eventos.filter(e => 
      e.categoria === 'paquete' && e.accion === 'crear'
    ).length;
    
    const pagosExitosos = eventos.filter(e => 
      e.categoria === 'pago' && e.accion === 'exitoso'
    ).length;
    
    const visitasTotal = eventos.filter(e => 
      e.categoria === 'navegacion'
    ).length;
    
    return {
      tasa_conversion_paquetes: (paquetesCreados / visitasTotal * 100).toFixed(2),
      tasa_conversion_pagos: (pagosExitosos / paquetesCreados * 100).toFixed(2),
      paquetes_creados: paquetesCreados,
      pagos_exitosos: pagosExitosos,
      ingresos_total: eventos
        .filter(e => e.categoria === 'pago' && e.accion === 'exitoso')
        .reduce((total, e) => total + e.valor, 0)
    };
  }
  
  generarReporteComportamiento(fechaInicio, fechaFin) {
    const eventos = this.filtrarEventosPorFecha(fechaInicio, fechaFin);
    
    const paginasPopulares = this.contarPorEtiqueta(
      eventos.filter(e => e.categoria === 'navegacion'),
      'etiqueta'
    );
    
    const terminosBusquedaPopulares = this.contarPorEtiqueta(
      eventos.filter(e => e.categoria === 'busqueda'),
      'etiqueta'
    );
    
    const metodospagoPreferidos = this.contarPorEtiqueta(
      eventos.filter(e => e.categoria === 'pago'),
      'etiqueta'
    );
    
    return {
      paginas_populares: paginasPopulares,
      busquedas_populares: terminosBusquedaPopulares,
      metodos_pago_preferidos: metodospagoPreferidos
    };
  }
  
  // Métodos auxiliares
  filtrarEventosPorFecha(inicio, fin) {
    const inicioMs = new Date(inicio).getTime();
    const finMs = new Date(fin).getTime();
    
    return this.eventos.filter(e => 
      e.timestamp >= inicioMs && e.timestamp <= finMs
    );
  }
  
  contarUsuariosUnicos(eventos) {
    const sesiones = [...new Set(eventos.map(e => e.sesionId))];
    return sesiones.length;
  }
  
  calcularTiempoPromedioSesion(eventos) {
    const sesionesPorId = {};
    
    eventos.forEach(e => {
      if (!sesionesPorId[e.sesionId]) {
        sesionesPorId[e.sesionId] = { inicio: e.timestamp, fin: e.timestamp };
      } else {
        sesionesPorId[e.sesionId].fin = Math.max(
          sesionesPorId[e.sesionId].fin, 
          e.timestamp
        );
      }
    });
    
    const duraciones = Object.values(sesionesPorId).map(s => s.fin - s.inicio);
    return duraciones.reduce((a, b) => a + b, 0) / duraciones.length / 1000; // en segundos
  }
  
  calcularTasaRebote(eventos) {
    const sesionesPorId = {};
    
    eventos.forEach(e => {
      if (!sesionesPorId[e.sesionId]) {
        sesionesPorId[e.sesionId] = 0;
      }
      if (e.categoria === 'navegacion') {
        sesionesPorId[e.sesionId]++;
      }
    });
    
    const sesionesConUnaVista = Object.values(sesionesPorId).filter(v => v === 1).length;
    const totalSesiones = Object.keys(sesionesPorId).length;
    
    return (sesionesConUnaVista / totalSesiones * 100).toFixed(2);
  }
  
  contarPorEtiqueta(eventos, campo) {
    const contadores = {};
    
    eventos.forEach(e => {
      const valor = e[campo];
      contadores[valor] = (contadores[valor] || 0) + 1;
    });
    
    return Object.entries(contadores)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10); // Top 10
  }
  
  generarIdSesion() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
  
  guardarEventosLocalmente() {
    localStorage.setItem('eventos_analiticas', JSON.stringify(this.eventos.slice(-1000))); // Últimos 1000
  }
  
  enviarEventoAlServidor(evento) {
    fetch('/api/analiticas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(evento)
    }).catch(() => {
      console.log('Evento analítico almacenado localmente');
    });
  }
}

// 3. DASHBOARD DE MÉTRICAS EN TIEMPO REAL
class DashboardMetricas {
  constructor() {
    this.contenedorId = 'dashboard-metricas';
    this.actualizacionInterval = null;
  }
  
  crear() {
    const html = `
      <div id="${this.contenedorId}" class="dashboard-metricas">
        <div class="row">
          <div class="col-md-3">
            <div class="metric-card">
              <h6>Usuarios Activos</h6>
              <div class="metric-value" id="usuarios-activos">0</div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="metric-card">
              <h6>Paquetes Hoy</h6>
              <div class="metric-value" id="paquetes-hoy">0</div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="metric-card">
              <h6>Ingresos Hoy</h6>
              <div class="metric-value" id="ingresos-hoy">S/ 0</div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="metric-card">
              <h6>Tiempo Respuesta</h6>
              <div class="metric-value" id="tiempo-respuesta">0ms</div>
            </div>
          </div>
        </div>
        
        <div class="row mt-3">
          <div class="col-md-6">
            <canvas id="grafico-tiempo-real" width="400" height="200"></canvas>
          </div>
          <div class="col-md-6">
            <div class="logs-tiempo-real" id="logs-tiempo-real">
              <h6>Actividad Reciente</h6>
              <div class="logs-container"></div>
            </div>
          </div>
        </div>
      </div>
    `;
    
    return html;
  }
  
  inicializar() {
    this.actualizarMetricas();
    this.actualizacionInterval = setInterval(() => {
      this.actualizarMetricas();
    }, 5000); // Actualizar cada 5 segundos
  }
  
  destruir() {
    if (this.actualizacionInterval) {
      clearInterval(this.actualizacionInterval);
    }
  }
  
  actualizarMetricas() {
    // Simular métricas en tiempo real
    const usuariosActivos = Math.floor(Math.random() * 50) + 1;
    const paquetesHoy = Math.floor(Math.random() * 100) + 10;
    const ingresosHoy = (Math.random() * 5000 + 500).toFixed(2);
    const tiempoRespuesta = Math.floor(Math.random() * 500) + 100;
    
    this.actualizarElemento('usuarios-activos', usuariosActivos);
    this.actualizarElemento('paquetes-hoy', paquetesHoy);
    this.actualizarElemento('ingresos-hoy', `S/ ${ingresosHoy}`);
    this.actualizarElemento('tiempo-respuesta', `${tiempoRespuesta}ms`);
    
    this.agregarLogActividad(`${new Date().toLocaleTimeString()} - Usuario creó paquete 2025${Math.random().toString(36).substr(2, 4).toUpperCase()}`);
  }
  
  actualizarElemento(id, valor) {
    const elemento = document.getElementById(id);
    if (elemento) {
      elemento.textContent = valor;
      elemento.classList.add('actualizado');
      setTimeout(() => elemento.classList.remove('actualizado'), 300);
    }
  }
  
  agregarLogActividad(mensaje) {
    const container = document.querySelector('#logs-tiempo-real .logs-container');
    if (container) {
      const log = document.createElement('div');
      log.className = 'log-entry';
      log.textContent = mensaje;
      
      container.insertBefore(log, container.firstChild);
      
      // Mantener solo los últimos 10 logs
      while (container.children.length > 10) {
        container.removeChild(container.lastChild);
      }
    }
  }
}

// CSS para el dashboard
const estilosDashboard = `
.dashboard-metricas .metric-card {
  background: white;
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  text-align: center;
}

.dashboard-metricas .metric-value {
  font-size: 24px;
  font-weight: bold;
  color: #e84545;
  margin-top: 5px;
}

.dashboard-metricas .metric-value.actualizado {
  animation: pulso 0.3s ease-in-out;
}

.logs-tiempo-real {
  background: white;
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  height: 200px;
  overflow: hidden;
}

.logs-container {
  height: 150px;
  overflow-y: auto;
  font-size: 12px;
}

.log-entry {
  padding: 2px 0;
  border-bottom: 1px solid #eee;
  animation: slideIn 0.3s ease-in-out;
}

@keyframes pulso {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

@keyframes slideIn {
  from { opacity: 0; transform: translateX(-20px); }
  to { opacity: 1; transform: translateX(0); }
}
`;

// Agregar estilos al documento
const styleSheet2 = document.createElement('style');
styleSheet2.textContent = estilosDashboard;
document.head.appendChild(styleSheet2);

// Instancias globales
const monitoreoRendimiento = new MonitoreoRendimiento();
const analiticasNegocio = new AnaliticasNegocio();
const dashboardMetricas = new DashboardMetricas();

// EJEMPLO DE USO:
/*
// Rastrear eventos
analiticasNegocio.rastrearCreacionPaquete('2025ABC1', 'express', 45.50);
analiticasNegocio.rastrearBusqueda('lima pendiente', 5);
analiticasNegocio.rastrearPago('yape', 45.50, true);

// Generar reportes
const reporteUsuarios = analiticasNegocio.generarReporteUsuarios('2025-01-01', '2025-01-31');
const reporteConversiones = analiticasNegocio.generarReporteConversiones('2025-01-01', '2025-01-31');

// Mostrar dashboard
document.getElementById('dashboard-container').innerHTML = dashboardMetricas.crear();
dashboardMetricas.inicializar();
*/


