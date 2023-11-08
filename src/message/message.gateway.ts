import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  ConnectedSocket,
} from '@nestjs/websockets';
import { MessageService } from './message.service';
import { CreateGroupMessageDto } from './dto/create-group-message.dto';

import { Server, Socket } from 'socket.io';
import { AuthService } from 'src/auth/auth.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class MessageGateway {
  constructor(
    private readonly messageService: MessageService,
    private readonly authService: AuthService,
  ) {}

  @WebSocketServer()
  private readonly server: Server;

  /**
   *
   * @param socket - this is the connected by which the user connects
   * @param createMessageDto this is the message JSON object
   */
  @SubscribeMessage('send-group-msg')
  async send(
    @ConnectedSocket() socket: Socket,
    @MessageBody()
    createMessageDto: CreateGroupMessageDto,
  ) {
    try {
      // saving in the database after checking if user is authorized to send
      const message = await this.messageService.createGroupMsg(
        socket['user']._id,
        createMessageDto,
      );

      // emitting to the room to enable real time communication
      if (message) {
        socket
          .to(createMessageDto.roomId.toString())
          .emit('new-message', message);

        //notification is sent if user has not joined the group chat room to receive real time messages
        message.members.forEach((member) => {
          // the sender is not sent the notification
          if (member.valueOf() !== socket['user']._id.valueOf())
            this.server.in(member.toString()).emit('notification', message);
        });
      }
    } catch (error) {
      // emitting the error to the user
      this.server.in(socket['user']._id.toString()).emit('error', {
        errorMessage: 'Message Sending failed. Please try again ',
        error: error,
      });
    }
  }

  @SubscribeMessage('join-room')
  async joinRoom(
    @ConnectedSocket() socket: Socket,
    @MessageBody('roomId') roomId: string,
  ) {
    try {
      // find if the current user is a part of the chat room
      const room = await this.messageService.findARoomUsingMemberAndRoomId(
        socket['user']._id,
        roomId,
      );

      if (room) socket.join(roomId);

      // sending a notification to all the connected users of the chat room except the sender (or the person joined)
      socket
        .to(roomId)
        .emit(
          'notification',
          socket['user'].name + ' has joined the room ' + room.name,
        );
    } catch (error) {
      // emitting the error to the user
      this.server.in(socket['user']._id.toString()).emit('error', {
        errorMessage: 'Not authorized to join room ' + roomId,
      });
    }
  }

  handleDisconnect(socket: Socket) {
    try {
      if (socket['user']) socket.leave(socket['user']._id);
      console.log(`Client Disconnected: ${socket.id}`);
    } catch (error) {
      console.log(error);
    }
  }

  async handleConnection(socket: Socket, ...args: any[]) {
    try {
      console.log(`socket Connected: ${socket.id}`);
      const user = await this.authService.validateToken(
        socket.handshake.headers.authorization,
      );
      if (!user) {
        socket.disconnect(true);
        throw new Error('Unauthorized');
      }
      socket['user'] = user;
      socket.join(user._id.toString());
      this.server
        .in(user._id.toString())
        .emit('new-message', 'welcome to the chat', user._id);
    } catch (error) {
      console.log(error);
    }
  }
}
