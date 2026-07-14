# ChurroFlow

**ChurroFlow** es un sistema full-stack de gestión desarrollado para centralizar las operaciones de una churrería y evolucionar hacia una plataforma integral para la producción y distribución de churros congelados.

El proyecto nace a partir de un caso de uso real y busca gestionar, en una misma plataforma, productos, materias primas, recetas, ventas, compras, stock, caja y proveedores.

Actualmente se encuentra en su primera versión funcional (**MVP**).

---

## Estado actual

### `v0.1.0-mvp`

El MVP incluye:

- Autenticación de usuarios mediante JWT.
- Gestión de productos.
- Gestión de insumos.
- Gestión de proveedores.
- Gestión de recetas.
- Registro de ventas.
- Descuento automático de stock según recetas.
- Registro de compras.
- Actualización automática de stock mediante compras.
- Gestión de movimientos y ajustes de stock.
- Registro de pérdidas.
- Apertura y cierre de caja.
- Movimientos de caja.
- Historial de caja.
- Dashboard con indicadores del negocio.
- Interfaz de punto de venta.
- Entorno completo ejecutable con Docker Compose.

---

## Funcionalidades

### Autenticación

El sistema cuenta con autenticación para restringir el acceso al panel administrativo.

### Productos

Permite administrar los productos comercializados por el negocio.

Ejemplos:

- Churro simple.
- Churro relleno de dulce de leche.
- Churro relleno de chocolate.
- Docena de churros.

### Insumos

Permite registrar y controlar las materias primas utilizadas en la producción.

Ejemplos:

- Harina.
- Aceite.
- Azúcar.
- Dulce de leche.
- Chocolate.

También permite detectar insumos con bajo stock.

### Recetas

Cada producto puede tener una receta asociada con los insumos y cantidades necesarias para su elaboración.

Ejemplo:

```text
Churro relleno de dulce de leche

- Harina: 80 g
- Aceite: 15 ml
- Dulce de leche: 25 g
- Azúcar: 10 g
```

Las recetas permiten automatizar los movimientos de inventario.

### Punto de venta

El sistema incluye una interfaz para registrar ventas desde el local.

Permite:

- Seleccionar productos.
- Agregar productos al carrito.
- Registrar cantidades.
- Seleccionar métodos de pago.
- Confirmar ventas.

### Ventas y stock automático

Al registrar una venta, el sistema utiliza la receta del producto para calcular y descontar automáticamente los insumos correspondientes.

```text
Venta
  ↓
Consulta de receta
  ↓
Cálculo de insumos utilizados
  ↓
Actualización automática del stock
```

### Compras

Permite registrar compras de insumos a proveedores.

Al confirmar una compra:

```text
Compra
  ↓
Ingreso de insumos
  ↓
Actualización automática del stock
```

### Stock

El sistema permite:

- Consultar existencias.
- Registrar movimientos.
- Realizar ajustes manuales.
- Registrar pérdidas.
- Consultar el historial de movimientos.

### Caja

Incluye funcionalidades para:

- Abrir caja.
- Registrar movimientos.
- Cerrar caja.
- Comparar el monto esperado con el monto real.
- Consultar el historial de cierres.

### Dashboard

El dashboard muestra información general del negocio y permite visualizar rápidamente el estado de las operaciones.

---

## Arquitectura

ChurroFlow utiliza una arquitectura full-stack separada en frontend, backend y base de datos.

```text
┌─────────────────────────────┐
│       React + Vite          │
│          Frontend           │
└──────────────┬──────────────┘
               │
               │ HTTP / JSON
               ▼
┌─────────────────────────────┐
│          NestJS             │
│          Backend            │
│                             │
│  Auth                       │
│  Productos                  │
│  Insumos                    │
│  Recetas                    │
│  Ventas                     │
│  Compras                    │
│  Stock                      │
│  Caja                       │
│  Proveedores                │
│  Dashboard                  │
└──────────────┬──────────────┘
               │
               │ Prisma ORM
               ▼
┌─────────────────────────────┐
│        PostgreSQL           │
│       Base de datos         │
└─────────────────────────────┘
```

La aplicación se ejecuta mediante Docker Compose.

---

