import {
  BadRequestException,
  Inject,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import {
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { plainToInstance } from 'class-transformer';
import { validateOrReject } from 'class-validator';
import { Server, Socket } from 'socket.io';
import { ClientCredentialsDto } from 'src/contracts/websockets/clientCredentials.dto';
import { Logger } from 'winston';

@WebSocketGateway({
  namespace: 'auth',
  cors:
    process.env.NODE_ENV === 'dev'
      ? '*:*'
      : { origin: process.env.PROD_API_HOST_WS },
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    @Inject('winston') private readonly logger: Logger,
  ) {}
  private clients: Map<string, Socket> = new Map();
  @WebSocketServer() ws: Server;

  afterInit(server: Server) {
    this.logger.info(`WebSocket for auth initialized`);
  }

  handleDisconnect(client: Socket) {
    this.logger.info(`Client Disconnected: ${client.id}`);
    this.clients.delete(client.id);
  }

  handleConnection(client: Socket) {
    this.logger.info(`Client Connected: ${client.id}`);
    this.clients.set(client.id, client);
    this.logger.info(`Number of connected clients: ${this.clients.size}`);
  }

  sendTokenToClient(
    clientId: string,
    userId: string,
    accessToken: string,
    refreshTokenId: string,
  ) {
    try {
      const client = this.clients.get(clientId);
      if (client) {
        const payload = {
          userId,
          accessToken,
          refreshTokenId,
        };
        client.emit('receiveAuthInfo', payload);
        this.logger.info(`Sent token to client ${JSON.stringify(payload)}`);
      } else {
        throw new NotFoundException(
          `WebSocket соединение не установлено, не найден клиент с ID: ${clientId}`,
        );
      }
    } catch (err) {
      this.logger.error(err);
      if (err instanceof NotFoundException) {
        throw err;
      }

      throw new InternalServerErrorException('Ошибка при входе!');
    }
  }

  async requestInfoFromClient(
    clientId: string,
    expectedData: string[],
  ): Promise<Record<string, any>> {
    const client = this.clients.get(clientId);
    if (!client) {
      throw new NotFoundException(
        `WebSocket соединение не установлено, клиент с ID: ${clientId} не найден`,
      );
    }
    const payload = { expectedData, clientId };
    client.emit('requestInfo', payload);
    return await Promise.race([
      new Promise<ClientCredentialsDto>((resolve, reject) => {
        client.once('responseFromClient', async (data) => {
          const clientCredentialsDto = plainToInstance(
            ClientCredentialsDto,
            data,
          );
          await validateOrReject(clientCredentialsDto).catch((errors) => {
            reject(new BadRequestException(errors));
          });
          resolve(clientCredentialsDto);
        });
      }),
      new Promise((_, reject) =>
        setTimeout(
          () =>
            reject(
              new Error(
                `Превышено время ожидания ответа от соединения: ${clientId}`,
              ),
            ),
          5000,
        ),
      ),
    ]).catch((err) => this.logger.error(err));
  }

  @SubscribeMessage('responseFromClient')
  async handleResponse(
    @MessageBody() data: ClientCredentialsDto,
    @ConnectedSocket() client: Socket,
  ) {
    this.logger.info(
      `Response received from client ${client.id}: ${JSON.stringify(data)}`,
    );
  }
}
