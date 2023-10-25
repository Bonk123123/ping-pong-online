import { Injectable } from '@nestjs/common';
import { Servers } from './entities/server-entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WsException } from '@nestjs/websockets';

@Injectable()
export class PingpongService {
  constructor(
    @InjectRepository(Servers) private serversRepository: Repository<Servers>,
  ) {}

  async findAll() {
    const servers = await this.serversRepository.find();

    return servers.map((server) => {
      let count = 0;
      if (server.player1) count += 1;
      if (server.player2) count += 1;

      return {
        id: server.id,
        name: server.server_name,
        playerCount: count,
      };
    });
  }

  async playersCountOnServer(serverId: string) {
    const server = await this.serversRepository.findOneBy({ id: serverId });

    let playersCount = 0;

    if (server) {
      if (server.player1) playersCount += 1;
      if (server.player2) playersCount += 1;
    }

    return playersCount;
  }

  async createServer(clientId: string, serverName: string) {
    const server = this.serversRepository.create({
      player1: clientId,
      player2: null,
      server_name: serverName,
    });

    await this.serversRepository.save(server);
    return server;
  }

  async findSecondPlayerId(serverId: string, clientId: string) {
    const server = await this.serversRepository.findOneBy({ id: serverId });

    if (!server) return null;

    if (server.player1 === clientId) {
      return server.player2;
    } else {
      return server.player1;
    }
  }

  async findServerByPlayerId(clientId: string) {
    const server = await this.serversRepository.findOne({
      where: [{ player1: clientId }, { player2: clientId }],
    });

    return server;
  }

  async joinPlayer(serverId: string, clientId: string) {
    const server = await this.serversRepository.findOneBy({ id: serverId });

    if (server.player1 && server.player2)
      throw new WsException('server is full');

    let position;
    if (!server.player1) {
      position = 'left';
      await this.serversRepository.update(
        { id: serverId },
        { player1: clientId },
      );
    } else {
      position = 'right';
      await this.serversRepository.update(
        { id: serverId },
        { player2: clientId },
      );
    }

    return { serverId: server.id, playerPosition: position };
  }

  async removePlayer(clientId: string) {
    const server = await this.serversRepository.findOne({
      where: [{ player1: clientId }, { player2: clientId }],
    });

    if (!server) return null;

    // if (server.player1 !== clientId && server.player2 !== clientId && server)
    //   throw new WsException('on this server no such client');

    if (server && server.player1 === clientId) {
      await this.serversRepository.update({ id: server.id }, { player1: null });
    } else {
      await this.serversRepository.update({ id: server.id }, { player2: null });
    }

    const updatedServer = await this.serversRepository.findOneBy({
      id: server.id,
    });

    if (updatedServer.player1 === null && updatedServer.player2 === null) {
      await this.serversRepository.delete({ id: server.id });
    }
  }
}
