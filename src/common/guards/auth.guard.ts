import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../../modules/users/users.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    // GET requests are public — no authentication required (read-only access)
    if (request.method === 'GET') {
      return true;
    }

    // All other methods (POST, PUT, PATCH, DELETE) require JWT authentication
    const cookies = request.headers.cookie;
    if (!cookies) {
      throw new UnauthorizedException('Acceso no autorizado: no se encontró la cookie de sesión');
    }

    const jwtCookie = cookies.split(';').find((c: string) => c.trim().startsWith('jwt='));
    if (!jwtCookie) {
      throw new UnauthorizedException('Acceso no autorizado: sesión inválida');
    }

    const token = jwtCookie.split('=')[1];
    if (!token) {
      throw new UnauthorizedException('Acceso no autorizado: token vacío');
    }

    try {
      const payload = this.jwtService.verify(token);
      const user = await this.usersService.findById(payload.sub);
      if (!user) {
        throw new UnauthorizedException('Acceso no autorizado: usuario no encontrado');
      }

      request.user = user;
      return true;
    } catch (err) {
      throw new UnauthorizedException('Acceso no autorizado: token expirado o inválido');
    }
  }
}