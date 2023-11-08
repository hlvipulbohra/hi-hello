import { Resolver, Query, Mutation, Args, Context, ID } from '@nestjs/graphql';
import { ChatRoomService } from './chat-room.service';
import { ChatRoom } from './entities/chat-room.entity';
import { CreateChatRoomInput } from './dto/create-chat-room.input';
import { ChatRoomResponseDTO } from './dto/chat-room-response-dto';

@Resolver(() => ChatRoom)
export class ChatRoomResolver {
  constructor(private readonly chatRoomService: ChatRoomService) {}

  @Mutation(() => ChatRoomResponseDTO)
  async createGroupChatRoom(
    @Context() context,
    @Args('createChatRoomInput') createChatRoomInput: CreateChatRoomInput,
  ) {
    try {
      return await this.chatRoomService.createGroupChatRoom(
        context.req.user._id,
        createChatRoomInput,
      );
    } catch (error) {
      throw error;
    }
  }

  @Mutation(() => ChatRoomResponseDTO, { nullable: true })
  async addMember(
    @Context() context,
    @Args('roomId', { type: () => ID }) roomId: string,
    @Args('members', { type: () => [String] }) members: string[],
  ) {
    try {
      return await this.chatRoomService.addMember(
        context.req.user._id,
        roomId,
        members,
        false,
      );
    } catch (error) {
      throw error;
    }
  }

  @Mutation(() => ChatRoomResponseDTO, { nullable: true })
  async addAdmin(
    @Context() context,
    @Args('roomId', { type: () => ID }) roomId: string,
    @Args('members', { type: () => [String] }) members: string[],
  ) {
    try {
      return await this.chatRoomService.addMember(
        context.req.user._id,
        roomId,
        members,
        true,
      );
    } catch (error) {
      throw error;
    }
  }

  @Mutation(() => ChatRoomResponseDTO, { nullable: true })
  async removeMember(
    @Context() context,
    @Args('roomId', { type: () => ID }) roomId: string,
    @Args('members', { type: () => [String] }) members: string[],
  ) {
    try {
      return await this.chatRoomService.removeMember(
        context.req.user._id,
        roomId,
        members,
        false,
      );
    } catch (error) {
      throw error;
    }
  }

  @Mutation(() => ChatRoomResponseDTO, { nullable: true })
  async removeAdmin(
    @Context() context,
    @Args('roomId', { type: () => ID }) roomId: string,
    @Args('members', { type: () => [String] }) members: string[],
  ) {
    try {
      return await this.chatRoomService.removeMember(
        context.req.user._id,
        roomId,
        members,
        true,
      );
    } catch (error) {
      throw error;
    }
  }

  @Query(() => ChatRoomResponseDTO, { name: 'findRoom', nullable: true })
  findOne(@Context() context, @Args('roomId') roomId: string) {
    try {
      return this.chatRoomService.findRoomDetailsOfUser(
        context.req.user._id,
        roomId,
      );
    } catch (error) {
      throw error;
    }
  }
}
