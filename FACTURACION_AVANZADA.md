# 🧾 Sistema de Facturación Avanzada - Shalom Logística

## 📋 Descripción General

El sistema de facturación avanzada permite la gestión completa de documentos comerciales (facturas y boletas) con funcionalidades modernas y profesionales.

## ✨ Funcionalidades Principales

### 🔄 Cambio de Boleta a Factura
- **Conversión automática** entre tipos de documento
- **Generación de nuevos números** de serie
- **Validación de datos** requeridos (RUC para facturas, DNI para boletas)
- **Preservación de información** del documento original

### ✏️ Edición Avanzada de Facturas
- **Interfaz con pestañas** para mejor organización
- **Edición completa** de todos los campos
- **Validación en tiempo real** de datos
- **Configuración de impresión** personalizable

### 🔍 Búsqueda Avanzada
- **Filtros múltiples** por cliente, fecha, estado, tipo
- **Búsqueda por monto** mínimo
- **Resultados exportables** a Excel
- **Interfaz intuitiva** con modal

### 📊 Gestión Completa
- **Creación de facturas** desde cero
- **Duplicación** de documentos existentes
- **Descarga en PDF** (simulado)
- **Eliminación segura** con confirmación

## 🚀 Cómo Usar

### 1. Cambiar Tipo de Documento

1. **Acceder** a la sección de facturas como administrador
2. **Localizar** la factura/boleta deseada
3. **Hacer clic** en el botón de cambio de tipo (🔄)
4. **Completar** los datos requeridos:
   - Para **Factura**: RUC y Razón Social del cliente
   - Para **Boleta**: DNI y Nombre completo del cliente
5. **Confirmar** el cambio

### 2. Editar Factura

1. **Seleccionar** la factura a editar
2. **Hacer clic** en el botón de edición (✏️)
3. **Navegar** por las pestañas:
   - **Datos Principales**: Información básica del documento
   - **Pago**: Métodos y detalles de pago
   - **Configuración**: Ajustes de impresión y formato
4. **Guardar** los cambios

### 3. Búsqueda Avanzada

1. **Hacer clic** en "Búsqueda Avanzada"
2. **Completar** los filtros deseados:
   - Cliente (nombre o documento)
   - Rango de fechas
   - Estado del documento
   - Tipo de documento
   - Monto mínimo
3. **Ejecutar** la búsqueda
4. **Exportar** resultados si es necesario

## 📁 Estructura de Archivos

```
PAGINA/
├── PAGINA.py                    # Backend con nuevas rutas API
├── facturacion_avanzada.js      # Funcionalidades JavaScript
├── static/
│   └── index.html              # Interfaz actualizada
└── data/
    └── facturas.txt            # Almacenamiento de datos
```

## 🔧 Nuevas Rutas API

### GET /api/facturas
Obtiene todas las facturas

### POST /api/facturas
Crea una nueva factura

### GET /api/facturas/<numero>
Obtiene una factura específica

### PUT /api/facturas/<numero>
Actualiza una factura existente

### DELETE /api/facturas/<numero>
Elimina una factura

### POST /api/facturas/<numero>/cambiar-tipo
Cambia el tipo de documento (boleta ↔ factura)

### POST /api/facturas/<numero>/duplicar
Duplica una factura existente

### POST /api/facturas/buscar
Búsqueda avanzada con filtros

## 💾 Estructura de Datos

### Factura Completa
```json
{
  "numero": "F001-0001",
  "fecha_emision": "2024-01-15",
  "tipo_documento": "factura",
  "estado": "Pagado",
  "cliente": "Empresa ABC S.A.C.",
  "ruc_cliente": "20123456789",
  "paquete": "2025ABC123",
  "observaciones": "Entrega urgente",
  "metodo_pago": "Yape",
  "total": 150.00,
  "fecha_pago": "2024-01-15",
  "numero_transaccion": "TXN123456",
  "banco": "BCP",
  "referencia": "REF789",
  "serie": "F001",
  "moneda": "PEN",
  "configuracion_impresion": {
    "incluir_logo": true,
    "incluir_qr": true,
    "incluir_firma": true
  }
}
```

## 🎨 Interfaz de Usuario

### Panel de Administrador
- **Tabla responsiva** con todas las facturas
- **Botones de acción** para cada factura:
  - 👁️ Ver detalles
  - ✏️ Editar
  - 🔄 Cambiar tipo
  - 📥 Descargar
  - 🗑️ Eliminar

### Modal de Edición
- **Pestañas organizadas** para mejor UX
- **Validación en tiempo real**
- **Campos contextuales** según tipo de documento

### Búsqueda Avanzada
- **Formulario intuitivo** con filtros claros
- **Resultados en tabla** con acciones
- **Exportación** de resultados

## 🔒 Seguridad y Validaciones

### Validaciones de Entrada
- **RUC**: 11 dígitos para facturas
- **DNI**: 8 dígitos para boletas
- **Montos**: Números positivos
- **Fechas**: Formato válido

### Permisos por Rol
- **Administrador**: Acceso completo
- **Cliente**: Solo ver sus facturas
- **Transportista**: Ver facturas relacionadas
- **Empleado**: Acceso limitado

## 📈 Funcionalidades Futuras

### Próximas Mejoras
- [ ] **Generación real de PDF** con librería jsPDF
- [ ] **Envío por email** automático
- [ ] **Firma digital** de documentos
- [ ] **Integración con SUNAT** para validación
- [ ] **Reportes gráficos** con Chart.js
- [ ] **Backup automático** de facturas
- [ ] **Plantillas personalizables** de documentos

### Integraciones Planeadas
- [ ] **Sistema de pagos** (Yape, Plin, bancos)
- [ ] **Notificaciones push** para pagos
- [ ] **API externa** para validación de RUC/DNI
- [ ] **Almacenamiento en la nube** (Google Drive, Dropbox)

## 🐛 Solución de Problemas

### Problemas Comunes

1. **Error al cambiar tipo de documento**
   - Verificar que los datos requeridos estén completos
   - Asegurar formato correcto de RUC/DNI

2. **No se guardan los cambios**
   - Verificar conexión con el servidor
   - Revisar consola del navegador para errores

3. **Búsqueda no encuentra resultados**
   - Verificar que los filtros sean correctos
   - Comprobar que existan datos en el sistema

### Logs y Debugging
- **Consola del navegador**: Errores JavaScript
- **Logs del servidor**: Errores de backend
- **Network tab**: Problemas de comunicación API

## 📞 Soporte

Para soporte técnico o reportar problemas:
- **Email**: soporte@shalomlogistica.com
- **Teléfono**: +51 982 123 456
- **Horario**: Lunes a Viernes 8:00 - 18:00

---

**Desarrollado por**: Equipo de Desarrollo Shalom Logística  
**Versión**: 2.0  
**Última actualización**: Enero 2024
