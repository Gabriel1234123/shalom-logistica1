// ========================================
// SISTEMA AVANZADO DE FACTURACIÓN
// ========================================

// Variables globales para facturación
let facturasAvanzadas = [];
let configuracionFacturacion = {
    empresa: {
        razon_social: 'Shalom Logística S.A.C.',
        ruc: '20123456789',
        direccion: 'Av. Principal 123, Puerto Maldonado, Madre de Dios',
        telefono: '+51 982 123 456',
        email: 'info@shalomlogistica.com'
    },
    serie_factura: 'F001',
    serie_boleta: 'B001',
    igv: 18
};

// ========================================
// FUNCIONES PRINCIPALES DE FACTURACIÓN
// ========================================

// Función para cambiar de boleta a factura
function cambiarTipoDocumento(numeroDocumento, nuevoTipo) {
    const modal = `
        <div class="modal fade" id="cambiarTipoModal" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header bg-primary text-white">
                        <h5 class="modal-title">
                            <i class="bi bi-arrow-repeat me-2"></i>
                            Cambiar de ${nuevoTipo === 'factura' ? 'Boleta a Factura' : 'Factura a Boleta'}
                        </h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="alert alert-info">
                            <i class="bi bi-info-circle me-2"></i>
                            <strong>Importante:</strong> Al cambiar el tipo de documento, se generará un nuevo número y se requerirán datos adicionales.
                        </div>
                        
                        <form id="formCambiarTipo">
                            <div class="row">
                                <div class="col-md-6">
                                    <h6 class="text-primary">
                                        <i class="bi bi-building me-2"></i>
                                        Datos de la Empresa
                                    </h6>
                                    <div class="mb-3">
                                        <label class="form-label">Razón Social</label>
                                        <input type="text" class="form-control" id="razonSocial" value="${configuracionFacturacion.empresa.razon_social}" required>
                                    </div>
                                    <div class="mb-3">
                                        <label class="form-label">RUC</label>
                                        <input type="text" class="form-control" id="rucCliente" placeholder="11 dígitos" maxlength="11" pattern="[0-9]{11}" required>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <h6 class="text-success">
                                        <i class="bi bi-person me-2"></i>
                                        Datos del Cliente
                                    </h6>
                                    <div class="mb-3">
                                        <label class="form-label">${nuevoTipo === 'factura' ? 'Razón Social del Cliente' : 'Nombre Completo'}</label>
                                        <input type="text" class="form-control" id="nombreCliente" required>
                                    </div>
                                    <div class="mb-3">
                                        <label class="form-label">${nuevoTipo === 'factura' ? 'RUC del Cliente' : 'DNI'}</label>
                                        <input type="text" class="form-control" id="documentoCliente" 
                                               placeholder="${nuevoTipo === 'factura' ? '11 dígitos' : '8 dígitos'}" 
                                               maxlength="${nuevoTipo === 'factura' ? '11' : '8'}" 
                                               pattern="${nuevoTipo === 'factura' ? '[0-9]{11}' : '[0-9]{8}'}" required>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="alert alert-warning">
                                <i class="bi bi-exclamation-triangle me-2"></i>
                                <strong>Nota:</strong> Este cambio generará un nuevo documento con número diferente.
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                        <button type="button" class="btn btn-primary" onclick="confirmarCambioTipo('${numeroDocumento}', '${nuevoTipo}')">
                            <i class="bi bi-check-circle me-2"></i>
                            Confirmar Cambio
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modal);
    new bootstrap.Modal(document.getElementById('cambiarTipoModal')).show();
    
    document.getElementById('cambiarTipoModal').addEventListener('hidden.bs.modal', function() {
        this.remove();
    });
}

// Confirmar cambio de tipo de documento
function confirmarCambioTipo(numeroDocumento, nuevoTipo) {
    const formData = {
        tipo: nuevoTipo,
        ruc_cliente: document.getElementById('rucCliente').value,
        razon_social: document.getElementById('razonSocial').value,
        dni_cliente: document.getElementById('documentoCliente').value,
        nombre_cliente: document.getElementById('nombreCliente').value
    };
    
    // Validar datos
    if (!formData.ruc_cliente || !formData.razon_social || !formData.dni_cliente || !formData.nombre_cliente) {
        notificar('Por favor complete todos los campos requeridos', 'error');
        return;
    }
    
    // Enviar al servidor
    fetch(`/api/facturas/${numeroDocumento}/cambiar-tipo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
    })
    .then(res => res.json())
    .then(data => {
        if (data.mensaje) {
            notificar(data.mensaje, 'success');
            bootstrap.Modal.getInstance(document.getElementById('cambiarTipoModal')).hide();
            setTimeout(() => {
                mostrarFacturas(); // Recargar lista
            }, 1000);
        } else {
            notificar(data.error || 'Error al cambiar tipo de documento', 'error');
        }
    })
    .catch(err => {
        console.error('Error:', err);
        notificar('Error de conexión', 'error');
    });
}

// Inicializar sistema de facturación
function inicializarSistemaFacturacion() {
    console.log('Sistema de facturación avanzada inicializado');
}

// Exportar funciones para uso global
window.cambiarTipoDocumento = cambiarTipoDocumento;
window.confirmarCambioTipo = confirmarCambioTipo;
window.inicializarSistemaFacturacion = inicializarSistemaFacturacion;

// Inicializar al cargar la página
document.addEventListener('DOMContentLoaded', inicializarSistemaFacturacion);
