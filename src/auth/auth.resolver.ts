import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { Auth } from './entities/auth.entity';
import { Public } from './public.decorator';
import { LoginInput } from './dto/login.input';
import { TokenResponseDTO } from './dto/token-response-dto';
import { LocalAuthGuard } from './local-auth.guard';
import { UseGuards } from '@nestjs/common';

@Resolver(() => Auth)
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @UseGuards(LocalAuthGuard)
  @Mutation(() => TokenResponseDTO)
  async login(
    @Context() context,
    @Args('loginUserInput') loginUserInput: LoginInput,
  ) {
    return await this.authService.login(loginUserInput, context.req.user);
  }

  @Public()
  @Query(() => String, { name: 'publicRoute' })
  publicRoute() {
    return 'This route doesnt require JWT token ';
  }
}
