# 📘 Manual de Instalación y Configuración — PagaFácil
**Versión:** 1.0.0 · **Fecha:** Julio 2026 · **Proyecto:** Trabajo Final UNERG  
**Repositorio:** https://github.com/Elmacano920/paga_facil_backend  
**Plataforma de producción:** https://render.com

---

## 1. Introducción al Sistema

**PagaFácil** es una plataforma B2B de adelantos salariales con ecosistema de reputación,
cashback y tokenización de lealtad (LTK). Está construida sobre las siguientes tecnologías:

| Capa | Tecnología |
|---|---|
| Backend | NestJS 11 + TypeScript 5 |
| Base de datos | PostgreSQL 15 vía TypeORM 0.3 |
| Autenticación | JWT (JSON Web Tokens) |
| Documentación API | Swagger / OpenAPI |
| Frontend | HTML5 + CSS3 + JavaScript (Vanilla) |
| Mapa interactivo | Leaflet.js |
| Contenedores | Docker + Docker Compose |
| CI/CD | GitLab CI / GitHub Actions |
| Nube | Render.com |

### Módulos del sistema

```
PagaFácil
├── Companies        → Gestión de empresas B2B
├── Employees        → Empleados por empresa
├── Advances         → Solicitudes de adelanto salarial
├── Payouts          → Transacciones y pagos
├── Auth             → Autenticación JWT
├── Users            → Usuarios del sistema
├── Reviews          → Sistema de reseñas verificadas
├── Reputation       → Motor de reputación (5 tiers)
├── Cashback         → Reclamos con 5 condiciones de validación
├── Tokens LTK       → Sistema de tokens de lealtad
└── CriptoMapa       → Mapa de comercios cripto en Venezuela
```

---

## 2. Requisitos Previos

Antes de instalar el sistema, asegúrese de tener los siguientes programas:

### 2.1 Herramientas necesarias

| Herramienta | Versión mínima | Cómo verificar | Descarga |
|---|---|---|---|
| **Node.js** | 22.x LTS | `node --version` | https://nodejs.org |
| **pnpm** | 8.x o superior | `pnpm --version` | `npm install -g pnpm` |
| **Git** | 2.40+ | `git --version` | https://git-scm.com |
| **Docker Desktop** | 4.x | `docker --version` | https://docker.com |
| **Docker Compose** | 2.x (incluido) | `docker compose version` | Incluido en Docker Desktop |

### 2.2 Puertos requeridos

| Puerto | Servicio | Descripción |
|---|---|---|
| `3001` | Backend NestJS | API REST principal |
| `5435` | PostgreSQL | Base de datos (mapeado desde 5432 interno) |
| `3001` | Frontend demo | Servidor Node.js de demostración |

### 2.3 Verificación del entorno

```bash
# Verificar todas las herramientas de una vez
node --version    # Debe mostrar v22.x.x
pnpm --version    # Debe mostrar 8.x o superior
git --version     # Debe mostrar 2.x.x
docker --version  # Debe mostrar Docker 4.x
```

---

## 3. Obtención del Código Fuente

### 3.1 Clonar desde GitHub

```bash
# Clonar el repositorio principal
git clone https://github.com/Elmacano920/paga_facil_backend.git

# Entrar al directorio
cd paga_facil_backend

# Verificar los archivos
ls -la
```

### 3.2 Estructura del proyecto clonado

```
paga_facil_backend/
├── src/
│   ├── app.module.ts              ← Módulo raíz
│   ├── main.ts                    ← Punto de entrada
│   ├── common/
│   │   └── database/
│   │       └── base.entity.ts     ← Entidad base con timestamps
│   └── modules/
│       ├── auth/                  ← Autenticación JWT
│       ├── users/                 ← Usuarios
│       ├── companies/             ← Empresas
│       ├── employees/             ← Empleados
│       ├── advances/              ← Adelantos salariales
│       ├── payouts/               ← Pagos y transacciones
│       ├── reviews/               ← Reseñas
│       ├── reputation/            ← Motor de reputación
│       ├── cashback/              ← Sistema de cashback
│       └── tokens/                ← Tokens LTK
├── frontend/
│   ├── index.html                 ← Dashboard premium
│   ├── style.css                  ← Estilos glassmorphism
│   ├── app.js                     ← Lógica del dashboard
│   └── server.js                  ← Servidor de demostración
├── criptomapa/
│   ├── index.html
│   ├── app.js
│   ├── style.css
│   └── data/comercios.json        ← 11 comercios cripto en Venezuela
├── docker-compose.yml             ← Orquestación local
├── Dockerfile                     ← Imagen de producción
├── render.yaml                    ← Configuración Render.com
├── package.json
└── pnpm-lock.yaml
```

