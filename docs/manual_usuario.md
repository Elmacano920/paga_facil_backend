# 📗 Manual de Usuario — PagaFácil
**Versión:** 1.0.0 · **Fecha:** Julio 2026 · **Proyecto:** Trabajo Final UNERG  
**URL de acceso:** https://pagafacil-frontend.onrender.com  

---

## 1. ¿Qué es PagaFácil?

**PagaFácil** es una plataforma digital B2B que transforma la relación entre empresas y empleados
en Venezuela al ofrecer acceso inmediato a adelantos salariales con un ecosistema completo de:

- 💳 **Adelantos salariales** — Solicita hasta el 50% de tu salario antes de la quincena
- ⭐ **Sistema de Reputación** — 5 niveles que premian tu historial de pagos
- 💎 **Tokens LTK** — Moneda de lealtad que se gana al usar la plataforma
- 💰 **Cashback** — Recupera un porcentaje de cada adelanto según tu tier
- 🗺️ **CriptoMapa** — Encuentra comercios que aceptan criptomonedas en Venezuela

---

## 2. Acceso al Sistema

### 2.1 URL del sistema

| Entorno | URL |
|---|---|
| **Producción** | https://pagafacil-frontend.onrender.com |
| **Backend API** | https://pagafacil-backend.onrender.com |
| **Local (demo)** | http://localhost:3001 |

### 2.2 Credenciales de demostración

| Campo | Valor |
|---|---|
| Usuario | `nestoe1235` |
| Rol | Owner / Administrador |
| Acceso | Todos los módulos |

---

## 3. Panel de Control (Dashboard)

Al ingresar al sistema, el usuario verá el **Panel de Control principal** con:

### 3.1 Tarjetas de Estadísticas

| Tarjeta | Descripción | Color |
|---|---|---|
| 🏢 **Empresas Activas** | Total de empresas registradas en la plataforma | Morado |
| 👥 **Empleados Activos** | Total de empleados con cuenta activa | Cyan |
| 💳 **Adelantos del Mes** | Número de adelantos procesados en el mes | Dorado |
| 💎 **Tokens LTK** | Total de tokens LTK en circulación | Verde |

> 💡 Los números se animan al cargar la página, contando desde cero hasta el valor actual.

### 3.2 Distribución de Reputación

Gráfico de barras horizontales que muestra cuántos empleados hay en cada nivel de reputación:

```
Elite    ████                          8%
Platino  ████████                      17%
Oro      ██████████████                29%
Plata    ███████████████               31%
Bronce   ███████                       15%
```

### 3.3 Actividad Reciente

Lista de los últimos 5 movimientos en la plataforma:
- Nombre del empleado
- Empresa
- Monto o tokens generados
- Tipo de actividad (adelanto, cashback, token)

### 3.4 Flujo de Tokens LTK (hoy)

| Tipo | Descripción |
|---|---|
| ✅ **Mint** | Tokens emitidos por cashback o reseñas |
| 🔴 **Burn** | Tokens quemados al canjear beneficios |
| 🔵 **Transfer** | Tokens transferidos entre wallets |

---

## 4. Módulo de Empresas

Acceso mediante la opción **"Empresas"** en la barra lateral.

### 4.1 Lista de Empresas

La pantalla muestra todas las empresas registradas con su:
- Nombre y RIF
- Ciudad sede
- Número de empleados
- Estado (Activo / Inactivo)
- Fecha de registro

### 4.2 Endpoint de la API

```
GET /companies          → Lista todas las empresas
GET /companies/:id      → Detalles de una empresa específica
```

---

## 5. Módulo de Empleados

### 5.1 Perfil del Empleado

Cada empleado tiene:
- Nombre completo y empresa
- Salario base
- Tier de reputación actual (con badge de color)
- Saldo de tokens LTK
- Historial de adelantos

### 5.2 Endpoint de la API

```
GET /employees          → Lista todos los empleados
GET /employees/:id      → Perfil detallado de un empleado
```

---

## 6. Módulo de Adelantos Salariales

### 6.1 ¿Cómo funciona un adelanto?

```
1. Empleado solicita adelanto
        ↓
2. Sistema verifica elegibilidad (salario, historial)
        ↓
3. Empresa aprueba la solicitud
        ↓
4. Transacción bancaria (Pago Móvil / Transferencia)
        ↓
5. Estado cambia a DISBURSED
        ↓
6. Empleado puede reclamar CASHBACK en las próximas 48h
```

### 6.2 Estados de un adelanto

| Estado | Descripción | Color |
|---|---|---|
| `PENDING` | Solicitud enviada, esperando aprobación | 🟡 Amarillo |
| `DISBURSED` | Adelanto pagado exitosamente | 🟢 Verde |
| `FAILED` | Solicitud rechazada o transacción fallida | 🔴 Rojo |

