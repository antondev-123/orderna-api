import { Module } from '@nestjs/common';
import { AuthRedisService } from './services/auth-redis.service';

@Module({
  providers: [AuthRedisService],
  exports: [AuthRedisService],
})
export class RedisHelperModule { }