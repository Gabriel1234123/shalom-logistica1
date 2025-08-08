// ========================================
// MEJORAS DE SEGURIDAD Y RESTRICCIONES
// Sistema de Logística Shalom
// ========================================

// 1. RESTRICCIONES POR ROL
const RESTRICCIONES_POR_ROL = {
  Admin: {
    puedeEditarCodigo: false, // CAMBIADO: Nadie puede editar código
    puedeEditarEstado: true,
    puedeEliminarPaquetes: true,
    puedeVerTodosLosPaquetes: true,
    puedeEditarUsuarios: true,
    limiteTiempoEdicion: null // Sin límite
  },
  Empleado: {
    puedeEditarCodigo: false,
    puedeEditarEstado: true,
    puedeEliminarPaquetes: false,
    puedeVerTodosLosPaquetes: true,
    puedeEditarUsuarios: false,
    limiteTiempoEdicion: null // Sin límite
  },
  Cliente: {
    puedeEditarCodigo: false,
    puedeEditarEstado: false,
    puedeEliminarPaquetes: false,
    puedeVerTodosLosPaquetes: false,
    puedeEditarUsuarios: false,
    limiteTiempoEdicion: 24 // 24 horas
  },
  Transportista: {
    puedeEditarCodigo: false,
    puedeEditarEstado: true, // Solo para sus entregas
    puedeEliminarPaquetes: false,
    puedeVerTodosLosPaquetes: false,
    puedeEditarUsuarios: false,
    limiteTiempoEdicion: null
  }
};

// 2. VALIDACIONES DE CAMPOS ESPECÍFICAS
const VALIDACIONES_CAMPOS = {
  codigo: {
    pattern: /^2025[A-Z0-9]{4}$/,
    message: "El código debe tener formato 2025XXXX",
    immutable: true, // ABSOLUTAMENTE INMUTABLE
    immutableForAdmin: true, // NI SIQUIERA EL ADMIN PUEDE CAMBIAR
    securityLevel: "CRÍTICO" // Nivel de seguridad máximo
  },
  dni: {
    pattern: /^[0-9]{8}$/,
    message: "El DNI debe tener exactamente 8 dígitos",
    immutableForClient: true
  },
  telefono: {
    pattern: /^9[0-9]{8}$/,
    message: "El teléfono debe comenzar con 9 y tener 9 dígitos"
  },
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: "Ingrese un email válido"
  },
  monto: {
    min: 1,
    max: 10000,
    message: "El monto debe estar entre S/1 y S/10,000"
  }
};

// 3. REGLAS DE NEGOCIO
const REGLAS_NEGOCIO = {
  // Estados permitidos según rol
  transicionesEstado: {
    Admin: ['Pendiente', 'En tránsito', 'Entregado', 'Incidencia', 'Cancelado'],
    Empleado: ['Pendiente', 'En tránsito', 'Entregado', 'Incidencia'],
    Transportista: ['En tránsito', 'Entregado', 'Incidencia'],
    Cliente: [] // No puede cambiar estados
  },
  
  // Límites de tiempo
  limitesEdicion: {
    cliente: 24 * 60 * 60 * 1000, // 24 horas en milisegundos
    empleado: null, // Sin límite
    admin: null // Sin límite
  },
  
  // Campos bloqueados después de ciertos estados
  camposBloqueados: {
    'Entregado': ['codigo', 'destinatario', 'ciudad', 'fecha', 'monto'],
    'Cancelado': ['codigo', 'destinatario', 'ciudad', 'fecha', 'monto', 'estado']
  }
};

// 4. SISTEMA DE AUDITORÍA
function registrarAccion(usuario, accion, detalles) {
  const entrada = {
    timestamp: new Date().toISOString(),
    usuario: usuario,
    rol: usuarioActivo.rol,
    accion: accion,
    detalles: detalles,
    ip: 'localhost' // En producción obtener IP real
  };
  
  let auditoria = JSON.parse(localStorage.getItem('auditoria')) || [];
  auditoria.push(entrada);
  
  // Mantener solo los últimos 1000 registros
  if (auditoria.length > 1000) {
    auditoria = auditoria.slice(-1000);
  }
  
  localStorage.setItem('auditoria', JSON.stringify(auditoria));
}

