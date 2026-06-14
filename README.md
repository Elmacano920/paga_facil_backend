# 💸 SueldoAlDía (PagaFácil) - API de Adelanto de Nómina B2B

SueldoAlDía es una plataforma backend moderna de tecnología financiera (FinTech) que permite a empleados de empresas afiliadas solicitar adelantos de su sueldo acumulado quincenal bajo demanda. 

Desarrollado con **NestJS**, **TypeORM** y **PostgreSQL**, el sistema está diseñado bajo estrictos principios de consistencia transaccional (ACID) y control de concurrencia para evitar problemas de sobregiro o doble gasto.

---

## 🚀 Características Principales

* **Transacciones ACID y Bloqueo Pesimista:** Control robusto de concurrencia usando bloqueo pesimista de escritura (`FOR UPDATE` en SQL) tanto a nivel de empleado como de empresa B2B de forma separada para evitar condiciones de carrera al actualizar saldos y deducciones.
* **Cálculo Dinámico de Cupo Disponible:** Determina el acumulado quincenal exacto basado en días transcurridos dentro del período de corte actual (períodos del 1 al 15 y del 16 al fin de mes), descontando los adelantos activos del período actual y la comisión fija.
* **Desembolso por Pago Móvil:** Simulación de API bancaria externa de Pago Móvil con tasa de fallo configurable para probar la reversión automática de transacciones (Rollbacks).
* **Manejo de Errores Limpio:** Filtro global de excepciones de base de datos que intercepta errores de PostgreSQL (ej. cédulas o RIF duplicados) y devuelve respuestas HTTP formateadas y amigables.
* **Documentación con Swagger:** Especificación OpenAPI interactiva disponible directamente al levantar el servidor.
* **Semillero de Datos (Seeder):** Población automática de empresas y empleados de prueba al iniciar si la base de datos se encuentra vacía.
* **Fácil de Importar:** Colección de Insomnia lista para importar y probar la API.

---

## 🛠️ Requisitos Previos

* **Node.js** (v20 o superior recomendado)
* **Docker** y **Docker Compose**
* **pnpm** (o npm / yarn)

---

## ⚙️ Configuración del Entorno (`.env`)

Crea un archivo `.env` en la raíz del proyecto basándote en el archivo `.env.example`:

```env
# Servidor
PORT=3001
NODE_ENV=development

# Base de Datos (Conexión local / externa al contenedor)
DATABASE_HOST=localhost
DATABASE_PORT=5435
DATABASE_USER=postgres
DATABASE_PASSWORD=postgrespassword
DATABASE_NAME=paga_facil
DATABASE_SYNC=true

# Lógica del Negocio
FIXED_FEE=2.00
PAYOUT_FAIL_RATE=0.10
```

---

## 🐳 Despliegue con Docker (Recomendado)

El despliegue está configurado para un entorno de compilación **offline** (debido a posibles restricciones de red del daemon de Docker):

1. **Instala las dependencias localmente** en el host para generar la carpeta `node_modules` y el lockfile:
   ```bash
   pnpm install
   ```
2. **Levanta la infraestructura** con Docker Compose:
   ```bash
   sudo docker compose up --build
   ```
   * *La base de datos PostgreSQL del contenedor se mapea en el puerto **`5435`** del host.*
   * *La aplicación se expone en el puerto **`3001`** del host.*

---

## 📖 Documentación de la API (Swagger)

Una vez iniciado el servidor, puedes acceder a la documentación interactiva en:
👉 **[http://localhost:3001/api/docs](http://localhost:3001/api/docs)**

Ahí podrás visualizar los modelos de datos, parámetros de entrada, esquemas DTO y probar los endpoints interactivamente.

---

## 📌 Endpoints de la API

### 🏢 Empresas (`companies`)
* `POST /companies` - Registrar una nueva empresa afiliada B2B.
* `GET /companies` - Listar todas las empresas.
* `GET /companies/:id` - Obtener información detallada de una empresa.
* `POST /companies/:id/deposit` - Depositar fondos para el balance de nómina de la empresa.

### 👤 Empleados (`employees`)
* `POST /employees` - Registrar un empleado.
* `GET /employees` - Listar todos los empleados y sus empresas.
* `GET /employees/:id` - Obtener un empleado por ID.
* `GET /employees/:id/payroll-status` - Consultar días trabajados, acumulado quincenal, comisiones deducidas y cupo de adelanto disponible. *(Opcionalmente pasa el query param `?date=YYYY-MM-DD` para simular otra fecha).*

### 💰 Adelantos (`advances`)
* `POST /advances` - Solicitar un adelanto de nómina. *(Aplica bloqueo de filas para el empleado y la empresa, descuenta saldo, solicita pago móvil, y confirma o revierte según el resultado del banco).*
* `GET /advances` - Listar el historial de adelantos solicitados con su estado y transacción.
* `GET /advances/:id` - Obtener un adelanto individual por ID.

---

## 🧪 Pruebas de Concurrencia y Doble Gasto

Para verificar la seguridad ante condiciones de carrera (por ejemplo, si un empleado envía dos solicitudes idénticas al mismo milisegundo para intentar retirar el doble de su cupo disponible):

1. Configura el script ubicado en la carpeta del proyecto en el host.
2. Ejecuta el comando de verificación de concurrencia:
   ```bash
   npx ts-node src/../test-concurrency.ts
   ```
El script enviará peticiones simultáneas paralelas y validará que solo una de ellas sea procesada con éxito (`201 Created`), mientras que la otra será rechazada de manera segura (`400 Bad Request` debido a cupo insuficiente) gracias al bloqueo pesimista en base de datos.

---

## 📬 Pruebas con Insomnia

Puedes importar la colección completa de peticiones a Insomnia para probar localmente de inmediato:
* **Archivo de colección:** [`insomnia.yaml`](./insomnia.yaml)

#### Pasos para importar:
1. Abre **Insomnia**.
2. Haz clic en **Import** -> **File**.
3. Selecciona el archivo `insomnia.yaml` ubicado en la raíz del proyecto.
4. Selecciona el entorno `Base Environment` para usar la variable `base_url` automáticamente.
