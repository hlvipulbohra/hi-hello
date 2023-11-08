import { Resolver, Query, Mutation, Args, Int, Context } from '@nestjs/graphql';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserInput } from './dto/update-user.input';
import { UserResponseDTO } from './dto/user-response-dto';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { HttpStatus, Inject } from '@nestjs/common';
import { GraphQLError } from 'graphql';
import { Public } from 'src/auth/public.decorator';

@Resolver(() => User)
export class UsersResolver {
  constructor(
    private readonly usersService: UsersService,
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
  ) {}

  @Public()
  @Mutation(() => UserResponseDTO)
  async createUser(@Args('createUserInput') createUserInput: CreateUserInput) {
    try {
      return await this.usersService.create(createUserInput);
    } catch (error) {
      throw error;
    }
  }

  @Mutation(() => UserResponseDTO)
  async updateUser(
    @Context() context,
    @Args('id') id: string,
    @Args('updateUserInput') updateUserInput: UpdateUserInput,
  ): Promise<UserResponseDTO> {
    try {
      // authorization - only logged in user cannot update details of other users
      if (context.req.user._id.toString() !== id)
        throw new GraphQLError('Not authorized', {
          extensions: {
            code: HttpStatus.UNAUTHORIZED,
          },
        });
      const user = await this.usersService.update(id, updateUserInput);
      //updating cache
      if (user) await this.cacheManager.set(id.toString(), user, 10);
      return user;
    } catch (error) {
      throw error;
    }
  }

  @Mutation(() => String)
  async removeUser(@Context() context, @Args('id') id: string) {
    try {
      // authorization only logged in user cannot delete other users
      if (context.req.user._id.toString() !== id)
        throw new GraphQLError('Not authorized', {
          extensions: {
            code: HttpStatus.UNAUTHORIZED,
          },
        });
      const res = await this.usersService.remove(id);
      //removing user from cache
      await this.cacheManager.del(id.toString());
      if (res) return 'deleted user with id ' + id;
      else return null;
    } catch (error) {
      throw error;
    }
  }

  @Query(() => [UserResponseDTO], { name: 'allUsers' })
  async findAll(
    @Args({ name: 'startId', nullable: true }) startId: string,
    @Args({ name: 'skip', nullable: true }) skip: number,
    @Args({ name: 'limit', nullable: true }) limit: number,
  ) {
    try {
      if (!skip) skip = 0;
      if (!limit) limit = 10;
      return await this.usersService.findAll(
        startId,
        parseInt(skip.toString()),
        parseInt(limit.toString()),
      );
    } catch (error) {
      throw error;
    }
  }

  @Query(() => UserResponseDTO, { name: 'findUserByEmail', nullable: true })
  async getUserByEmail(
    @Args('email')
    email: string,
  ) {
    try {
      const cachedUser = await this.cacheManager.get(email);
      if (cachedUser) return cachedUser;
      const user = await this.usersService.getUserByEmail(email);
      if (user) await this.cacheManager.set(email, user, 10);
      return user;
    } catch (error) {
      throw error;
    }
  }

  @Query(() => UserResponseDTO, { name: 'findUserById', nullable: true })
  async findOneById(@Args('id') id: string) {
    try {
      const cachedUser = await this.cacheManager.get(id.toString());
      if (cachedUser) return cachedUser;
      const user = await this.usersService.findOneById(id);
      if (user) await this.cacheManager.set(id.toString(), user, 10);
      return user;
    } catch (error) {
      throw error;
    }
  }

  @Query(() => [UserResponseDTO], {
    name: 'findMultipleUsersByEmail',
    nullable: true,
  })
  async findMultipleUsersByEmail(
    @Args('emails', { type: () => [String] }) emails: string[],
  ) {
    try {
      return await this.usersService.findUserByEmails(emails);
    } catch (error) {
      throw error;
    }
  }
}
