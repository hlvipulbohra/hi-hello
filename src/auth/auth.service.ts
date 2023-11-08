import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UserResponseDTO } from 'src/users/dto/user-response-dto';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { TokenResponseDTO } from './dto/token-response-dto';
import { LoginInput } from './dto/login.input';

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, password: string) {
    const user = await this.userService.findByEmailWithPassword(username, true);
    if (!user) return null;
    const valid = await this.comparePasswords(password, user.password);
    delete user.password;
    if (valid) return user;
    else return null;
  }

  async comparePasswords(enteredPass: string, userPass: string) {
    try {
      return await bcrypt.compare(enteredPass, userPass);
    } catch (error) {
      throw error;
    }
  }
  async validateToken(token: string): Promise<UserResponseDTO> {
    try {
      if (!token) throw Error('Invalid token');
      token = token.split(' ')[1];
      const payload = await this.jwtService.verify(token);
      return await this.userService.findOneById(payload.id);
    } catch (error) {
      return null;
    }
  }

  async login(
    loginUserInput: LoginInput,
    user: UserResponseDTO,
  ): Promise<TokenResponseDTO> {
    try {
      const payload = { email: user.email, id: user._id };
      return {
        email: user.email,
        token: this.jwtService.sign(payload),
      };
    } catch (error) {
      throw error;
    }
  }
}