## Tecnologías

### Backend

- NestJS
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT

### Frontend

- React
- Vite
- TypeScript
- Tailwind CSS

### Infraestructura

- Docker
- Docker Compose

---

## Estructura del proyecto

```text
ChurroFlow/
│
├── backend/
│   ├── prisma/
│   │   ├── migrations/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   │
│   ├── src/
│   │   ├── auth/
│   │   ├── caja/
│   │   ├── compras/
│   │   ├── dashboard/
│   │   ├── insumos/
│   │   ├── productos/
│   │   ├── proveedores/
│   │   ├── recetas/
│   │   ├── stock/
│   │   ├── users/
│   │   └── ventas/
│   │
│   └── Dockerfile
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── store/
│   │   └── types/
│   │
│   └── Dockerfile
│
├── docker-compose.yml
└── README.md
```

---

## Ejecutar el proyecto

### Requisitos

Necesitás tener instalado:

- Docker
- Docker Compose

### 1. Clonar el repositorio

```bash
git clone https://github.com/GabrielMendieta798/ChurroFlow.git
```

```bash
cd ChurroFlow
```

### 2. Configurar las variables de entorno

Creá y configurá el archivo `.env` necesario para el entorno local.

> Los archivos `.env` no se versionan en Git para evitar publicar credenciales o información sensible.

### 3. Levantar los servicios

```bash
docker compose up -d --build
```

Esto levanta:

- PostgreSQL.
- Backend NestJS.
- Frontend React.

### 4. Ejecutar las migraciones

```bash
docker exec churreria_backend npx prisma migrate deploy
```

### 5. Cargar los datos iniciales

```bash
docker exec churreria_backend npx ts-node prisma/seed.ts
```

### 6. Abrir la aplicación

```text
http://localhost:5173
```

---

## Comandos útiles

### Levantar el proyecto

```bash
docker compose up -d
```

### Reconstruir después de cambios importantes

```bash
docker compose up -d --build
```

### Ver los contenedores activos

```bash
docker ps
```

### Ver logs

```bash
docker compose logs -f
```

### Detener el proyecto

```bash
docker compose down
```

---

## Roadmap

El objetivo de ChurroFlow es evolucionar desde un sistema de gestión para un punto de venta hacia una plataforma integral para una empresa fabricante y distribuidora de churros congelados.

### Próxima etapa

- Gestión de clientes B2B.
- Múltiples direcciones de entrega.
- Listas de precios.
- Precios personalizados por tipo de cliente.
- Órdenes de producción.
- Consumo automático de materias primas.
- Stock de productos terminados.
- Gestión de pedidos mayoristas.
- Estados de preparación y entrega.
- Repartos por zonas.
- Cuenta corriente.
- Pagos parciales.
- Saldos pendientes.
- Nuevos indicadores y reportes.

### Futuras integraciones

- Portal web para clientes.
- Catálogo de productos con imágenes y precios.
- Carrito de compras.
- Pedidos online.
- Seguimiento del estado de pedidos.
- Pagos online.
- Integración con Mercado Pago.
- Automatizaciones mediante WhatsApp.
- Notificaciones de pedidos y entregas.
- Integración con mapas.
- Gestión y optimización de rutas de reparto.

---

## Visión del proyecto

El objetivo final es conectar en una misma plataforma todo el flujo operativo del negocio:

```text
Compra de materias primas
        ↓
Producción
        ↓
Stock de productos terminados
        ↓
Pedidos B2B
        ↓
Preparación
        ↓
Distribución y reparto
        ↓
Entrega
        ↓
Cobro y cuenta corriente
```

A futuro, los clientes podrán realizar sus propios pedidos desde un portal web conectado directamente con el sistema de gestión.

---

## Desarrollo

Proyecto desarrollado como aplicación full-stack y construido a partir de un caso de uso real.

El desarrollo continúa de forma incremental, priorizando reglas de negocio, trazabilidad de operaciones y automatización de procesos.

---

## Autor

**Gabriel Mendieta**

GitHub: [@GabrielMendieta798](https://github.com/GabrielMendieta798)

---

## Versión

**v0.1.0-mvp**

Primera versión funcional de ChurroFlow.