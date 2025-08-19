import { Inject } from '@nestjs/common';
import {
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MessageSeenStatusService } from 'src/application/services/messageSeenStatus/messageSeenStatus.service';
import { WatchersToConvertService } from 'src/application/services/watchersToConvert/watchersToConvert.service';
import { MessageReadDto } from 'src/contracts/message/read-message.dto';
import { PostReadDto } from 'src/contracts/post/read-post.dto';
import { Logger } from 'winston';

@WebSocketGateway({
  namespace: 'convert',
  cors:
    process.env.NODE_ENV === 'dev'
      ? '*:*'
      : { origin: process.env.PROD_API_HOST_WS },
})
export class ConvertGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    private readonly messageSeenStatusService: MessageSeenStatusService,
    private readonly watchersToConvertService: WatchersToConvertService,
    @Inject('winston') private readonly logger: Logger,
  ) {}
  private clients: Map<string, Socket> = new Map();
  @WebSocketServer() ws: Server;

  afterInit(server: Server) {
    this.logger.info(`WebSocket for chat initialized`);
  }

  handleDisconnect(client: Socket) {
    this.logger.info(`Client Disconnected: ${client.id}`);
    this.clients.delete(client.id);
    this.clients.forEach((client) => {
      this.logger.info(
        `Client ID: ${client.id}, Socket ID: ${JSON.stringify(client.data)}`,
      );
    });
  }

  handleConnection(client: Socket) {
    const { userId } = client.handshake.auth;
    client.data.userId = userId;
    this.logger.info(`Client Connected: ${client.id}`);
    this.clients.set(client.id, client);
    this.logger.info(`Number of connected clients: ${this.clients.size}`);
    this.clients.forEach((client) => {
      this.logger.info(
        `Client ID: ${client.id}, Socket ID: ${JSON.stringify(client.data)}`,
      );
    });
    return { success: true };
  }

  @SubscribeMessage('join_convert')
  async handleSetClientDataEvent(
    @MessageBody()
    payload: {
      convertId: string;
    },
    @ConnectedSocket() connectedClient: Socket,
  ) {
    const client = this.clients.get(connectedClient.id);
    if (!client) {
      return { success: false, message: 'Не удалось подключиться к чату!' };
    }
    client.join(payload.convertId); // Теперь используем join, чтобы присоединить клиента к комнате
    this.logger.info(`${connectedClient.id} is joining ${payload.convertId}`);
    const sockets = await this.ws.in(payload.convertId).fetchSockets();
    for (const socket of sockets) {
      console.log(socket.id);
      console.log(socket.rooms);
    }
    return { success: true };
  }

  @SubscribeMessage('messagesSeen')
  async handleMessagesSeenEvent(
    @MessageBody()
    payload: {
      convertId: string;
      post: PostReadDto;
      messageIds: string[];
    },
  ) {
    const start = new Date();
    const uniqueMessageIds: string[] = payload.messageIds.filter(
      (item, i, ar) => {
        return ar.indexOf(item) === i;
      },
    );
    await this.messageSeenStatusService.updateSeenStatuses(
      uniqueMessageIds,
      payload.convertId,
      payload.post,
    );

    this.ws.to(payload.convertId).emit('messagesAreSeen', {
      dateSeen: new Date(),
      messageIds: payload.messageIds,
    });
    const now = new Date();
    console.log(`все сообщения увидены ${now.getTime() - start.getTime()}`);
    return true;
  }

  handleMessageCreationEvent(convertId: string, message: MessageReadDto) {
    this.ws.to(convertId).emit('messageCreationEvent', message);
    return true;
  }

  @SubscribeMessage('messagesSeenWatcher')
  async handleMessagesSeenForWatcherEvent(
    @MessageBody()
    payload: {
      convertId: string;
      post: PostReadDto;
      messageIds: string[];
      lastSeenMessageNumber: number;
    },
  ) {
    const start = new Date();
    const uniqueMessageIds: string[] = payload.messageIds.filter(
      (item, i, ar) => {
        return ar.indexOf(item) === i;
      },
    );
    const messagesCount = uniqueMessageIds.length;
    await this.watchersToConvertService.updateSeenStatuses(
      payload.lastSeenMessageNumber,
      messagesCount,
      payload.convertId,
      payload.post,
    );

    const now = new Date();
    console.log(`все сообщения увидены ${now.getTime() - start.getTime()}`);
    return true;
  }

  handleMessageCountEvent(
    convertId: string,
    userIdsInConvert: string[],
    host: PostReadDto,
    lastPostInConvert: PostReadDto,
  ) {
    let socketsToNotify: Socket[] = [];
    userIdsInConvert.forEach((userId) => {
      const sockets = this.findKeysByValue(this.clients, userId);
      socketsToNotify = socketsToNotify.concat(sockets);
    });

    socketsToNotify.forEach((socket) => {
      socket.join(`MCountE-${convertId}`);
    });
    this.ws.to(`MCountE-${convertId}`).emit('messageCountEvent', {
      host: host,
      lastPostInConvert: lastPostInConvert,
    });
    socketsToNotify.forEach((socket) => {
      socket.leave(`MCountE-${convertId}`);
    });
    return true;
  }

  handleConvertApproveEvent(
    convertId: string,
    newActivePost: PostReadDto,
    pathOfPostsWithoutHostPost: string[],
  ) {
    this.ws.to(convertId).emit('convertApproveEvent', {
      newActivePost: newActivePost,
      pathOfPostsWithoutHostPost: pathOfPostsWithoutHostPost,
    });
    return true;
  }

  handleConvertFinishEvent(
    convertId: string,
    convertStatus: boolean,
    pathOfPosts: string[],
  ) {
    let socketsToNotify: Socket[] = [];
    pathOfPosts.forEach((userId) => {
      const sockets = this.findKeysByValue(this.clients, userId);
      socketsToNotify = socketsToNotify.concat(sockets);
    });
    socketsToNotify.forEach((socket) => {
      socket.join(`CFinE-${convertId}`);
    });
    this.ws
      .to(`CFinE-${convertId}`)
      .emit('convertFinishEvent', { convertStatus: convertStatus });
    socketsToNotify.forEach((socket) => {
      socket.leave(`CFinE-${convertId}`);
    });
    return true;
  }

  handleConvertCreationEvent(
    convertId: string,
    host: PostReadDto,
    reciever: PostReadDto,
    pathOfPostsWithoutHostPost: string[],
  ) {
    const socketsToNotify = this.findKeysByValue(
      this.clients,
      reciever.user.id,
    );
    socketsToNotify.forEach((socket) => {
      socket.join(`CCreE-${convertId}`);
    });
    this.ws.to(`CCreE-${convertId}`).emit('convertCreationEvent', {
      host: host,
      reciever: reciever,
      pathOfPostsWithoutHostPost: pathOfPostsWithoutHostPost,
    });
    socketsToNotify.forEach((socket) => {
      socket.leave(`CCreE-${convertId}`);
    });
    return true;
  }

  findKeysByValue(map: Map<string, Socket>, userId: string): Socket[] {
    const matchingKeys: Socket[] = [];

    map.forEach((value, key) => {
      if (userId === value.data.userId) {
        const client = this.clients.get(key);
        matchingKeys.push(client);
      }
    });

    return matchingKeys;
  }
}
