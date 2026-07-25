import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AppRole, ROLES_KEY } from './roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user as { role?: AppRole } | undefined;

    if (!user) return true;

    if (user.role === 'DEMO' && request.method !== 'GET') {
      throw new ForbiddenException('El modo demo es de solo lectura');
    }

    const requiredRoles = this.reflector.getAllAndOverride<AppRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles?.length || user.role === 'ADMIN') return true;
    if (user.role && requiredRoles.includes(user.role)) return true;

    throw new ForbiddenException('No tenés permisos para realizar esta acción');
  }
}
