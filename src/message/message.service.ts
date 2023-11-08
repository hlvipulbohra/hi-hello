import { Injectable, HttpStatus } from '@nestjs/common';
import { CreateGroupMessageDto } from './dto/create-group-message.dto';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { GraphQLError } from 'graphql';
import { Message } from './entities/message.entity';
import { ChatRoomService } from 'src/chat-room/chat-room.service';
import { MessageResponseDTO } from './dto/message-response-dto';

@Injectable()
export class MessageService {
  constructor(
    @InjectModel('message')
    private readonly messageModel: Model<Message>,
    private readonly roomService: ChatRoomService,
  ) {}

  async createGroupMsg(
    userId: Types.ObjectId,
    createMessageDto: CreateGroupMessageDto,
  ): Promise<MessageResponseDTO> {
    try {
      this.isObjectId(createMessageDto.roomId);
      // to get the room details if the user belongs to the room
      const room = await this.roomService.findRoomDetailsOfUser(
        userId,
        createMessageDto.roomId.toString(),
      );
      if (!room)
        throw new GraphQLError('Unauthorized', {
          extensions: {
            code: HttpStatus.UNAUTHORIZED,
          },
        });
      createMessageDto.members = room.members;
      createMessageDto.roomId = new Types.ObjectId(room._id);
      createMessageDto.isGroupChat = room.isGroupChat;
      createMessageDto.senderId = userId;

      const message = new this.messageModel(createMessageDto);
      return await message.save();
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async findARoomUsingMemberAndRoomId(userId: Types.ObjectId, roomId: string) {
    try {
      // to get the room details if the user belongs to the room
      const room = await this.roomService.findRoomDetailsOfUser(userId, roomId);
      if (room) {
        return room;
      }
    } catch (err) {
      console.log(err);
      throw new Error('Not authorized');
    }
  }

  async fetchNewMessages(
    userId: string,
    lastMessageDate: Date,
    startId: string = null,
    skip = 0,
    limit = 50,
  ): Promise<MessageResponseDTO[]> {
    try {
      const query: any = {
        members: {
          $in: new Types.ObjectId(userId),
        },
      };
      if (lastMessageDate) query.createdAt = { $gt: new Date(lastMessageDate) };
      if (startId) {
        this.isObjectId(startId);
        query._id = {
          $gt: startId, // using keyset pagination
        };
      }
      return await this.messageModel.find(query).skip(skip).limit(limit).exec();
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  /**
   *
   * @param _id is the id we receive in the request url from the user
   * This fucntion will check if this id is a valid ObjectId
   * Else this will throw an error
   */
  isObjectId(_id) {
    try {
      if (!Types.ObjectId.isValid(_id))
        throw new GraphQLError('Invalid Id', {
          extensions: {
            code: HttpStatus.BAD_REQUEST,
          },
        });
    } catch (error) {
      throw error;
    }
  }
}