---

## 7. Módulo de Reputación

### 7.1 Los 5 Tiers de Reputación

| Tier | Rango de Score | Tasa Cashback | Ícono |
|---|---|---|---|
| **Elite** | 90 – 100 puntos | **15%** | ⚡ |
| **Platino** | 75 – 89 puntos | **12%** | 💠 |
| **Oro** | 50 – 74 puntos | **8%** | 🥇 |
| **Plata** | 25 – 49 puntos | **5%** | 🥈 |
| **Bronce** | 0 – 24 puntos | **2%** | 🥉 |

### 7.2 ¿Cómo se calcula el Score?

El score de reputación de un **empleado** se calcula con 5 factores:

| Factor | Peso | Descripción |
|---|---|---|
| Cantidad de reseñas | 30% | Número de reseñas escritas vs máximo esperado |
| Volumen de adelantos | 25% | Total USD solicitado históricamente |
| Antigüedad | 20% | Días desde el primer adelanto (máx. 365 días) |
| Utilidad de reseñas | 15% | Ratio de votos "útil" en las reseñas |
| Tasa de cashback | 10% | Porcentaje de adelantos con cashback reclamado |

El score de **empresa** se calcula con:

| Factor | Peso | Descripción |
|---|---|---|
| Promedio de reseñas | hasta 40% | Score ponderado por decaimiento temporal |
| Volumen de transacciones | 20% | Adelantos procesados |
| Antigüedad | 15% | Años en la plataforma |
| Tasa de cashback | 15% | Empleados que reclaman cashback |
| Tasa de desembolso | 10% | Adelantos aprobados vs rechazados |

### 7.3 Visualización en el dashboard

Los tiers se muestran como **anillos SVG animados** con el porcentaje cubierto
proporcional al score. Al pasar el cursor, se muestran los detalles del cálculo.

---

## 8. Módulo de Tokens LTK

**LTK (Loyalty Token)** es la moneda de lealtad de PagaFácil.

### 8.1 ¿Cómo ganar Tokens LTK?

| Acción | Tokens ganados | Descripción |
|---|---|---|
| Cashback reclamado | **+5 LTK** | Por cada adelanto con cashback exitoso |
| Reseña verificada | **+10 LTK** | Al publicar una reseña aprobada |
| Primer uso mensual | **+25 LTK** | Bonus en el primer cashback del mes |
| Subida de tier | **+50 LTK** | Al alcanzar nivel Platino o Elite |

### 8.2 ¿Cómo usar los Tokens?

Los tokens LTK se pueden:
- **Canjear** por beneficios exclusivos en empresas aliadas
- **Transferir** a otro empleado de la plataforma
- **Acumular** para subir de tier más rápido

### 8.3 Tarjeta de Wallet

En la sección Tokens LTK se muestra una **tarjeta holográfica** con:
- Saldo total de LTK
- Total acuñado (mint) histórico
- Total quemado (burn) histórico
- Número de wallets activas

### 8.4 Tipos de transacciones

| Tipo | Color | Descripción |
|---|---|---|
| `MINT` | 🟢 Verde | Emisión de nuevos tokens |
| `BURN` | 🔴 Rojo | Quema de tokens al canjear |
| `TRANSFER` | 🔵 Cyan | Transferencia entre wallets |

---

## 9. Módulo de Cashback

### 9.1 ¿Qué es el Cashback?

El cashback es un porcentaje del monto del adelanto que se **devuelve** al empleado
según su tier de reputación. El reclamo debe realizarse dentro de las **48 horas**
posteriores al desembolso.

### 9.2 Las 5 Condiciones de Validación

Para que un reclamo de cashback sea aprobado, el sistema valida **5 condiciones en orden**:

| # | Condición | Descripción |
|---|---|---|
| 1 | ✅ **Adelanto DISBURSED** | El adelanto debe estar en estado `DISBURSED` |
| 2 | ✅ **Transacción SUCCESS** | La transacción bancaria debe ser exitosa |
| 3 | ✅ **Ventana de 48h** | Máximo 48 horas desde el desembolso |
| 4 | ✅ **Sin doble reclamo** | Solo se puede reclamar una vez por adelanto |
| 5 | ✅ **Monto mínimo $1** | El adelanto debe ser de al menos $1 USD |

Si **cualquier condición falla**, el sistema responde con un error descriptivo
indicando cuál condición no se cumplió y por qué.

### 9.3 Ejemplo de Cashback

```
Empleado: Carlos Medina (Tier: Elite — 15%)
Adelanto: $350 USD
Cashback: $350 × 15% = $52.50 USD
Tokens:   +5 LTK base + 25 LTK bonus (primer uso del mes) = +30 LTK
```

### 9.4 Tasas de Cashback por Tier

