import { Logger } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { PingpongService } from './pingpong.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class PingpongGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('PingPongGateway');

  constructor(private pingpongService: PingpongService) {}

  @SubscribeMessage('new_server')
  async createServer(
    @MessageBody() serverName: string,
    @ConnectedSocket() client: Socket,
  ) {
    const serverPP = await this.pingpongService.createServer(
      client.id,
      serverName,
    );

    this.server
      .to(client.id)
      .emit('new_server', { serverId: serverPP.id, playerPosition: 'left' });

    const playersCount = await this.pingpongService.playersCountOnServer(
      serverPP.id,
    );

    this.server.to(client.id).emit('players_count', playersCount);

    return { serverId: serverPP.id, playerPosition: 'left' };
  }

  @SubscribeMessage('join_server')
  async joinServer(
    @MessageBody() serverId: string,
    @ConnectedSocket() client: Socket,
  ) {
    const serverPP = await this.pingpongService.joinPlayer(serverId, client.id);

    this.server.to(client.id).emit('join_server', {
      serverId: serverPP.serverId,
      playerPosition: serverPP.playerPosition,
    });

    const player2Id = await this.pingpongService.findSecondPlayerId(
      serverId,
      client.id,
    );

    const playersCount =
      await this.pingpongService.playersCountOnServer(serverId);

    if (player2Id)
      this.server.to(player2Id).emit('players_count', playersCount);

    this.server.to(client.id).emit('players_count', playersCount);

    return {
      serverId: serverPP.serverId,
      playerPosition: serverPP.playerPosition,
    };
  }

  @SubscribeMessage('players_count')
  async playersCount(
    @MessageBody() serverId: string,
    @ConnectedSocket() client: Socket,
  ) {
    const playersCount =
      await this.pingpongService.playersCountOnServer(serverId);

    this.server.to(client.id).emit('players_count', playersCount);
  }

  @SubscribeMessage('player_position')
  async playerPosition(
    @MessageBody() playerActivity: { position: number; serverId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const player2Id = await this.pingpongService.findSecondPlayerId(
      playerActivity.serverId,
      client.id,
    );

    this.server.to(player2Id).emit('player_position', playerActivity.position);
  }

  @SubscribeMessage('ball_position')
  async ballPosition(
    @MessageBody()
    ballActivity: {
      position: { x: number; y: number };
      score: { player1: number; player2: number };
      serverId: string;
    },
    @ConnectedSocket() client: Socket,
  ) {
    const player2Id = await this.pingpongService.findSecondPlayerId(
      ballActivity.serverId,
      client.id,
    );

    this.server.to(player2Id).emit('ball_position', {
      x: ballActivity.position.x,
      y: ballActivity.position.y,
      score: {
        player1: ballActivity.score.player1,
        player2: ballActivity.score.player2,
      },
    });
  }

  handleConnection(client: Socket, ...args: any[]) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  @SubscribeMessage('remove_player')
  async removePlayer(@ConnectedSocket() client: Socket) {
    const server = await this.pingpongService.findServerByPlayerId(client.id);

    if (!server) return;
    await this.pingpongService.removePlayer(client.id);

    const playersCount = await this.pingpongService.playersCountOnServer(
      server.id,
    );
    const player2Id = await this.pingpongService.findSecondPlayerId(
      server.id,
      client.id,
    );

    if (player2Id) {
      this.server.to(player2Id).emit('players_count', playersCount);
    }
  }

  async handleDisconnect(client: Socket) {
    const server = await this.pingpongService.findServerByPlayerId(client.id);

    if (server) {
      await this.pingpongService.removePlayer(client.id);

      const playersCount = await this.pingpongService.playersCountOnServer(
        server.id,
      );

      const player2Id = await this.pingpongService.findSecondPlayerId(
        server.id,
        client.id,
      );

      if (player2Id) {
        this.server.to(player2Id).emit('players_count', playersCount);
      }
    }

    this.logger.log(`Client disconnected: ${client.id}`);
  }
}
