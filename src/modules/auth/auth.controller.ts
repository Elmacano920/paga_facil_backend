import { Controller, Post, Get, Body, Res, UseGuards, Req, HttpStatus } from '@nestjs/common';
import type { Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '../../common/guards/auth.guard';
import { CurrentUser } from '../../common/decorators/user.decorator';
import { User } from '../users/entities/user.entity';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) { }

  @Post('register')
  @ApiOperation({ summary: 'Registrar un nuevo usuario (empleado, admin de empresa, superadmin)' })
  @ApiResponse({ status: 201, description: 'Usuario creado exitosamente.' })
  @ApiResponse({ status: 400, description: 'Datos inválidos.' })
  @ApiResponse({ status: 409, description: 'El correo electrónico ya está registrado.' })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Iniciar sesión y obtener cookie de sesión HttpOnly JWT' })
  @ApiResponse({ status: 200, description: 'Sesión iniciada exitosamente.' })
  @ApiResponse({ status: 401, description: 'Credenciales inválidas.' })
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const user = await this.authService.validateUser(loginDto);
    const loginResult = await this.authService.login(user);

    const isProd = this.configService.get<string>('NODE_ENV') === 'production';

    response.cookie('jwt', loginResult.token, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      path: '/',
      maxAge: 1 * 60 * 60 * 1000, // 3 horas
    });

    return {
      message: 'Sesión iniciada correctamente',
      user: loginResult.user,
    };
  }

  @Post('logout')
  @ApiOperation({ summary: 'Cerrar sesión e invalidar la cookie JWT' })
  @ApiResponse({ status: 200, description: 'Sesión cerrada exitosamente.' })
  async logout(@Res({ passthrough: true }) response: Response) {
    response.cookie('jwt', '', {
      httpOnly: true,
      path: '/',
      expires: new Date(0),
    });

    return {
      message: 'Sesión cerrada correctamente',
    };
  }

  @Get('me')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Obtener información del usuario autenticado actual' })
  @ApiResponse({ status: 200, description: 'Detalles del usuario retornado.' })
  @ApiResponse({ status: 401, description: 'No autenticado.' })
  getProfile(@CurrentUser() user: User) {
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      employeeId: user.employeeId,
      companyId: user.companyId,
      employee: user.employee,
      company: user.company,
    };
  }
}
