import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriverConfig, ApolloDriver } from '@nestjs/apollo';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { AuthModule } from './auth/auth.module';
import * as redisStore from 'cache-manager-redis-store';
import { GqlThrottlerGuard } from './gql-throttler-guard';
import { ChatRoomModule } from './chat-room/chat-room.module';
import { MessageModule } from './message/message.module';

@Module({
  imports: [
    //registering redis cache
    CacheModule.register({
      isGlobal: true,
      store: redisStore,
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
    }),
    // implementing rate-limit to prevent the API abuse
    // to limit the API calls to 100 per minute
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // Time-to-live (in milliseconds)
        limit: 100, // Request limit
      },
    ]),

    // to access the environment variables
    ConfigModule.forRoot(),

    // connecting to mongoDB
    MongooseModule.forRoot(process.env.MONGODB_URI),

    // setting up graphql
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: 'schema.gql',
      playground: true,
      context: ({ req, res }) => ({ req, res }),
    }),
    UsersModule,
    AuthModule,
    ChatRoomModule,
    MessageModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: GqlThrottlerGuard,
    },
  ],
})
export class AppModule {}
