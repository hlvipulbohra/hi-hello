import {
  Injectable,
  Inject,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateChatRoomInput } from './dto/create-chat-room.input';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as _ from 'lodash';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { ChatRoom } from './entities/chat-room.entity';
import { ChatRoomResponseDTO } from './dto/chat-room-response-dto';
import { GraphQLError } from 'graphql';

@Injectable()
export class ChatRoomService {
  constructor(
    @InjectModel('chat_room') private chatRoomModel: Model<ChatRoom>,
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
  ) {}

  /**
   *
   * @param userDetails This is the json which contains the user details as mentioned in the CreateUserDto class
   * @returns the user details if created successfully else returns the error message
   */
  async createGroupChatRoom(
    userId: Types.ObjectId,
    createChatRoomInput: CreateChatRoomInput,
  ): Promise<any> {
    try {
      // initally the user who creates is the only admin of the group
      createChatRoomInput.admins = [userId];

      createChatRoomInput.members = createChatRoomInput.members.map(
        (id) => new Types.ObjectId(id),
      );
      createChatRoomInput.members.push(userId);
      createChatRoomInput.members = _.uniqBy(
        createChatRoomInput.members,
        (id) => id.valueOf(),
      );
      createChatRoomInput.isGroupChat = true;
      const room = new this.chatRoomModel(createChatRoomInput);
      return await room.save();
    } catch (error) {
      throw error;
    }
  }

  async addMember(
    userId: Types.ObjectId,
    roomIdArg: string,
    members: string[],
    updateAdmin: boolean = false,
  ): Promise<ChatRoomResponseDTO> {
    try {
      this.isObjectId(roomIdArg);
      const roomId = new Types.ObjectId(roomIdArg);
      const room = await this.chatRoomModel.findById(roomId).exec();

      // only admins are allowed to add members
      if (
        !room ||
        !room.isGroupChat ||
        _.findIndex(room.admins, (o) => {
          return o.valueOf() === userId.valueOf();
        }) === -1
      )
        throw new GraphQLError('Not allowed to add member', {
          extensions: {
            code: HttpStatus.BAD_REQUEST,
          },
        });

      members.forEach((id) => {
        room.members.push(new Types.ObjectId(id));
        if (updateAdmin) room.admins.push(new Types.ObjectId(id));
      });

      room.members = _.uniqBy(room.members, (id) => id.valueOf());

      if (updateAdmin)
        room.admins = _.uniqBy(room.admins, (id) => id.valueOf());
      const updateQuery = updateAdmin
        ? { admins: room.admins, members: room.members }
        : { members: room.members };
      const result = await this.chatRoomModel
        .findOneAndUpdate({ _id: roomId }, updateQuery, {
          new: true,
        })
        .exec();

      if (result) await this.cacheManager.set(roomId.toString(), result, 10);
      return result;
    } catch (error) {
      throw error;
    }
  }

  async removeMember(
    userId: Types.ObjectId,
    roomIdArg: string,
    members: string[],
    updateAdmin: boolean = false,
  ): Promise<ChatRoomResponseDTO> {
    try {
      this.isObjectId(roomIdArg);
      const roomId = new Types.ObjectId(roomIdArg);
      const room = await this.chatRoomModel.findById(roomId).exec();

      //check condition for admins. Only admins are allowed to remove
      if (
        !room ||
        !room.isGroupChat ||
        _.findIndex(room.admins, (o) => {
          return o.valueOf() === userId.valueOf();
        }) === -1
      )
        throw new GraphQLError('Not allowed to remove member', {
          extensions: {
            code: HttpStatus.BAD_REQUEST,
          },
        });
      const temp = updateAdmin ? room.admins : room.members;

      if (temp.length === 1) {
        throw new UnauthorizedException({
          message: 'Not allowed to remove',
        });
      }
      members.forEach((member) => {
        if (!updateAdmin) {
          _.remove(room.members, (item) => {
            if (item.valueOf() === userId.valueOf()) return false;
            return item.toString() === member;
          });
        }
        _.remove(room.admins, (item) => {
          if (item.valueOf() === userId.valueOf()) return false;
          return item.toString() === member;
        });
      });

      const updateQuery = updateAdmin
        ? { admins: room.admins }
        : { admins: room.admins, members: room.members };
      const result = await this.chatRoomModel
        .findOneAndUpdate({ _id: roomId }, updateQuery, {
          new: true,
        })
        .exec();
      if (result) await this.cacheManager.set(roomId.toString(), result, 10);
      return result;
    } catch (error) {
      throw error;
    }
  }

  async findRoomDetailsOfUser(userId: Types.ObjectId, roomIdArg: string) {
    try {
      this.isObjectId(roomIdArg);
      const roomId = new Types.ObjectId(roomIdArg);
      let room;
      const cachedRoom = await this.cacheManager.get(roomId.toString());
      if (cachedRoom) room = cachedRoom;
      else {
        room = await this.chatRoomModel.findById(roomId).exec();
        if (room) await this.cacheManager.set(roomId.toString(), room, 10);
      }
      if (
        !room ||
        (_.findIndex(room.members, (o) => {
          return o.valueOf() === userId.valueOf();
        }) === -1 &&
          _.findIndex(room.admins, (o) => {
            return o.valueOf() === userId.valueOf();
          }) === -1)
      )
        throw new GraphQLError('Unauthorized', {
          extensions: {
            code: HttpStatus.UNAUTHORIZED,
          },
        });
      return room;
    } catch (error) {
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