---

## 4. Variables de Entorno

### 4.1 Crear archivo `.env`

```bash
# En la raíz del proyecto, crear el archivo de configuración
cp .env.example .env   # Si existe el ejemplo
# O crearlo manualmente:
```

```bash
# .env — Configuración local de desarrollo
DATABASE_HOST=localhost
DATABASE_PORT=5435
DATABASE_USER=postgres
DATABASE_PASSWORD=postgrespassword
DATABASE_NAME=paga_facil
DATABASE_SYNC=true
PORT=3001
NODE_ENV=development
JWT_SECRET=mi_secreto_super_seguro_cambia_esto_en_produccion
```

### 4.2 Tabla de variables de entorno

| Variable | Descripción | Valor por defecto | Requerida |
|---|---|---|---|
| `DATABASE_HOST` | Host del servidor PostgreSQL | `localhost` | ✅ |
| `DATABASE_PORT` | Puerto de PostgreSQL | `5435` | ✅ |
| `DATABASE_USER` | Usuario de la base de datos | `postgres` | ✅ |
| `DATABASE_PASSWORD` | Contraseña de la base de datos | `postgrespassword` | ✅ |
| `DATABASE_NAME` | Nombre de la base de datos | `paga_facil` | ✅ |
| `DATABASE_SYNC` | Sincronizar esquema automáticamente | `true` | ✅ |
| `PORT` | Puerto del servidor NestJS | `3001` | ✅ |
| `NODE_ENV` | Entorno de ejecución | `development` | ✅ |
| `JWT_SECRET` | Clave secreta para tokens JWT | *(generar)* | ✅ |

> ⚠️ **IMPORTANTE:** Nunca subas el archivo `.env` al repositorio. Está incluido en `.gitignore`.

---

## 5. Instalación Local con Docker *(Recomendado)*

Este método levanta automáticamente la base de datos PostgreSQL y el backend sin configuración adicional.

### 5.1 Levantar todos los servicios

```bash
# Construir las imágenes y levantar los contenedores en segundo plano
docker compose up --build -d
```

### 5.2 Verificar que los servicios están corriendo

```bash
# Ver el estado de los contenedores
docker compose ps
```

Salida esperada:
```
NAME                IMAGE               STATUS          PORTS
paga_facil          postgres:15-alpine  Up (healthy)    0.0.0.0:5435->5432/tcp
paga_facil_app      paga_facil_app      Up              0.0.0.0:3001->3001/tcp
```

### 5.3 Ver los logs del backend

```bash
# Ver logs en tiempo real
docker compose logs -f app

# Salida esperada:
# [Nest] LOG [NestFactory] Starting Nest application...
# [Nest] LOG [RoutesResolver] CompaniesController {/companies}
# [Nest] LOG [RoutesResolver] EmployeesController {/employees}
# ...
# [Nest] LOG [NestApplication] Nest application successfully started
```

### 5.4 Probar que el backend responde

```bash
# Windows PowerShell
Invoke-RestMethod http://localhost:3001/health

# Linux / macOS
curl http://localhost:3001/health

# Respuesta esperada:
# { "status": "ok", "timestamp": "2026-07-15T..." }
```

### 5.5 Detener los servicios

```bash
# Detener sin borrar datos
docker compose stop

# Detener y borrar contenedores (conserva volúmenes de datos)
docker compose down

# Detener y borrar todo incluyendo la base de datos
docker compose down -v
```

---

## 6. Instalación Local sin Docker

Si no tienes Docker instalado, puedes correr el proyecto directamente con Node.js,
pero necesitarás tener PostgreSQL instalado localmente.

### 6.1 Instalar dependencias

```bash
# Desde la raíz del proyecto
pnpm install
```

### 6.2 Compilar el proyecto

```bash
pnpm run build
```

### 6.3 Ejecutar el servidor

```bash
# Asegúrate de que las variables de entorno estén configuradas en .env
node dist/main
```

### 6.4 Modo desarrollo (con recarga automática)

```bash
pnpm run start:dev
```

---

## 7. Levantar el Frontend

El dashboard premium se sirve con un servidor Node.js sin dependencias externas.

```bash
# Entrar a la carpeta frontend
cd frontend

# Iniciar el servidor
node server.js
```

Salida esperada:
```
  ╔═══════════════════════════════════════════╗
  ║   ⚡ PagaFácil — Servidor de Demostración ║
  ╠═══════════════════════════════════════════╣
  ║   Frontend:  http://localhost:3001         ║
  ║   API REST:  http://localhost:3001/health  ║
  ╚═══════════════════════════════════════════╝
```

Abre tu navegador en: **http://localhost:3001**

---

