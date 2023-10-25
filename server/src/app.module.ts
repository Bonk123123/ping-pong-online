import { Module } from '@nestjs/common';
import { PingpongGateway } from './pingpong/pingpong.gateway';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database.module';
import { PingpongService } from './pingpong/pingpong.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Servers } from './pingpong/entities/server-entity';
import { PingpongController } from './pingpong/pingpong.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
    }),
    DatabaseModule,
    TypeOrmModule.forFeature([Servers]),
  ],
  controllers: [PingpongController],
  providers: [PingpongGateway, PingpongService],
})
export class AppModule {}
