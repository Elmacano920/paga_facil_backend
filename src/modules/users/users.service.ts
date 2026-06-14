import { Injectable, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email },
      relations: ['employee', 'company'],
    });
  }

  async findById(id: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id },
      relations: ['employee', 'company'],
    });
  }

  async create(userData: Partial<User> & { password?: string }): Promise<User> {
    if (!userData.email) {
      throw new BadRequestException('El correo electrónico es obligatorio');
    }

    const existing = await this.findByEmail(userData.email);
    if (existing) {
      throw new ConflictException(`El correo electrónico ${userData.email} ya está registrado`);
    }

    const { password, ...rest } = userData;
    let passwordHash = rest.passwordHash;

    if (password) {
      const salt = await bcrypt.genSalt(10);
      passwordHash = await bcrypt.hash(password, salt);
    }

    const user = this.userRepository.create({
      ...rest,
      passwordHash,
    });

    return this.userRepository.save(user);
  }
}
