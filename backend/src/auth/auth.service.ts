import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService
  ) {}

  async signup(createUserDto: CreateUserDto) {
    const { username, email, password } = createUserDto;

    const existingEmail = await this.usersService.findByEmail(email);
if (existingEmail) {
  throw new BadRequestException('Email already exists');
}

const existingUsername = await this.usersService.findByUsername(username);
if (existingUsername) {
  throw new BadRequestException('Username already exists');
}

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.usersService.create({
      username,
      email,
      password: hashedPassword,
    });

    const token = this.generateToken(user);

    return { message: 'User created successfully', token };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = this.generateToken(user);

    return { message: 'Login successful', token };
  }

  private generateToken(user: any) {
    const payload = {
      sub: user._id,
      email: user.email,
    };

    return this.jwtService.sign(payload);
  }
}