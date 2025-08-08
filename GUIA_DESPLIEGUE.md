# 🚀 Guía de Despliegue Web - Shalom Logística

## 📋 Requisitos Previos

- ✅ Cuenta de GitHub
- ✅ Código de la aplicación listo
- ✅ Archivos de configuración creados

## 🌐 Opción 1: Render (Recomendado - Gratis)

### Paso 1: Preparar el Repositorio

1. **Crea un repositorio en GitHub**:
   ```bash
   # En tu carpeta del proyecto
   git init
   git add .
   git commit -m "Primera versión de Shalom Logística"
   git branch -M main
   git remote add origin https://github.com/TU_USUARIO/shalom-logistica.git
   git push -u origin main
   ```

### Paso 2: Configurar Render

1. **Ve a [render.com](https://render.com)** y crea una cuenta
2. **Haz clic en "New Web Service"**
3. **Conecta tu repositorio de GitHub**
4. **Configura el servicio**:
   - **Name**: `shalom-logistica`
   - **Environment**: `Python`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn wsgi:app`
   - **Plan**: `Free`

### Paso 3: Variables de Entorno (Opcional)

En Render, puedes agregar variables de entorno:
- `PYTHON_VERSION`: `3.9.0`
- `FLASK_ENV`: `production`

### Paso 4: Desplegar

1. **Haz clic en "Create Web Service"**
2. **Espera a que termine el build** (5-10 minutos)
3. **Tu app estará disponible en**: `https://shalom-logistica.onrender.com`

## 🚄 Opción 2: Railway (Alternativa Gratis)

### Paso 1: Configurar Railway

1. **Ve a [railway.app](https://railway.app)**
2. **Conecta tu repositorio de GitHub**
3. **Railway detectará automáticamente** que es una app Python
4. **Se desplegará automáticamente**

### Paso 2: Configuración

Railway usará automáticamente:
- `requirements.txt` para las dependencias
- `Procfile` para el comando de inicio

## ☁️ Opción 3: Heroku (Pago pero Confiable)

### Paso 1: Instalar Heroku CLI

```bash
# Windows
# Descarga desde: https://devcenter.heroku.com/articles/heroku-cli

# macOS
brew tap heroku/brew && brew install heroku

# Linux
curl https://cli-assets.heroku.com/install.sh | sh
```

### Paso 2: Desplegar

```bash
# Login a Heroku
heroku login

# Crear app
heroku create shalom-logistica

# Configurar buildpacks
heroku buildpacks:set heroku/python

# Desplegar
git push heroku main

# Abrir la app
heroku open
```

## ⚡ Opción 4: Vercel (Alternativa)

### Paso 1: Configurar Vercel

1. **Ve a [vercel.com](https://vercel.com)**
2. **Conecta tu repositorio de GitHub**
3. **Vercel detectará** la configuración de `vercel.json`
4. **Se desplegará automáticamente**

## 🔧 Configuración de Dominio Personalizado

### Render
1. Ve a tu servicio en Render
2. **Settings** → **Custom Domains**
3. **Add Domain** y sigue las instrucciones

### Railway
1. Ve a tu proyecto en Railway
2. **Settings** → **Domains**
3. **Add Domain**

### Heroku
```bash
heroku domains:add www.tudominio.com
```

## 📊 Monitoreo y Logs

### Render
- **Logs**: Disponibles en la pestaña "Logs"
- **Métricas**: En la pestaña "Metrics"

### Railway
- **Logs**: En tiempo real en la consola
- **Métricas**: En el dashboard

### Heroku
```bash
# Ver logs
heroku logs --tail

# Ver métricas
heroku addons:open papertrail
```

## 🔒 Configuración de Seguridad

### Variables de Entorno Sensibles

En Render/Railway, configura:
```
ADMIN_PASSWORD=tu_password_seguro
SECRET_KEY=tu_clave_secreta_muy_larga
```

### HTTPS

- **Render**: HTTPS automático
- **Railway**: HTTPS automático
- **Heroku**: HTTPS automático

## 🚨 Solución de Problemas

### Error: "Build Failed"

1. **Verifica requirements.txt**:
   ```bash
   pip install -r requirements.txt
   ```

2. **Verifica la sintaxis de Python**:
   ```bash
   python -m py_compile PAGINA.py
   ```

### Error: "Application Error"

1. **Revisa los logs** en tu plataforma
2. **Verifica el comando de inicio**:
   ```bash
   gunicorn wsgi:app
   ```

### Error: "Module Not Found"

1. **Asegúrate de que todas las dependencias** estén en `requirements.txt`
2. **Verifica que no haya imports** de módulos locales faltantes

## 📈 Escalabilidad

### Render
- **Free**: 750 horas/mes
- **Paid**: Sin límites

### Railway
- **Free**: $5 de crédito/mes
- **Paid**: Sin límites

### Heroku
- **Hobby**: $7/mes
- **Professional**: $25/mes

## 🔄 Actualizaciones

### Despliegue Automático

Todas las plataformas soportan **despliegue automático**:
1. **Haz cambios** en tu código
2. **Commit y push** a GitHub
3. **Se desplegará automáticamente**

### Despliegue Manual

```bash
git add .
git commit -m "Nueva funcionalidad"
git push origin main
```

## 📞 Soporte

### Render
- **Documentación**: docs.render.com
- **Soporte**: support@render.com

### Railway
- **Documentación**: docs.railway.app
- **Discord**: railway.app/discord

### Heroku
- **Documentación**: devcenter.heroku.com
- **Soporte**: help.heroku.com

---

**¡Tu aplicación estará online en minutos!** 🎉

**URL de ejemplo**: `https://shalom-logistica.onrender.com`