| Tier | Rate | Ejemplo ($300) |
|---|---|---|
| Elite | 15% | $45.00 |
| Platino | 12% | $36.00 |
| Oro | 8% | $24.00 |
| Plata | 5% | $15.00 |
| Bronce | 2% | $6.00 |

---

## 10. Módulo de Reseñas

### 10.1 Dejar una reseña

Los empleados pueden evaluar empresas con:
- **Calificación:** 1 a 5 estrellas
- **Título:** Resumen breve
- **Cuerpo:** Descripción detallada de la experiencia
- Votos de utilidad (otros usuarios pueden votar si la reseña es útil)

### 10.2 Beneficios de las reseñas

- El empleado gana **+10 LTK** por cada reseña verificada
- Las reseñas influyen en el score de reputación **de la empresa** (peso 40%)
- Las reseñas tienen **decaimiento temporal**: las más recientes pesan más

---

## 11. CriptoMapa Venezuela 🗺️

### 11.1 ¿Qué muestra el mapa?

El CriptoMapa muestra en tiempo real los comercios de Venezuela que aceptan
criptomonedas, con su ubicación exacta, redes disponibles y estado de verificación.

**Ciudades cubiertas:** Caracas, Valencia, Maracaibo, Maracay, Barquisimeto, Mérida, San Juan de los Morros

### 11.2 Redes de pago aceptadas

| Red | Color del marcador |
|---|---|
| Binance Pay | 🟡 Dorado |
| Bitcoin / Lightning | 🟠 Naranja |
| Tron / USDT | 🔴 Rojo |
| USDT genérico | 🔵 Cyan |

### 11.3 Filtros disponibles

- **Todos** — Muestra todos los comercios
- **Binance Pay** — Solo comercios con Binance Pay
- **Tron** — Solo comercios en red Tron
- **Lightning** — Solo comercios con Bitcoin Lightning

### 11.4 Información de cada comercio

Al hacer clic en un marcador del mapa se muestra:
- Nombre del comercio
- Ciudad
- Redes de pago aceptadas
- Estado de verificación (✓ Verificado / Pendiente)

---

## 12. API REST — Referencia Completa

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/health` | Estado del servidor |
| `GET` | `/stats` | Estadísticas globales del sistema |
| `GET` | `/companies` | Lista todas las empresas |
| `GET` | `/companies/:id` | Detalle de una empresa |
| `GET` | `/employees` | Lista todos los empleados |
| `GET` | `/employees/:id` | Perfil de un empleado |
| `GET` | `/advances` | Lista de adelantos |
| `POST` | `/advances` | Solicitar nuevo adelanto |
| `GET` | `/cashback/claims` | Historial de reclamos de cashback |
| `POST` | `/cashback/claim` | Reclamar cashback de un adelanto |
| `GET` | `/cashback/stats` | Estadísticas de cashback |
| `GET` | `/cashback/employee/:id` | Cashback de un empleado |
| `GET` | `/reputation/scores` | Todos los scores de reputación |
| `GET` | `/reputation/employee/:id` | Score de un empleado |
| `POST` | `/reputation/calculate/employee/:id` | Recalcular score empleado |
| `POST` | `/reputation/calculate/company/:id` | Recalcular score empresa |
| `GET` | `/tokens/transactions` | Historial de transacciones LTK |
| `GET` | `/tokens/wallets` | Lista de wallets LTK |
| `GET` | `/tokens/wallet/:id` | Wallet de un empleado |
| `POST` | `/tokens/mint` | Emitir tokens (admin) |
| `GET` | `/reviews` | Lista de reseñas |
| `POST` | `/reviews` | Crear nueva reseña |

---

## 13. Preguntas Frecuentes

**¿Cuánto tiempo tarda en procesarse un adelanto?**  
El proceso es inmediato una vez aprobado por la empresa. El pago por Pago Móvil se acredita en minutos.

**¿Cuántas veces puedo reclamar cashback al mes?**  
Puedes reclamar cashback por cada adelanto diferente. Solo hay un límite: una vez por adelanto.

**¿Cómo subo de tier de reputación?**  
El sistema recalcula tu score automáticamente después de cada cashback o reseña. Si alcanzas el umbral de un tier superior, recibes +50 LTK de bonus.

**¿Los Tokens LTK tienen valor en dinero real?**  
Actualmente son tokens de lealtad dentro del ecosistema PagaFácil. En fases futuras se planea su conversión a beneficios monetarios.

**¿Qué pasa si no reclamo el cashback en 48 horas?**  
El sistema rechaza el reclamo y la ventana de cashback expira. Deberás esperar al siguiente adelanto.

**¿El CriptoMapa incluye toda Venezuela?**  
Actualmente cubre las principales ciudades. Puedes sugerir nuevos comercios al equipo de soporte.

---

*Manual elaborado para la defensa del Trabajo Final — UNERG · Julio 2026*