## 8. Verificación del Sistema

### 8.1 Endpoints de verificación

```bash
# Health check
curl http://localhost:3001/health

# Estadísticas globales
curl http://localhost:3001/stats

# Lista de empresas
curl http://localhost:3001/companies

# Lista de empleados
curl http://localhost:3001/employees

# Reclamos de cashback
curl http://localhost:3001/cashback/claims

# Transacciones de tokens
curl http://localhost:3001/tokens/transactions
```

### 8.2 Swagger / Documentación interactiva

Si el backend NestJS completo está corriendo con Swagger habilitado:

```
http://localhost:3001/api
```

---

## 9. Despliegue en Render.com

### 9.1 Crear cuenta en Render

1. Ve a **https://render.com** y crea una cuenta gratuita
2. Conéctate con tu cuenta de **GitHub**

### 9.2 Crear la base de datos PostgreSQL

1. En el dashboard de Render → **New → PostgreSQL**
2. Configurar:
   - **Name:** `pagafacil-db`
   - **Database:** `paga_facil`
   - **User:** `pagafacil_user`
   - **Plan:** Free
3. Clic en **Create Database**
4. Anotar los datos de conexión que Render genera automáticamente

### 9.3 Crear el servicio backend

1. **New → Web Service**
2. Conectar el repositorio `Elmacano920/paga_facil_backend`
3. Configurar:
   - **Name:** `pagafacil-backend`
   - **Runtime:** Docker
   - **Branch:** `main`
   - **Plan:** Free
4. En **Environment Variables**, agregar:

| Variable | Valor |
|---|---|
| `DATABASE_HOST` | *(desde la BD de Render)* |
| `DATABASE_PORT` | `5432` |
| `DATABASE_USER` | *(desde la BD de Render)* |
| `DATABASE_PASSWORD` | *(desde la BD de Render)* |
| `DATABASE_NAME` | `paga_facil` |
| `DATABASE_SYNC` | `true` |
| `PORT` | `3001` |
| `NODE_ENV` | `production` |
| `JWT_SECRET` | *(generar string aleatorio largo)* |

5. Clic en **Create Web Service**
6. Render construye automáticamente la imagen Docker y despliega

### 9.4 Crear el servicio frontend

1. **New → Web Service**
2. Mismo repositorio, configurar:
   - **Name:** `pagafacil-frontend`
   - **Root Directory:** `frontend`
   - **Runtime:** Node
   - **Build Command:** `echo ok`
   - **Start Command:** `node server.js`
   - **Plan:** Free

### 9.5 URL pública resultante

Después del despliegue, Render asigna URLs como:
```
Backend:  https://pagafacil-backend.onrender.com
Frontend: https://pagafacil-frontend.onrender.com
```

---

## 10. Comandos Docker Útiles

```bash
# Ver logs de un servicio específico
docker compose logs app
docker compose logs postgres

# Reiniciar un servicio
docker compose restart app

# Entrar al contenedor del backend
docker exec -it paga_facil_app sh

# Entrar al contenedor de PostgreSQL
docker exec -it paga_facil psql -U postgres -d paga_facil

# Ver tablas de la base de datos
docker exec -it paga_facil psql -U postgres -d paga_facil -c "\dt"

# Ver el uso de recursos
docker stats
```

---

## 11. Solución de Problemas Comunes

### Problema: Puerto 3001 ya está en uso
```bash
# Windows: encontrar qué proceso usa el puerto
netstat -ano | findstr :3001
# Terminar el proceso por PID
taskkill /PID <numero_pid> /F
```

### Problema: Cannot connect to PostgreSQL
```bash
# Verificar que el contenedor está corriendo
docker compose ps
# Si no está corriendo:
docker compose up postgres -d
# Esperar el healthcheck (hasta 30 segundos)
```

### Problema: Error de compilación TypeScript
```bash
# Limpiar el build anterior y recompilar
rm -rf dist/
pnpm run build
```

### Problema: pnpm ERR_PNPM_IGNORED_BUILDS
```bash
# Usar el build directo de NestJS
.\node_modules\.bin\nest build
# o
npx nest build
```

### Problema: Módulo no encontrado en producción
```bash
# Verificar que las dependencias de producción están instaladas
pnpm install --prod
```

---

## 12. Información del Repositorio

| Campo | Valor |
|---|---|
| **GitHub** | https://github.com/Elmacano920/paga_facil_backend |
| **GitLab** | https://gitlab.com/paga_facil/backend |
| **Rama principal** | `main` |
| **Licencia** | MIT |
| **Tecnología principal** | NestJS + TypeORM + PostgreSQL |

---

*Manual elaborado para la defensa del Trabajo Final — UNERG · Julio 2026*
