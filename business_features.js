// ========================================
// FUNCIONALIDADES DE NEGOCIO AVANZADAS
// ========================================

// 1. SISTEMA DE TARIFAS DINÁMICAS
class SistemaTarifas {
  constructor() {
    this.tarifasBase = {
      'Lima': { normal: 15, express: 25, urgente: 40 },
      'Arequipa': { normal: 20, express: 35, urgente: 55 },
      'Cusco': { normal: 25, express: 40, urgente: 65 },
      'Piura': { normal: 22, express: 38, urgente: 60 }
      // ... todos los departamentos
    };
    
    this.multiplicadores = {
      peso: {
        '0-1kg': 1.0,
        '1-5kg': 1.2,
        '5-10kg': 1.5,
        '10-20kg': 2.0,
        '20kg+': 3.0
      },
      fragil: 1.3,
      seguro: 1.15,
      feriado: 1.25,
      temporadaAlta: 1.2
    };
  }
  
  calcularTarifa(destino, tipoServicio, peso, opciones = {}) {
    let tarifaBase = this.tarifasBase[destino]?.[tipoServicio] || 30;
    
    // Aplicar multiplicador por peso
    const rangoPeso = this.obtenerRangoPeso(peso);
    tarifaBase *= this.multiplicadores.peso[rangoPeso];
    
    // Aplicar opciones adicionales
    if (opciones.fragil) tarifaBase *= this.multiplicadores.fragil;
    if (opciones.seguro) tarifaBase *= this.multiplicadores.seguro;
    if (opciones.esFeriado) tarifaBase *= this.multiplicadores.feriado;
    
    return Math.round(tarifaBase * 100) / 100;
  }
  
  obtenerRangoPeso(peso) {
    if (peso <= 1) return '0-1kg';
    if (peso <= 5) return '1-5kg';
    if (peso <= 10) return '5-10kg';
    if (peso <= 20) return '10-20kg';
    return '20kg+';
  }
}

// 2. SISTEMA DE TRACKING GPS
class SistemaTrackingGPS {
  constructor() {
    this.ubicaciones = new Map();
    this.rutas = new Map();
  }
  
  actualizarUbicacion(codigoPaquete, lat, lng, timestamp = new Date()) {
    if (!this.ubicaciones.has(codigoPaquete)) {
      this.ubicaciones.set(codigoPaquete, []);
    }
    
    const ubicacion = {
      latitud: lat,
      longitud: lng,
      timestamp: timestamp.toISOString(),
      velocidad: this.calcularVelocidad(codigoPaquete, lat, lng, timestamp)
    };
    
    this.ubicaciones.get(codigoPaquete).push(ubicacion);
    
    // Mantener solo las últimas 100 ubicaciones
    const ubicaciones = this.ubicaciones.get(codigoPaquete);
    if (ubicaciones.length > 100) {
      ubicaciones.splice(0, ubicaciones.length - 100);
    }
    
    return ubicacion;
  }
  
  calcularVelocidad(codigoPaquete, lat, lng, timestamp) {
    const ubicaciones = this.ubicaciones.get(codigoPaquete);
    if (!ubicaciones || ubicaciones.length === 0) return 0;
    
    const ultimaUbicacion = ubicaciones[ubicaciones.length - 1];
    const distancia = this.calcularDistancia(
      ultimaUbicacion.latitud, ultimaUbicacion.longitud,
      lat, lng
    );
    
    const tiempoDiff = (timestamp - new Date(ultimaUbicacion.timestamp)) / 1000 / 3600; // horas
    return tiempoDiff > 0 ? distancia / tiempoDiff : 0; // km/h
  }
  
