import { PrismaClient, Categoria, UnidadMedida, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';

const prisma = new PrismaClient();

async function main() {
  // Admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@churreria.com' },
    update: {},
    create: {
      nombre: 'Administrador',
      email: 'admin@churreria.com',
      password: hashedPassword,
      role: Role.ADMIN,
    },
  });

  await prisma.user.upsert({
    where: { email: 'empleado@churreria.com' },
    update: {},
    create: {
      nombre: 'Empleado Demo',
      email: 'empleado@churreria.com',
      password: await bcrypt.hash('empleado123', 10),
      role: Role.EMPLEADO,
    },
  });

  await prisma.user.upsert({
    where: { email: 'demo@churroflow.app' },
    update: { role: Role.DEMO, activo: true },
    create: {
      nombre: 'Visitante Demo',
      email: 'demo@churroflow.app',
      password: await bcrypt.hash(randomBytes(48).toString('hex'), 10),
      role: Role.DEMO,
    },
  });

  // Insumos
  const harina = await prisma.insumo.upsert({
    where: { id: 'insumo-harina' },
    update: {},
    create: {
      id: 'insumo-harina',
      nombre: 'Harina',
      unidad: UnidadMedida.GRAMO,
      stockActual: 5000,
      stockMinimo: 1000,
      costoUnitario: 0.003,
    },
  });

  const aceite = await prisma.insumo.upsert({
    where: { id: 'insumo-aceite' },
    update: {},
    create: {
      id: 'insumo-aceite',
      nombre: 'Aceite',
      unidad: UnidadMedida.MILILITRO,
      stockActual: 3000,
      stockMinimo: 500,
      costoUnitario: 0.005,
    },
  });

  const dulceDeleche = await prisma.insumo.upsert({
    where: { id: 'insumo-ddl' },
    update: {},
    create: {
      id: 'insumo-ddl',
      nombre: 'Dulce de leche',
      unidad: UnidadMedida.GRAMO,
      stockActual: 2000,
      stockMinimo: 300,
      costoUnitario: 0.012,
    },
  });

  const azucar = await prisma.insumo.upsert({
    where: { id: 'insumo-azucar' },
    update: {},
    create: {
      id: 'insumo-azucar',
      nombre: 'Azúcar',
      unidad: UnidadMedida.GRAMO,
      stockActual: 3000,
      stockMinimo: 500,
      costoUnitario: 0.002,
    },
  });

  const chocolate = await prisma.insumo.upsert({
    where: { id: 'insumo-chocolate' },
    update: {},
    create: {
      id: 'insumo-chocolate',
      nombre: 'Chocolate',
      unidad: UnidadMedida.GRAMO,
      stockActual: 1000,
      stockMinimo: 200,
      costoUnitario: 0.02,
    },
  });

  await prisma.insumo.upsert({
    where: { id: 'insumo-envases' },
    update: {},
    create: {
      id: 'insumo-envases',
      nombre: 'Envases',
      unidad: UnidadMedida.UNIDAD,
      stockActual: 200,
      stockMinimo: 50,
      costoUnitario: 5,
    },
  });

  // Proveedor demo
  await prisma.proveedor.upsert({
    where: { id: 'proveedor-demo' },
    update: {},
    create: {
      id: 'proveedor-demo',
      nombre: 'Distribuidora Central',
      contacto: 'Juan García',
      telefono: '11-1234-5678',
    },
  });

  // Productos
  const churroSimple = await prisma.producto.upsert({
    where: { id: 'prod-churro-simple' },
    update: {},
    create: {
      id: 'prod-churro-simple',
      nombre: 'Churro Simple',
      precio: 350,
      categoria: Categoria.CHURRO,
    },
  });

  const churroDdl = await prisma.producto.upsert({
    where: { id: 'prod-churro-ddl' },
    update: {},
    create: {
      id: 'prod-churro-ddl',
      nombre: 'Churro Relleno Dulce de Leche',
      precio: 500,
      categoria: Categoria.CHURRO,
    },
  });

  const churroChocolate = await prisma.producto.upsert({
    where: { id: 'prod-churro-choco' },
    update: {},
    create: {
      id: 'prod-churro-choco',
      nombre: 'Churro Relleno Chocolate',
      precio: 550,
      categoria: Categoria.CHURRO,
    },
  });

  const docena = await prisma.producto.upsert({
    where: { id: 'prod-docena' },
    update: {},
    create: {
      id: 'prod-docena',
      nombre: 'Docena de Churros',
      precio: 3500,
      categoria: Categoria.DOCENA,
    },
  });

  await prisma.producto.upsert({
    where: { id: 'prod-cafe' },
    update: {},
    create: {
      id: 'prod-cafe',
      nombre: 'Café con Leche',
      precio: 600,
      categoria: Categoria.CAFE,
    },
  });

  const comboChurrosCafe = await prisma.producto.upsert({
    where: { id: 'prod-combo-1' },
    update: {},
    create: {
      id: 'prod-combo-1',
      nombre: 'Combo 2 Churros + Café',
      precio: 1100,
      categoria: Categoria.COMBO,
    },
  });

  await prisma.producto.upsert({
    where: { id: 'prod-gaseosa' },
    update: {},
    create: {
      id: 'prod-gaseosa',
      nombre: 'Gaseosa 500ml',
      precio: 700,
      categoria: Categoria.BEBIDA,
    },
  });

  // Recetas
  const recetaChurroSimple = await prisma.receta.upsert({
    where: { productoId: churroSimple.id },
    update: {},
    create: {
      productoId: churroSimple.id,
      items: {
        create: [
          { insumoId: harina.id, cantidad: 80 },
          { insumoId: aceite.id, cantidad: 15 },
          { insumoId: azucar.id, cantidad: 10 },
        ],
      },
    },
  });

  await prisma.receta.upsert({
    where: { productoId: churroDdl.id },
    update: {},
    create: {
      productoId: churroDdl.id,
      items: {
        create: [
          { insumoId: harina.id, cantidad: 80 },
          { insumoId: aceite.id, cantidad: 15 },
          { insumoId: dulceDeleche.id, cantidad: 25 },
          { insumoId: azucar.id, cantidad: 10 },
        ],
      },
    },
  });

  await prisma.receta.upsert({
    where: { productoId: churroChocolate.id },
    update: {},
    create: {
      productoId: churroChocolate.id,
      items: {
        create: [
          { insumoId: harina.id, cantidad: 80 },
          { insumoId: aceite.id, cantidad: 15 },
          { insumoId: chocolate.id, cantidad: 25 },
          { insumoId: azucar.id, cantidad: 10 },
        ],
      },
    },
  });

  await prisma.receta.upsert({
    where: { productoId: docena.id },
    update: {},
    create: {
      productoId: docena.id,
      items: {
        create: [
          { insumoId: harina.id, cantidad: 960 },
          { insumoId: aceite.id, cantidad: 180 },
          { insumoId: azucar.id, cantidad: 120 },
        ],
      },
    },
  });

  console.log('Seed completado. Usuario admin: admin@churreria.com / admin123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
