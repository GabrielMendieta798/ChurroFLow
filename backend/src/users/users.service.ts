import { BadRequestException, Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.user.findMany({
      select: { id: true, nombre: true, email: true, role: true, activo: true, createdAt: true },
    });
  }

  async create(dto: CreateUserDto) {
    if (dto.role === 'DEMO') {
      throw new BadRequestException('El perfil DEMO se administra desde la configuración del sistema');
    }
    const exists = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (exists) throw new ConflictException('El email ya está registrado');
    const hashed = await bcrypt.hash(dto.password, 10);
    return this.prisma.user.create({
      data: { ...dto, password: hashed },
      select: { id: true, nombre: true, email: true, role: true, activo: true, createdAt: true },
    });
  }

  async toggleActivo(id: string) {
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id } });
    return this.prisma.user.update({
      where: { id },
      data: { activo: !user.activo },
      select: { id: true, nombre: true, activo: true },
    });
  }
}
