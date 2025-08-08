// ========================================
// SISTEMA DE SEGURIDAD AVANZADA
// ========================================

// 1. VALIDACIÓN DE CONTRASEÑAS ROBUSTAS
function validarPasswordRobusta(password) {
  const criterios = {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumbers: /\d/.test(password),
    hasSymbols: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
  };
  
  const cumplidos = Object.values(criterios).filter(Boolean).length;
  
  return {
    esValida: cumplidos >= 4,
    puntuacion: cumplidos,
    criterios: criterios,
    mensaje: cumplidos >= 4 ? 'Contraseña segura' : 'Contraseña débil'
  };
}

// 2. SISTEMA DE INTENTOS DE LOGIN
class SistemaSeguridad {
  constructor() {
    this.intentosFallidos = new Map();
    this.ipsBloqueadas = new Set();
    this.sesionesActivas = new Map();
  }
  
  // Registrar intento fallido
  registrarIntentoFallido(usuario, ip) {
    const key = `${usuario}_${ip}`;
    const intentos = this.intentosFallidos.get(key) || 0;
    this.intentosFallidos.set(key, intentos + 1);
    
    // Bloquear después de 5 intentos
    if (intentos >= 4) {
      this.bloquearIP(ip);
      return { bloqueado: true, intentos: intentos + 1 };
    }
    
    return { bloqueado: false, intentos: intentos + 1 };
  }
  
  // Bloquear IP temporalmente
  bloquearIP(ip) {
    this.ipsBloqueadas.add(ip);
    // Desbloquear después de 15 minutos
    setTimeout(() => {
      this.ipsBloqueadas.delete(ip);
    }, 15 * 60 * 1000);
  }
  
  // Verificar si IP está bloqueada
  estaIPBloqueada(ip) {
    return this.ipsBloqueadas.has(ip);
  }
  
  // Crear sesión con timeout
  crearSesion(usuario, ip) {
    const sessionId = this.generarToken();
    const expiracion = Date.now() + (30 * 60 * 1000); // 30 minutos
    
    this.sesionesActivas.set(sessionId, {
      usuario,
      ip,
      inicio: Date.now(),
      expiracion,
      activa: true
    });
    
    return sessionId;
  }
  
  // Verificar sesión válida
  verificarSesion(sessionId) {
    const sesion = this.sesionesActivas.get(sessionId);
    if (!sesion || !sesion.activa || Date.now() > sesion.expiracion) {
      if (sesion) this.sesionesActivas.delete(sessionId);
      return null;
    }
    
    // Extender sesión si hay actividad
    sesion.expiracion = Date.now() + (30 * 60 * 1000);
    return sesion;
  }
  
  // Generar token seguro
  generarToken() {
    return Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map(b => b.toString(16).padStart(2, '0')).join('');
  }
}

// 3. VALIDACIÓN AVANZADA DE DNI PERUANO
function validarDNIPeruanoAvanzado(dni) {
  if (!/^\d{8}$/.test(dni)) return false;
  
  // Algoritmo de verificación de DNI peruano
  const digitos = dni.split('').map(Number);
  const factores = [3, 2, 7, 6, 5, 4, 3, 2];
  
  let suma = 0;
  for (let i = 0; i < 7; i++) {
    suma += digitos[i] * factores[i];
  }
  
  const resto = suma % 11;
  const digitoVerificador = resto < 2 ? resto : 11 - resto;
  
  return digitoVerificador === digitos[7];
}

// 4. SISTEMA DE AUDITORÍA AVANZADA
class SistemaAuditoria {
  constructor() {
    this.eventos = [];
  }
  
  registrar(evento) {
    const entrada = {
      timestamp: new Date().toISOString(),
      id: this.generarID(),
      usuario: evento.usuario,
      accion: evento.accion,
      recurso: evento.recurso,
      ip: evento.ip || 'localhost',
      userAgent: navigator.userAgent,
      resultado: evento.resultado || 'exitoso',
      detalles: evento.detalles || {},
      nivelRiesgo: this.calcularNivelRiesgo(evento)
    };
    
    this.eventos.push(entrada);
    this.almacenarEvento(entrada);
    
    return entrada.id;
  }
  
  calcularNivelRiesgo(evento) {
    const accionesRiesgo = {
      'LOGIN_FALLIDO': 'medio',
      'MULTIPLE_LOGIN_FALLIDO': 'alto',
      'CAMBIO_PASSWORD': 'bajo',
      'MODIFICAR_USUARIO': 'medio',
      'ELIMINAR_PAQUETE': 'alto',
      'ACCESO_NO_AUTORIZADO': 'critico'
    };
    
    return accionesRiesgo[evento.accion] || 'bajo';
  }
  
  generarID() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
  
  almacenarEvento(evento) {
    // Guardar en localStorage o enviar al servidor
    const eventos = JSON.parse(localStorage.getItem('auditoria') || '[]');
    eventos.push(evento);
    
    // Mantener solo los últimos 10000 eventos
    if (eventos.length > 10000) {
      eventos.splice(0, eventos.length - 10000);
    }
    
    localStorage.setItem('auditoria', JSON.stringify(eventos));
  }
  
  obtenerEventos(filtros = {}) {
    return this.eventos.filter(evento => {
      if (filtros.usuario && evento.usuario !== filtros.usuario) return false;
      if (filtros.accion && evento.accion !== filtros.accion) return false;
      if (filtros.nivelRiesgo && evento.nivelRiesgo !== filtros.nivelRiesgo) return false;
      if (filtros.desde && new Date(evento.timestamp) < new Date(filtros.desde)) return false;
      if (filtros.hasta && new Date(evento.timestamp) > new Date(filtros.hasta)) return false;
      return true;
    });
  }
}

// Instancia global
const seguridadSistema = new SistemaSeguridad();
const auditoriaSistema = new SistemaAuditoria();

// 5. FUNCIONES DE ENCRIPTACIÓN BÁSICA
function encriptarDatos(texto, clave = 'shalom2025') {
  // Implementación básica - en producción usar bibliotecas robustas
  let resultado = '';
  for (let i = 0; i < texto.length; i++) {
    const charCode = texto.charCodeAt(i) ^ clave.charCodeAt(i % clave.length);
    resultado += String.fromCharCode(charCode);
  }
  return btoa(resultado);
}

function desencriptarDatos(textoEncriptado, clave = 'shalom2025') {
  try {
    const texto = atob(textoEncriptado);
    let resultado = '';
    for (let i = 0; i < texto.length; i++) {
      const charCode = texto.charCodeAt(i) ^ clave.charCodeAt(i % clave.length);
      resultado += String.fromCharCode(charCode);
    }
    return resultado;
  } catch {
    return null;
  }
}

// EJEMPLO DE USO:
/*
// Validar contraseña
const validacion = validarPasswordRobusta('MiPassword123!');
console.log(validacion); // { esValida: true, puntuacion: 5, ... }

// Registrar intento de login
const resultado = seguridadSistema.registrarIntentoFallido('usuario1', '192.168.1.1');
if (resultado.bloqueado) {
  alert('IP bloqueada por múltiples intentos fallidos');
}

// Crear sesión
const sessionId = seguridadSistema.crearSesion('usuario1', '192.168.1.1');

// Auditar acción
auditoriaSistema.registrar({
  usuario: 'admin1',
  accion: 'MODIFICAR_PAQUETE',
  recurso: 'paquete_2025ABC1',
  detalles: { campo: 'estado', valor_anterior: 'Pendiente', valor_nuevo: 'En tránsito' }
});
*/