// 5. VALIDADOR AVANZADO
function validarPermisos(usuario, accion, objeto) {
  const rol = usuario.rol;
  const restricciones = RESTRICCIONES_POR_ROL[rol];
  
  switch (accion) {
    case 'editar_codigo':
      return restricciones.puedeEditarCodigo;
    
    case 'cambiar_estado':
      return restricciones.puedeEditarEstado;
    
    case 'eliminar_paquete':
      return restricciones.puedeEliminarPaquetes;
    
    case 'editar_despues_tiempo':
      if (!restricciones.limiteTiempoEdicion) return true;
      const tiempoCreacion = new Date(objeto.fecha).getTime();
      const ahora = new Date().getTime();
      const diferencia = ahora - tiempoCreacion;
      return diferencia <= (restricciones.limiteTiempoEdicion * 60 * 60 * 1000);
    
    default:
      return false;
  }
}

// 6. FUNCIÓN PARA APLICAR RESTRICCIONES EN FORMULARIOS
function aplicarRestriccionesFormulario(formulario, usuario, paquete = null) {
  const rol = usuario.rol;
  const esEdicion = paquete !== null;
  
  // Código de envío
  const inputCodigo = formulario.querySelector('#pkCodigo');
  if (inputCodigo) {
    if (!validarPermisos(usuario, 'editar_codigo', paquete) && esEdicion) {
      inputCodigo.readonly = true;
      inputCodigo.style.backgroundColor = '#f8f9fa';
      inputCodigo.title = 'Solo administradores pueden modificar el código';
    }
  }
  
  // Estado
  const selectEstado = formulario.querySelector('#pkEstado');
  if (selectEstado && !validarPermisos(usuario, 'cambiar_estado', paquete)) {
    selectEstado.disabled = true;
    selectEstado.title = 'No tienes permisos para cambiar el estado';
  }
  
  // Fecha (restricción de tiempo para clientes)
  const inputFecha = formulario.querySelector('#pkFecha');
  if (inputFecha && rol === 'Cliente' && esEdicion) {
    if (!validarPermisos(usuario, 'editar_despues_tiempo', paquete)) {
      inputFecha.readonly = true;
      inputFecha.style.backgroundColor = '#f8f9fa';
      inputFecha.title = 'No puedes cambiar la fecha después de 24 horas';
    }
  }
}

// 7. MEJORAS ADICIONALES SUGERIDAS
const MEJORAS_SUGERIDAS = {
  seguridad: [
    "Implementar autenticación JWT",
    "Agregar verificación en dos pasos (2FA)",
    "Encriptar datos sensibles",
    "Implementar rate limiting",
    "Agregar captcha para login"
  ],
  
  funcionalidad: [
    "Sistema de notificaciones push",
    "Integración con APIs de tracking GPS",
    "Generación de reportes en PDF",
    "Sistema de calificaciones y comentarios",
    "Chat en tiempo real con soporte"
  ],
  
  ux: [
    "Modo offline con sincronización",
    "Progressive Web App (PWA)",
    "Tema personalizable",
    "Shortcuts de teclado",
    "Filtros avanzados con guardado"
  ],
  
  integraciones: [
    "Integración con Yape/Plin real",
    "Conexión con bancos peruanos",
    "API de SUNAT para validar RUC/DNI",
    "Google Maps para tracking",
    "WhatsApp Business API"
  ]
};

// EJEMPLO DE USO:
/*
// En el formulario de paquetes:
const usuario = usuarioActivo;
const paquete = esEditar ? paquetes[idx] : null;

// Aplicar restricciones
aplicarRestriccionesFormulario(document.getElementById('formPaquete'), usuario, paquete);

// Registrar acción
registrarAccion(usuario.usuario, 'editar_paquete', { codigoPaquete: paquete?.codigo });

// Validar antes de guardar
if (!validarPermisos(usuario, 'editar_codigo', paquete)) {
  notificar('No tienes permisos para modificar el código', 'error');
  return;
}
*/
