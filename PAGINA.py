from flask import Flask, request, jsonify, send_from_directory
import json
import os
from datetime import datetime

# === Configuración de rutas de archivos ===
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, 'data')
USUARIOS_FILE = os.path.join(DATA_DIR, 'usuarios.txt')
EMPLEADOS_FILE = os.path.join(DATA_DIR, 'empleados.txt')
PAQUETES_FILE = os.path.join(DATA_DIR, 'paquetes.txt')
HISTORIAL_FILE = os.path.join(DATA_DIR, 'historial.txt')
TRANSACCIONES_FILE = os.path.join(DATA_DIR, 'transacciones.txt')
FACTURAS_FILE = os.path.join(DATA_DIR, 'facturas.txt')

# === Helpers de persistencia ===
def ensure_data_dir():
    os.makedirs(DATA_DIR, exist_ok=True)

def load_data(path):
    ensure_data_dir()
    if not os.path.exists(path):
        return []
    with open(path, 'r', encoding='utf-8') as f:
        try:
            return json.load(f)
        except json.JSONDecodeError:
            return []

def save_data(path, data):
    ensure_data_dir()
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

# === Seed admin por defecto ===
def seed_admin():
    usuarios = load_data(USUARIOS_FILE)
    if not any(u.get('usuario') == 'admin' for u in usuarios):
        admin = {
            'nombre': 'Administrador',
            'apellido': '',
            'ciudad': 'Ciudad Admin',
            'telefono': '',
            'correo': 'admin@shalom.com',
            'usuario': 'admin',
            'contrasena': 'admin123',
            'rol': 'Administrador de logística'
        }
        usuarios.insert(0, admin)
        save_data(USUARIOS_FILE, usuarios)

# Inicialización
ensure_data_dir()
seed_admin()
print(f"Persistiendo datos en: {USUARIOS_FILE}, {EMPLEADOS_FILE}, {PAQUETES_FILE}, {HISTORIAL_FILE}, {TRANSACCIONES_FILE}, {FACTURAS_FILE}")

# === App Flask ===
app = Flask(__name__, static_folder='static', static_url_path='')

@app.route('/')
def index():
    return send_from_directory('static', 'index.html')

# --- Autenticación ---
@app.route('/verificar_usuario.php', methods=['POST'])
def verificar_usuario_php():
    data = request.get_json(force=True)
    usu = data.get('usuario', '').strip()
    pwd = data.get('contrasena', '')
    for u in load_data(USUARIOS_FILE) + load_data(EMPLEADOS_FILE):
        if (u.get('usuario') == usu or u.get('correo') == usu) and u.get('contrasena') == pwd:
            return jsonify({'mensaje': f"Bienvenido {u.get('nombre')}",
                            'nombre': u.get('nombre'),
                            'rol': u.get('rol')})
    return jsonify({'mensaje': 'Credenciales incorrectas'}), 401

@app.route('/guardar_usuario.php', methods=['POST'])
def guardar_usuario_php():
    data = request.get_json(force=True)
    data.setdefault('rol', 'Cliente')
    usuarios = load_data(USUARIOS_FILE)
    usuarios.append(data)
    save_data(USUARIOS_FILE, usuarios)
    return jsonify({'mensaje': 'Usuario registrado'}), 201

@app.route('/guardar_empleado.php', methods=['POST'])
def guardar_empleado_php():
    data = request.get_json(force=True)
    empleados = load_data(EMPLEADOS_FILE)
    empleados.append(data)
    save_data(EMPLEADOS_FILE, empleados)
    return jsonify({'mensaje': 'Empleado registrado'}), 201

# --- Listados específicos ---
@app.route('/clientes.php', methods=['GET'])
def listar_clientes_php():
    return jsonify(load_data(USUARIOS_FILE))

@app.route('/empleados.php', methods=['GET'])
def listar_empleados_php():
    return jsonify(load_data(EMPLEADOS_FILE))

