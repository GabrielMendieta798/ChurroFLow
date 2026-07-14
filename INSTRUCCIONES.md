# Sistema de Gestión - Churrería

## Para levantar el sistema

```bash
# 1. Entrar al directorio
cd churreria

# 2. Levantar todo con Docker (primera vez ~2 min)
docker compose up -d

# 3. Correr migraciones de base de datos (solo primera vez)
docker exec churreria_backend npx prisma migrate deploy
docker exec churreria_backend npx ts-node prisma/seed.ts

# 4. Abrir en el navegador
http://localhost:5173
```

## Usuario por defecto
- Email: admin@churreria.com
- Contraseña: admin123

## Módulos

| Módulo | Descripción |
|--------|-------------|
| Dashboard | Resumen del día: ventas, facturación, productos más vendidos, alertas stock |
| Punto de Venta | POS táctil para registrar ventas. Descuenta stock automáticamente |
| Ventas | Historial de ventas con filtros por fecha |
| Caja | Apertura, movimientos de ingreso/egreso, cierre con diferencia |
| Compras | Registro de compras a proveedores. Actualiza stock automáticamente |
| Stock | Stock actual, movimientos, ajustes manuales, pérdidas |
| Productos | ABM de productos con precio y categoría |
| Insumos | ABM de insumos con stock mínimo y alerta de bajo stock |
| Recetas | Asociar insumos + cantidades a cada producto |

## Circuito de trabajo
1. **Abrir caja** con el fondo inicial del día
2. **Registrar ventas** desde el POS (stock se descuenta solo)
3. **Registrar compras** cuando llegan insumos (stock sube solo)
4. **Ajustes manuales** si hay pérdidas o mermas
5. **Cerrar caja** ingresando el efectivo real

## API Backend
- Base URL: http://localhost:3000/api
- Todos los endpoints requieren header: `Authorization: Bearer <token>`
- POST /auth/login para obtener el token

## Para parar
```bash
docker compose down
```

## Para parar y borrar datos
```bash
docker compose down -v
```
