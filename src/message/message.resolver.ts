import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql';
import { MessageService } from './message.service';
import { MessageResponseDTO } from './dto/message-response-dto';
import { CreateGroupMessageDto } from './dto/create-group-message.dto';

@Resolver()
export class MessageResolver {
  constructor(private readonly messageService: MessageService) {}

  /**
   *
   * @param context - the context to find the user details fetched from JWT token
   * @param createMessageDto - The message JSON object
   * @returns The  message object saved in the database
   */
  @Mutation(() => MessageResponseDTO)
  async createGroupMessage(
    @Context() context,
    @Args('createMessageInput') createMessageDto: CreateGroupMessageDto,
  ) {
    try {
      return this.messageService.createGroupMsg(
        context.req.user._id,
        createMessageDto,
      );
    } catch (error) {
      throw error;
    }
  }

  /**
   *
   * @param context - the context to find the user details fetched from JWT token
   * @param lastMessageDate - teh last date after which the new messages are to be fetched from the dataabase
   * @param startId - the _id of the last message to allow faster fetch usingh keyset pagination
   * @param skip - the parameter to skip n messages
   * @param limit - to limit the number of messages returned
   * @returns - the messages object returned as an array
   */
  @Query(() => [MessageResponseDTO], {
    name: 'fetchNewMessages',
    nullable: true,
  })
  findByUser(
    @Context() context,
    @Args({ name: 'lastMessageDate', nullable: true }) lastMessageDate: Date,
    @Args({ name: 'startId', nullable: true }) startId: string,
    @Args({ name: 'skip', nullable: true }) skip: number,
    @Args({ name: 'limit', nullable: true }) limit: number,
  ): Promise<MessageResponseDTO[]> {
    try {
      const userId = context.req.user._id;
      if (!skip) skip = 0;
      if (!limit) limit = 50;
      return this.messageService.fetchNewMessages(
        userId,
        lastMessageDate,
        startId,
        parseInt(skip.toString()),
        parseInt(limit.toString()),
      );
    } catch (error) {
      throw error;
    }
  }
}