# --- API general ---
# Usuarios
@app.route('/api/usuarios', methods=['GET', 'DELETE'])
def api_usuarios():
    if request.method == 'GET':
        return jsonify(load_data(USUARIOS_FILE))
    data = request.get_json(force=True)
    usu = data.get('usuario')
    usuarios = [u for u in load_data(USUARIOS_FILE) if u.get('usuario') != usu]
    save_data(USUARIOS_FILE, usuarios)
    return jsonify({'mensaje': 'Usuario eliminado'})

# Paquetes
@app.route('/api/paquetes', methods=['GET', 'POST', 'PUT', 'DELETE'])
def api_paquetes():
    if request.method == 'GET':
        return jsonify(load_data(PAQUETES_FILE))
    data = request.get_json(force=True)
    paquetes = load_data(PAQUETES_FILE)
    historial = load_data(HISTORIAL_FILE)
    ts = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    if request.method == 'POST':
        paquetes.append(data)
        historial.append(f"[{ts}] Registró paquete {data.get('codigo')}")
    elif request.method == 'PUT':
        for i, p in enumerate(paquetes):
            if p.get('codigo') == data.get('codigo'):
                paquetes[i] = data
                historial.append(f"[{ts}] Editó paquete {data.get('codigo')}")
                break
    elif request.method == 'DELETE':
        paquetes = [p for p in paquetes if p.get('codigo') != data.get('codigo')]
        historial.append(f"[{ts}] Eliminó paquete {data.get('codigo')}")
    save_data(PAQUETES_FILE, paquetes)
    save_data(HISTORIAL_FILE, historial)
    return jsonify({'mensaje': 'OK'})

# Historial
@app.route('/api/historial', methods=['GET'])
def api_historial():
    return jsonify(load_data(HISTORIAL_FILE))

# Transacciones
@app.route('/api/transacciones', methods=['GET', 'POST'])
def api_transacciones():
    if request.method == 'GET':
        return jsonify(load_data(TRANSACCIONES_FILE))
    data = request.get_json(force=True)
    transacciones = load_data(TRANSACCIONES_FILE)
    transacciones.append(data)
    save_data(TRANSACCIONES_FILE, transacciones)
    return jsonify({'mensaje': 'Transacción registrada'})

# Facturas
@app.route('/api/facturas', methods=['GET', 'POST'])
def api_facturas():
    if request.method == 'GET':
        return jsonify(load_data(FACTURAS_FILE))
    data = request.get_json(force=True)
    facturas = load_data(FACTURAS_FILE)
    facturas.append(data)
    save_data(FACTURAS_FILE, facturas)
    return jsonify({'mensaje': 'Factura creada'})

@app.route('/api/facturas/<numero>', methods=['GET', 'PUT', 'DELETE'])
def api_facturas_individual(numero):
    facturas = load_data(FACTURAS_FILE)
    
    if request.method == 'GET':
        factura = next((f for f in facturas if f.get('numero') == numero or f.get('codigo') == numero), None)
        if factura:
            return jsonify(factura)
        return jsonify({'error': 'Factura no encontrada'}), 404
    
    elif request.method == 'PUT':
        data = request.get_json(force=True)
        for i, f in enumerate(facturas):
            if f.get('numero') == numero or f.get('codigo') == numero:
                facturas[i] = data
                save_data(FACTURAS_FILE, facturas)
                return jsonify({'mensaje': 'Factura actualizada'})
        return jsonify({'error': 'Factura no encontrada'}), 404
    
    elif request.method == 'DELETE':
        facturas = [f for f in facturas if f.get('numero') != numero and f.get('codigo') != numero]
        save_data(FACTURAS_FILE, facturas)
        return jsonify({'mensaje': 'Factura eliminada'})

