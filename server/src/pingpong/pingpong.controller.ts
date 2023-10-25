import { Controller, Get } from '@nestjs/common';
import { PingpongService } from './pingpong.service';

@Controller('servers')
export class PingpongController {
  constructor(private pingpongService: PingpongService) {}

  @Get()
  async findAll() {
    return await this.pingpongService.findAll();
  }
}
