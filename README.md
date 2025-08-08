# Sistema de Gestión - Shalom Logística

Un sistema completo de gestión logística desarrollado con Python Flask y JavaScript vanilla, diseñado para manejar paquetes, usuarios, empleados y facturas.

## 🚀 Características

### 👥 Gestión de Usuarios
- **Registro de clientes** con validaciones completas
- **Gestión de empleados** con diferentes roles
- **Sistema de autenticación** seguro
- **Cambio de contraseñas** con validación

### 📦 Gestión de Paquetes
- **Crear y editar paquetes** con códigos únicos
- **Seguimiento de estados** (Pendiente, En tránsito, Entregado, Incidencia)
- **Asignación de transportistas**
- **Tracking visual** con mapa animado
- **Chat de soporte** por paquete

### 💰 Facturación
- **Generación de facturas** automática
- **Múltiples métodos de pago** (Efectivo, Yape)
- **Historial de pagos** completo

### 📊 Reportes y Estadísticas
- **Dashboard con resumen** de estados
- **Gráficos interactivos** (Chart.js)
- **Exportación a Excel**
- **Importación de datos**

### 🎨 Interfaz Moderna
- **Diseño responsive** con Bootstrap 5
- **Modo oscuro/claro**
- **Notificaciones elegantes**
- **Iconografía moderna**

## 🛠️ Tecnologías Utilizadas

### Backend
- **Python 3.x**
- **Flask** - Framework web
- **JSON** - Almacenamiento de datos

### Frontend
- **HTML5** - Estructura
- **CSS3** - Estilos y animaciones
- **JavaScript ES6+** - Lógica del cliente
- **Bootstrap 5** - Framework CSS
- **Chart.js** - Gráficos
- **SheetJS** - Exportación Excel

## 📁 Estructura del Proyecto

```
PAGINA/
├── PAGINA.py              # Servidor Flask
├── static/
│   └── index.html         # Interfaz principal
├── data/                  # Datos persistentes
│   ├── usuarios.txt       # Clientes registrados
│   ├── empleados.txt      # Empleados del sistema
│   ├── paquetes.txt       # Paquetes en gestión
│   └── historial.txt      # Log de actividades
└── README.md             # Documentación
```

## 🚀 Instalación y Uso

### Requisitos Previos
- Python 3.7 o superior
- Navegador web moderno

### Pasos de Instalación

1. **Clonar o descargar el proyecto**
   ```bash
   git clone <url-del-repositorio>
   cd PAGINA
   ```

2. **Instalar dependencias**
   ```bash
   pip install flask
   ```

3. **Ejecutar el servidor**
   ```bash
   python PAGINA.py
   ```

4. **Abrir en el navegador**
   ```
   http://localhost:5000
   ```

### Credenciales por Defecto
- **Usuario:** `admin`
- **Contraseña:** `admin123`
- **Rol:** Administrador de logística

## 👥 Roles del Sistema

### 1. Administrador de Logística
- Gestión completa de paquetes
- Administración de usuarios y empleados
- Generación de reportes
- Configuración del sistema

### 2. Cliente
- Ver sus paquetes
- Consultar facturas
- Chat de soporte
- Cambiar contraseña

### 3. Empleado de Almacén
- Crear y editar paquetes
- Gestión de inventario
- Actualizar estados

### 4. Transportista
- Ver paquetes asignados
- Actualizar estado de entregas
- Reportar incidencias

### 5. Técnico de Soporte
- Atención de incidencias
- Soporte técnico
- Gestión de tickets

## 🔧 Funcionalidades Principales

### Gestión de Paquetes
- **Códigos únicos** generados automáticamente
- **Estados de seguimiento** con indicadores visuales
- **Asignación de transportistas**
- **Validaciones completas** de datos

### Sistema de Notificaciones
- **Notificaciones toast** elegantes
- **Diferentes tipos** (success, error, info)
- **Auto-desaparición** configurable

### Modo Oscuro
- **Toggle automático** con persistencia
- **Transiciones suaves**
- **Colores optimizados** para ambos modos

### Exportación de Datos
- **Excel (.xlsx)** con SheetJS
- **Datos estructurados** y formateados
- **Importación** de archivos existentes

## 🛡️ Seguridad

### Validaciones Implementadas
- **Emails** con regex
- **Teléfonos peruanos** con formato
- **Edad mínima** para empleados (18 años)
- **Contraseñas** con longitud mínima
- **Usuarios únicos** en todo el sistema

### Manejo de Errores
- **Try-catch** en todas las operaciones
- **Mensajes de error** descriptivos
- **Fallbacks** para datos corruptos
- **Logging** de actividades

## 📊 API Endpoints

### Autenticación
- `POST /verificar_usuario.php` - Login
- `POST /guardar_usuario.php` - Registro cliente
- `POST /guardar_empleado.php` - Registro empleado

### Datos
- `GET /clientes.php` - Listar clientes
- `GET /empleados.php` - Listar empleados
- `GET /api/paquetes` - Listar paquetes
- `POST /api/paquetes` - Crear paquete
- `PUT /api/paquetes` - Editar paquete
- `DELETE /api/paquetes` - Eliminar paquete

### Gestión
- `POST /api/cambiar_contrasena` - Cambiar contraseña
- `DELETE /api/empleados/<usuario>` - Eliminar empleado
- `GET /api/historial` - Obtener historial

## 🎯 Mejoras Implementadas

### Backend (Python)
- ✅ **Validaciones robustas** de datos
- ✅ **Manejo de errores** mejorado
- ✅ **Logging** de actividades
- ✅ **Endpoints faltantes** agregados
- ✅ **Validaciones de edad** y formato

### Frontend (JavaScript)
- ✅ **Notificaciones** en lugar de alerts
- ✅ **Manejo de errores** de red
- ✅ **Validaciones** del lado cliente
- ✅ **Funciones faltantes** implementadas
- ✅ **UX mejorada** con feedback visual

## 🔮 Próximas Mejoras

- [ ] **Base de datos** SQLite/PostgreSQL
- [ ] **Autenticación JWT** más segura
- [ ] **Notificaciones push** en tiempo real
- [ ] **API REST** completa
- [ ] **Tests unitarios**
- [ ] **Docker** para deployment
- [ ] **Backup automático** de datos

## 📝 Licencia

Este proyecto es de uso educativo y comercial. Desarrollado para Shalom Logística.

## 👨‍💻 Autor

Sistema desarrollado para gestión logística completa con tecnologías modernas y UX optimizada.

---

**¡Gracias por usar Shalom Logística! 🚚📦**



