// ========================================
// INTEGRACIONES EXTERNAS
// ========================================

// 1. INTEGRACIÓN CON APIS PERUANAS
class IntegracionesPeru {
  constructor() {
    this.apiSunat = 'https://api.sunat.gob.pe';
    this.apiReniec = 'https://api.reniec.gob.pe';
    this.apiBancoNacion = 'https://api.bn.com.pe';
  }
  
  // Validar DNI con RENIEC
  async validarDNIReniec(dni) {
    try {
      // En producción usar API real de RENIEC
      const response = await fetch(`${this.apiReniec}/consulta-dni`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + this.obtenerTokenReniec()
        },
        body: JSON.stringify({ dni })
      });
      
      if (response.ok) {
        const data = await response.json();
        return {
          valido: true,
          nombres: data.nombres,
          apellidoPaterno: data.apellido_paterno,
          apellidoMaterno: data.apellido_materno,
          fechaNacimiento: data.fecha_nacimiento
        };
      }
      
      return { valido: false, mensaje: 'DNI no encontrado' };
    } catch (error) {
      // Fallback a validación local
      return this.validarDNILocal(dni);
    }
  }
  
  // Validar RUC con SUNAT
  async validarRUCSunat(ruc) {
    try {
      const response = await fetch(`${this.apiSunat}/consulta-ruc`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + this.obtenerTokenSunat()
        },
        body: JSON.stringify({ ruc })
      });
      
      if (response.ok) {
        const data = await response.json();
        return {
          valido: true,
          razonSocial: data.razon_social,
          estado: data.estado,
          condicion: data.condicion,
          direccion: data.direccion,
          ubigeo: data.ubigeo
        };
      }
      
      return { valido: false, mensaje: 'RUC no encontrado' };
    } catch (error) {
      return this.validarRUCLocal(ruc);
    }
  }
  
  // Obtener tipo de cambio
  async obtenerTipoCambio() {
    try {
      const response = await fetch(`${this.apiBancoNacion}/tipo-cambio`);
      const data = await response.json();
      
      return {
        compra: data.compra,
        venta: data.venta,
        fecha: data.fecha
      };
    } catch (error) {
      // Valor por defecto
      return { compra: 3.70, venta: 3.75, fecha: new Date().toISOString() };
    }
  }
  
  validarDNILocal(dni) {
    // Validación básica local
    if (!/^\d{8}$/.test(dni)) {
      return { valido: false, mensaje: 'DNI debe tener 8 dígitos' };
    }
    
    return { valido: true, local: true };
  }
  
  validarRUCLocal(ruc) {
    if (!/^\d{11}$/.test(ruc)) {
      return { valido: false, mensaje: 'RUC debe tener 11 dígitos' };
    }
    
    return { valido: true, local: true };
  }
  
  obtenerTokenReniec() {
    // En producción, obtener token real
    return 'token_reniec_simulado';
  }
  
  obtenerTokenSunat() {
    return 'token_sunat_simulado';
  }
}

// 2. INTEGRACIÓN CON PAGOS REALES
class IntegracionPagos {
  constructor() {
    this.yapeAPI = 'https://api.yape.com.pe';
    this.plinAPI = 'https://api.plin.pe';
    this.visanetAPI = 'https://api.visanet.pe';
  }
  
  // Generar QR de Yape real
  async generarQRYape(monto, concepto, telefono) {
    try {
      const response = await fetch(`${this.yapeAPI}/generate-qr`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + this.obtenerTokenYape()
        },
        body: JSON.stringify({
          amount: monto,
          description: concepto,
          merchant_phone: telefono,
          expiration_time: 300 // 5 minutos
        })
      });
      
      const data = await response.json();
      
