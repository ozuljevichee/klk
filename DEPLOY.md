# Despliegue en Cloudflare Pages + D1

## 1. Instalar Wrangler

```bash
npm install -g wrangler
wrangler login
```

## 2. Crear la base de datos D1

```bash
wrangler d1 create patagonia-circular-db
```

Copia el `database_id` que te devuelve y reemplázalo en `wrangler.toml`:
```toml
database_id = "PEGA_AQUI_TU_ID"
```

## 3. Crear el bucket R2 para imágenes

```bash
wrangler r2 bucket create patagonia-circular-images
```

## 4. Aplicar el esquema SQL

```bash
wrangler d1 execute patagonia-circular-db --file=./schema.sql
```

## 5. Construir y desplegar

```bash
npm run build
wrangler pages deploy dist --project-name=patagonia-circular
```

## 6. Vincular D1 y R2 al proyecto Pages

En el dashboard de Cloudflare:
1. Ve a **Pages → patagonia-circular → Settings → Functions**
2. En **D1 database bindings** → agrega `DB` → selecciona `patagonia-circular-db`
3. En **R2 bucket bindings** → agrega `IMAGES` → selecciona `patagonia-circular-images`

## Notas

- El usuario administrador inicial es `admin` / `1234`
- Las sesiones duran 8 horas
- Las imágenes base64 (fotos de perfil, adjuntos) se guardan en D1 directamente
