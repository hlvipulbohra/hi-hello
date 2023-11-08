import { Module } from '@nestjs/common';
import { ChatRoomService } from './chat-room.service';
import { ChatRoomResolver } from './chat-room.resolver';
import { ChatRoomSchema } from './entities/chat-room.entity';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'chat_room', schema: ChatRoomSchema }]),
  ],
  providers: [ChatRoomResolver, ChatRoomService],
  exports: [ChatRoomService],
})
export class ChatRoomModule {}
