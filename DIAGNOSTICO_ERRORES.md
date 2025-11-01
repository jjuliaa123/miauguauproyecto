# 🔍 Diagnóstico de Errores

## Problemas Comunes y Soluciones

### ❌ Error: "Error al conectar con el servidor"

**Posibles causas:**

1. **El servidor no está corriendo en Render**
   - Verifica que el servicio esté "Live" en Render
   - Revisa los logs en Render para ver errores

2. **URL incorrecta en el frontend**
   - Verifica que `API_BASE` en `main.js` sea correcta
   - Debe ser: `https://miauguauproyecto.onrender.com` (o tu URL real)

3. **CORS bloqueado**
   - El código tiene `app.use(cors())` pero verifica que funcione

4. **Base de datos no conectada**
   - Revisa los logs en Render
   - Deberías ver: "✅ Conectado a MySQL correctamente"
   - Si ves error de conexión, verifica las variables de entorno

### ❌ Error al cargar gatitos

**Pasos para diagnosticar:**

1. **Abre la consola del navegador** (F12)
2. **Ve a la pestaña Network**
3. **Recarga la página**
4. **Busca la petición a `/api/cats`**
5. **Verifica:**
   - ¿La petición se hizo? (debería aparecer)
   - ¿Qué status code tiene? (200 = ok, 500 = error del servidor, 404 = no encontrado)
   - ¿Qué respuesta tiene? (click en la petición → Response)

### ❌ Error al enviar formulario

**Verifica:**

1. **En la consola del navegador** - ¿Hay errores?
2. **En los logs de Render** - ¿Qué dice el servidor?
3. **Variables de entorno** - ¿Están configuradas en Render?

## 🔧 Cómo Ver los Logs en Render

1. Ve a Render → Tu servicio
2. Pestaña **"Logs"**
3. Busca mensajes de error en rojo
4. Busca "✅ Conectado a MySQL correctamente"

## ✅ Checklist

- [ ] Servidor está "Live" en Render
- [ ] URL en `main.js` es correcta (`https://miauguauproyecto.onrender.com`)
- [ ] Variables de entorno configuradas en Render:
  - [ ] DB_HOST
  - [ ] DB_USER
  - [ ] DB_PASS
  - [ ] DB_NAME
- [ ] Logs muestran "✅ Conectado a MySQL correctamente"
- [ ] Base de datos tiene la tabla `cats`
- [ ] La tabla `cats` existe en Railway MySQL

## 🆘 Prueba la Conexión

Abre en el navegador:
```
https://miauguauproyecto.onrender.com/api/health
```

Deberías ver:
```json
{"status":"ok","database":"connected"}
```

Si ves "disconnected", el problema es la conexión a la base de datos.

