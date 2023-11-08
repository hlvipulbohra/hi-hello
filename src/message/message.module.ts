import { Module } from '@nestjs/common';
import { MessageService } from './message.service';
import { MessageGateway } from './message.gateway';
import { AuthModule } from 'src/auth/auth.module';
import { ChatRoomModule } from 'src/chat-room/chat-room.module';
import { MongooseModule } from '@nestjs/mongoose';
import { MessageSchema } from './entities/message.entity';
import { MessageResolver } from './message.resolver';

@Module({
  imports: [
    AuthModule,
    ChatRoomModule,
    MongooseModule.forFeature([{ name: 'message', schema: MessageSchema }]),
  ],
  providers: [MessageGateway, MessageService, MessageResolver],
})
export class MessageModule {}