  calcularDistancia(lat1, lng1, lat2, lng2) {
    const R = 6371; // Radio de la Tierra en km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }
  
  obtenerUbicacionActual(codigoPaquete) {
    const ubicaciones = this.ubicaciones.get(codigoPaquete);
    return ubicaciones && ubicaciones.length > 0 ? 
           ubicaciones[ubicaciones.length - 1] : null;
  }
  
  generarRuta(codigoPaquete) {
    const ubicaciones = this.ubicaciones.get(codigoPaquete) || [];
    return ubicaciones.map(u => [u.latitud, u.longitud]);
  }
}

// 3. SISTEMA DE NOTIFICACIONES AUTOMÁTICAS
class SistemaNotificaciones {
  constructor() {
    this.canales = ['email', 'sms', 'push', 'whatsapp'];
    this.plantillas = {
      'paquete_creado': {
        titulo: 'Paquete Registrado',
        mensaje: 'Tu paquete {codigo} ha sido registrado exitosamente. Seguimiento disponible en: {link}'
      },
      'en_transito': {
        titulo: 'Paquete en Tránsito',
        mensaje: 'Tu paquete {codigo} está en camino a {destino}. ETA: {eta}'
      },
      'entregado': {
        titulo: 'Paquete Entregado',
        mensaje: 'Tu paquete {codigo} ha sido entregado exitosamente a {destinatario}'
      },
      'retraso': {
        titulo: 'Retraso en Entrega',
        mensaje: 'Tu paquete {codigo} presenta un retraso. Nueva fecha estimada: {nueva_fecha}'
      }
    };
  }
  
  enviarNotificacion(tipo, datos, canales = ['email']) {
    const plantilla = this.plantillas[tipo];
    if (!plantilla) throw new Error(`Tipo de notificación desconocido: ${tipo}`);
    
    const mensaje = this.procesarPlantilla(plantilla.mensaje, datos);
    const titulo = this.procesarPlantilla(plantilla.titulo, datos);
    
    canales.forEach(canal => {
      this.enviarPorCanal(canal, titulo, mensaje, datos);
    });
    
    // Registrar notificación enviada
    this.registrarEnvio(tipo, datos, canales, titulo, mensaje);
  }
  
  procesarPlantilla(plantilla, datos) {
    return plantilla.replace(/\{(\w+)\}/g, (match, key) => datos[key] || match);
  }
  
  enviarPorCanal(canal, titulo, mensaje, datos) {
    switch (canal) {
      case 'email':
        this.enviarEmail(datos.email, titulo, mensaje);
        break;
      case 'sms':
        this.enviarSMS(datos.telefono, mensaje);
        break;
      case 'push':
        this.enviarPush(titulo, mensaje);
        break;
      case 'whatsapp':
        this.enviarWhatsApp(datos.telefono, mensaje);
        break;
    }
  }
  
  enviarEmail(email, titulo, mensaje) {
    // Simulación - en producción usar servicio real
    console.log(`📧 Email a ${email}: ${titulo} - ${mensaje}`);
    // fetch('/api/enviar-email', { method: 'POST', body: JSON.stringify({email, titulo, mensaje}) });
  }
  
  enviarSMS(telefono, mensaje) {
    console.log(`📱 SMS a ${telefono}: ${mensaje}`);
    // Integración con servicio SMS real
  }
  
  enviarPush(titulo, mensaje) {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(titulo, { body: mensaje, icon: '/logo.png' });
    }
  }
  
  enviarWhatsApp(telefono, mensaje) {
    console.log(`💬 WhatsApp a ${telefono}: ${mensaje}`);
    // Integración con WhatsApp Business API
  }
  
  registrarEnvio(tipo, datos, canales, titulo, mensaje) {
    const registro = {
      timestamp: new Date().toISOString(),
      tipo,
      destinatario: datos.email || datos.telefono,
      canales,
      titulo,
      mensaje,
      estado: 'enviado'
    };
    
    const envios = JSON.parse(localStorage.getItem('notificaciones_enviadas') || '[]');
    envios.push(registro);
    localStorage.setItem('notificaciones_enviadas', JSON.stringify(envios));
  }
}

// 4. SISTEMA DE REPORTES AVANZADOS
class SistemaReportes {
  constructor() {
    this.tiposReporte = [
      'ventas_diarias',
      'paquetes_por_estado',
      'rutas_mas_utilizadas',
      'clientes_frecuentes',
      'ingresos_mensuales',
      'tiempo_entrega_promedio'
    ];
  }
  