@app.route('/api/facturas/<numero>/cambiar-tipo', methods=['POST'])
def cambiar_tipo_factura(numero):
    data = request.get_json(force=True)
    nuevo_tipo = data.get('tipo')  # 'boleta' o 'factura'
    
    facturas = load_data(FACTURAS_FILE)
    for i, f in enumerate(facturas):
        if f.get('numero') == numero or f.get('codigo') == numero:
            facturas[i]['tipo_documento'] = nuevo_tipo
            if nuevo_tipo == 'factura':
                # Generar número de factura único
                facturas[i]['numero_factura'] = f"F001-{len(facturas):04d}"
                facturas[i]['ruc_cliente'] = data.get('ruc_cliente', '')
                facturas[i]['razon_social'] = data.get('razon_social', '')
            else:
                # Cambiar a boleta
                facturas[i]['numero_boleta'] = f"B001-{len(facturas):04d}"
                facturas[i]['dni_cliente'] = data.get('dni_cliente', '')
                facturas[i]['nombre_cliente'] = data.get('nombre_cliente', '')
            
            save_data(FACTURAS_FILE, facturas)
            return jsonify({'mensaje': f'Documento cambiado a {nuevo_tipo}'})
    
    return jsonify({'error': 'Factura no encontrada'}), 404

@app.route('/api/facturas/<numero>/duplicar', methods=['POST'])
def duplicar_factura(numero):
    facturas = load_data(FACTURAS_FILE)
    factura_original = next((f for f in facturas if f.get('numero') == numero or f.get('codigo') == numero), None)
    
    if not factura_original:
        return jsonify({'error': 'Factura no encontrada'}), 404
    
    # Crear copia con nuevo número
    nueva_factura = factura_original.copy()
    nueva_factura['numero'] = f"F001-{len(facturas):04d}"
    nueva_factura['fecha_emision'] = datetime.now().strftime('%Y-%m-%d')
    nueva_factura['estado'] = 'Pendiente'
    nueva_factura['es_duplicado'] = True
    
    facturas.append(nueva_factura)
    save_data(FACTURAS_FILE, facturas)
    
    return jsonify({'mensaje': 'Factura duplicada', 'nueva_factura': nueva_factura})

@app.route('/api/facturas/buscar', methods=['POST'])
def buscar_facturas():
    data = request.get_json(force=True)
    facturas = load_data(FACTURAS_FILE)
    
    # Filtros
    cliente = data.get('cliente', '').lower()
    fecha_inicio = data.get('fecha_inicio', '')
    fecha_fin = data.get('fecha_fin', '')
    estado = data.get('estado', '')
    tipo_documento = data.get('tipo_documento', '')
    
    # Aplicar filtros
    filtradas = facturas
    if cliente:
        filtradas = [f for f in filtradas if cliente in f.get('cliente', '').lower() or cliente in f.get('nombre_cliente', '').lower()]
    if fecha_inicio:
        filtradas = [f for f in filtradas if f.get('fecha_emision', '') >= fecha_inicio]
    if fecha_fin:
        filtradas = [f for f in filtradas if f.get('fecha_emision', '') <= fecha_fin]
    if estado:
        filtradas = [f for f in filtradas if f.get('estado', '') == estado]
    if tipo_documento:
        filtradas = [f for f in filtradas if f.get('tipo_documento', '') == tipo_documento]
    
    return jsonify(filtradas)

# Cambiar contraseña (NUEVO ENDPOINT)
@app.route('/api/cambiar_contrasena', methods=['POST'])
def cambiar_contrasena():
    data = request.get_json(force=True)
    usuario = data.get('usuario')
    actual = data.get('actual')
    nueva = data.get('nueva')

    archivos = [USUARIOS_FILE, EMPLEADOS_FILE]
    for archivo in archivos:
        lista = load_data(archivo)
        for u in lista:
            if u.get('usuario') == usuario and u.get('contrasena') == actual:
                u['contrasena'] = nueva
                save_data(archivo, lista)
                return jsonify({'ok': True, 'mensaje': 'Contraseña cambiada correctamente'})
    return jsonify({'ok': False, 'mensaje': 'Contraseña actual incorrecta'}), 400

if __name__ == '__main__':
    # Configuración para producción
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
