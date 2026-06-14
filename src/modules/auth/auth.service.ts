import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) { }

  async register(registerDto: RegisterDto): Promise<User> {
    if (registerDto.role === 'employee' && !registerDto.employeeId) {
      throw new BadRequestException('Se requiere un employeeId para los usuarios con rol employee');
    }
    if (registerDto.role === 'company_admin' && !registerDto.companyId) {
      throw new BadRequestException('Se requiere un companyId para los usuarios con rol company_admin');
    }

    return this.usersService.create({
      email: registerDto.email,
      password: registerDto.password,
      role: registerDto.role,
      employeeId: registerDto.employeeId || null,
      companyId: registerDto.companyId || null,
    });
  }

  async validateUser(loginDto: LoginDto): Promise<User> {
    const user = await this.usersService.findByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const isMatch = await bcrypt.compare(loginDto.password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    return user;
  }

  async login(user: User): Promise<{ token: string; user: any }> {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const token = this.jwtService.sign(payload);

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        employeeId: user.employeeId,
        companyId: user.companyId,
      },
    };
  }
}