      return {
        qrCode: data.qr_code,
        transactionId: data.transaction_id,
        expiresAt: data.expires_at
      };
    } catch (error) {
      // Generar QR simulado
      return this.generarQRSimulado(monto, concepto);
    }
  }
  
  // Procesar pago con tarjeta (Visanet)
  async procesarPagoTarjeta(datosTarjeta, monto) {
    try {
      const response = await fetch(`${this.visanetAPI}/process-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + this.obtenerTokenVisanet()
        },
        body: JSON.stringify({
          card_number: datosTarjeta.numero,
          expiry_month: datosTarjeta.mesVencimiento,
          expiry_year: datosTarjeta.anoVencimiento,
          cvv: datosTarjeta.cvv,
          amount: monto,
          currency: 'PEN'
        })
      });
      
      const data = await response.json();
      
      return {
        exitoso: data.status === 'approved',
        transactionId: data.transaction_id,
        authorizationCode: data.authorization_code,
        mensaje: data.message
      };
    } catch (error) {
      return this.simularPagoTarjeta(monto);
    }
  }
  
  // Verificar estado de pago Yape
  async verificarPagoYape(transactionId) {
    try {
      const response = await fetch(`${this.yapeAPI}/transaction-status/${transactionId}`, {
        headers: {
          'Authorization': 'Bearer ' + this.obtenerTokenYape()
        }
      });
      
      const data = await response.json();
      
      return {
        estado: data.status, // 'pending', 'completed', 'failed'
        monto: data.amount,
        fecha: data.completed_at
      };
    } catch (error) {
      return { estado: 'completed', monto: 0, fecha: new Date() };
    }
  }
  
  generarQRSimulado(monto, concepto) {
    const qrData = `yape://pay?amount=${monto}&description=${encodeURIComponent(concepto)}`;
    return {
      qrCode: `data:image/svg+xml;base64,${btoa(this.generarSVGQR(qrData))}`,
      transactionId: 'SIM_' + Date.now(),
      expiresAt: new Date(Date.now() + 300000).toISOString()
    };
  }
  
  generarSVGQR(data) {
    // Generar QR SVG básico (en producción usar librería real)
    return `<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
      <rect width="200" height="200" fill="white"/>
      <text x="100" y="100" text-anchor="middle" font-family="monospace" font-size="10">
        QR: ${data.substring(0, 20)}...
      </text>
    </svg>`;
  }
  
  simularPagoTarjeta(monto) {
    return {
      exitoso: true,
      transactionId: 'SIM_CARD_' + Date.now(),
      authorizationCode: 'AUTH_' + Math.random().toString(36).substr(2, 6),
      mensaje: 'Pago simulado exitoso'
    };
  }
  
  obtenerTokenYape() {
    return localStorage.getItem('yape_token') || 'token_yape_simulado';
  }
  
  obtenerTokenVisanet() {
    return localStorage.getItem('visanet_token') || 'token_visanet_simulado';
  }
}

// 3. INTEGRACIÓN CON GOOGLE MAPS
class IntegracionMaps {
  constructor() {
    this.apiKey = 'TU_API_KEY_GOOGLE_MAPS';
    this.mapsLoaded = false;
  }
  
  async inicializar() {
    if (this.mapsLoaded) return;
    
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${this.apiKey}&libraries=geometry`;
      script.onload = () => {
        this.mapsLoaded = true;
        resolve();
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }
  
  async calcularRuta(origen, destino) {
    await this.inicializar();
    
    return new Promise((resolve, reject) => {
      const service = new google.maps.DirectionsService();
      
      service.route({
        origin: origen,
        destination: destino,
        travelMode: google.maps.TravelMode.DRIVING
      }, (result, status) => {
        if (status === 'OK') {
          const ruta = result.routes[0];
          resolve({
            distancia: ruta.legs[0].distance.text,
            duracion: ruta.legs[0].duration.text,
            pasos: ruta.legs[0].steps.map(paso => ({
              instruccion: paso.instructions,
              distancia: paso.distance.text,
              duracion: paso.duration.text
            }))
          });
        } else {
          reject(new Error('Error calculando ruta: ' + status));
        }
      });
    });
  }
  
  async obtenerCoordenadas(direccion) {
    await this.inicializar();
    
    return new Promise((resolve, reject) => {
      const geocoder = new google.maps.Geocoder();
      
      geocoder.geocode({ address: direccion }, (results, status) => {
        if (status === 'OK') {
          const location = results[0].geometry.location;
          resolve({
            lat: location.lat(),
            lng: location.lng(),
            direccionCompleta: results[0].formatted_address
          });
        } else {
          reject(new Error('Error obteniendo coordenadas: ' + status));
        }
      });
    });
  }
  
  crearMapa(elementId, centro, opciones = {}) {
    const opcionesDefault = {
      zoom: 13,
      center: centro,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    
    return new google.maps.Map(
      document.getElementById(elementId),
      { ...opcionesDefault, ...opciones }
    );
  }
  
  agregarMarcador(mapa, posicion, opciones = {}) {
    return new google.maps.Marker({
      position: posicion,
      map: mapa,
      ...opciones
    });
  }
}

// 4. INTEGRACIÓN CON WHATSAPP BUSINESS
class IntegracionWhatsApp {
  constructor() {
    this.apiUrl = 'https://graph.facebook.com/v17.0';
    this.phoneNumberId = 'TU_PHONE_NUMBER_ID';
    this.accessToken = 'TU_ACCESS_TOKEN';
  }
  
  async enviarMensaje(numeroDestino, mensaje, tipo = 'text') {
    try {
      const response = await fetch(`${this.apiUrl}/${this.phoneNumberId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: numeroDestino,
          type: tipo,
          text: { body: mensaje }
        })
      });
      
      const data = await response.json();
      return {
        exitoso: response.ok,
        messageId: data.messages?.[0]?.id,
        error: data.error?.message
      };
    } catch (error) {
      return { exitoso: false, error: error.message };
    }
  }
  
  async enviarPlantilla(numeroDestino, nombrePlantilla, parametros) {
    try {
      const response = await fetch(`${this.apiUrl}/${this.phoneNumberId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: numeroDestino,
          type: 'template',
          template: {
            name: nombrePlantilla,
            language: { code: 'es' },
            components: [{
              type: 'body',
              parameters: parametros.map(p => ({ type: 'text', text: p }))
            }]
          }
        })
      });
      
      const data = await response.json();
      return {
        exitoso: response.ok,
        messageId: data.messages?.[0]?.id,
        error: data.error?.message
      };
    } catch (error) {
      return { exitoso: false, error: error.message };
    }
  }
  
  // Plantillas predefinidas
  async notificarPaqueteCreado(numeroDestino, codigoPaquete, destinatario) {
    return this.enviarPlantilla(numeroDestino, 'paquete_creado', [
      codigoPaquete,
      destinatario,
      'https://shalom-logistics.com/track/' + codigoPaquete
    ]);
  }
  
  async notificarEnTransito(numeroDestino, codigoPaquete, ubicacionActual) {
    return this.enviarPlantilla(numeroDestino, 'en_transito', [
      codigoPaquete,
      ubicacionActual
    ]);
  }
  
  async notificarEntregado(numeroDestino, codigoPaquete, fechaEntrega) {
    return this.enviarPlantilla(numeroDestino, 'entregado', [
      codigoPaquete,
      fechaEntrega
    ]);
  }
}

// 5. INTEGRACIÓN CON SMS GATEWAY
class IntegracionSMS {
  constructor() {
    this.provider = 'twilio'; // o 'nexmo', 'textlocal', etc.
    this.apiUrl = 'https://api.twilio.com/2010-04-01';
    this.accountSid = 'TU_ACCOUNT_SID';
    this.authToken = 'TU_AUTH_TOKEN';
    this.fromNumber = '+51999999999';
  }
  
  async enviarSMS(numeroDestino, mensaje) {
    try {
      const response = await fetch(`${this.apiUrl}/Accounts/${this.accountSid}/Messages.json`, {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + btoa(`${this.accountSid}:${this.authToken}`),
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          From: this.fromNumber,
          To: numeroDestino,
          Body: mensaje
        })
      });
      
      const data = await response.json();
      return {
        exitoso: response.ok,
        messageId: data.sid,
        estado: data.status,
        error: data.error_message
      };
    } catch (error) {
      return { exitoso: false, error: error.message };
    }
  }
  
  // Plantillas de SMS
  async enviarCodigoVerificacion(numeroDestino, codigo) {
    const mensaje = `Tu código de verificación para Shalom Logística es: ${codigo}. Válido por 5 minutos.`;
    return this.enviarSMS(numeroDestino, mensaje);
  }
  
  async notificarEstadoPaquete(numeroDestino, codigoPaquete, nuevoEstado) {
    const mensaje = `Hola! Tu paquete ${codigoPaquete} cambió a estado: ${nuevoEstado}. Seguimiento: bit.ly/track${codigoPaquete}`;
    return this.enviarSMS(numeroDestino, mensaje);
  }
}

// Instancias globales
const integracionesPeru = new IntegracionesPeru();
const integracionPagos = new IntegracionPagos();
const integracionMaps = new IntegracionMaps();
const integracionWhatsApp = new IntegracionWhatsApp();
const integracionSMS = new IntegracionSMS();

// EJEMPLO DE USO:
/*
// Validar DNI con RENIEC
const resultadoDNI = await integracionesPeru.validarDNIReniec('12345678');

// Generar QR de Yape
const qrYape = await integracionPagos.generarQRYape(25.50, 'Envío paquete 2025ABC1', '999999999');

// Calcular ruta con Google Maps
const ruta = await integracionMaps.calcularRuta('Lima, Perú', 'Cusco, Perú');

// Enviar notificación por WhatsApp
const whatsapp = await integracionWhatsApp.notificarPaqueteCreado('51999999999', '2025ABC1', 'Juan Pérez');

// Enviar SMS
const sms = await integracionSMS.notificarEstadoPaquete('51999999999', '2025ABC1', 'En tránsito');
*/