  generarReporte(tipo, fechaInicio, fechaFin, filtros = {}) {
    const datos = this.obtenerDatos(fechaInicio, fechaFin, filtros);
    
    switch (tipo) {
      case 'ventas_diarias':
        return this.reporteVentasDiarias(datos);
      case 'paquetes_por_estado':
        return this.reportePaquetesPorEstado(datos);
      case 'rutas_mas_utilizadas':
        return this.reporteRutasPopulares(datos);
      case 'clientes_frecuentes':
        return this.reporteClientesFrecuentes(datos);
      case 'ingresos_mensuales':
        return this.reporteIngresosMensuales(datos);
      case 'tiempo_entrega_promedio':
        return this.reporteTiempoEntrega(datos);
      default:
        throw new Error(`Tipo de reporte no válido: ${tipo}`);
    }
  }
  
  obtenerDatos(fechaInicio, fechaFin, filtros) {
    // Obtener datos de paquetes, transacciones, etc.
    const paquetes = JSON.parse(localStorage.getItem('paquetes') || '[]');
    const transacciones = JSON.parse(localStorage.getItem('transacciones') || '[]');
    
    return {
      paquetes: paquetes.filter(p => this.estaEnRango(p.fecha, fechaInicio, fechaFin)),
      transacciones: transacciones.filter(t => this.estaEnRango(t.fecha, fechaInicio, fechaFin))
    };
  }
  
  estaEnRango(fecha, inicio, fin) {
    const fechaObj = new Date(fecha);
    return fechaObj >= new Date(inicio) && fechaObj <= new Date(fin);
  }
  
  reporteVentasDiarias(datos) {
    const ventasPorDia = {};
    
    datos.transacciones.forEach(t => {
      const fecha = t.fecha.split('T')[0];
      ventasPorDia[fecha] = (ventasPorDia[fecha] || 0) + t.monto;
    });
    
    return {
      titulo: 'Ventas Diarias',
      datos: Object.entries(ventasPorDia).map(([fecha, monto]) => ({
        fecha,
        monto: parseFloat(monto),
        paquetes: datos.paquetes.filter(p => p.fecha.startsWith(fecha)).length
      })),
      resumen: {
        total: Object.values(ventasPorDia).reduce((a, b) => a + b, 0),
        promedio: Object.values(ventasPorDia).reduce((a, b) => a + b, 0) / Object.keys(ventasPorDia).length
      }
    };
  }
  
  reportePaquetesPorEstado(datos) {
    const contadores = {};
    
    datos.paquetes.forEach(p => {
      contadores[p.estado] = (contadores[p.estado] || 0) + 1;
    });
    
    return {
      titulo: 'Paquetes por Estado',
      datos: Object.entries(contadores).map(([estado, cantidad]) => ({
        estado,
        cantidad,
        porcentaje: (cantidad / datos.paquetes.length * 100).toFixed(2)
      })),
      total: datos.paquetes.length
    };
  }
  
  exportarAPDF(reporte) {
    // Generar PDF del reporte (requiere librería como jsPDF)
    console.log('Generando PDF:', reporte.titulo);
    // Implementación de exportación a PDF
  }
  
  exportarAExcel(reporte) {
    // Generar Excel del reporte (usando SheetJS)
    console.log('Generando Excel:', reporte.titulo);
    // Implementación de exportación a Excel
  }
}

// Instancias globales
const sistemaTarifas = new SistemaTarifas();
const trackingGPS = new SistemaTrackingGPS();
const notificaciones = new SistemaNotificaciones();
const reportes = new SistemaReportes();

// EJEMPLO DE USO:
/*
// Calcular tarifa
const costo = sistemaTarifas.calcularTarifa('Lima', 'express', 3.5, { fragil: true });

// Actualizar ubicación GPS
trackingGPS.actualizarUbicacion('2025ABC1', -12.0464, -77.0428);

// Enviar notificación
notificaciones.enviarNotificacion('paquete_creado', {
  codigo: '2025ABC1',
  email: 'cliente@email.com',
  link: 'https://tracking.com/2025ABC1'
}, ['email', 'sms']);

// Generar reporte
const reporte = reportes.generarReporte('ventas_diarias', '2025-01-01', '2025-01-31');
*/


