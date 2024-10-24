import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cache } from 'cache-manager';

@Injectable()
export class AuthRedisService {
    private readonly redisSecretKey: string;
    constructor(
        @Inject(CACHE_MANAGER) protected cacheManager: Cache,
        private readonly configService: ConfigService,) {
        this.redisSecretKey = this.configService.get<string>('REDIS_SECRETKEY');
    }

    async saveTokenToRedis(tokenId: number, redisObj: object, ttlSeconds: number): Promise<void> {
        try {
            const redisValue = JSON.stringify(redisObj);
            const redisKey = this.createRedisKey(tokenId);
            const ttlMiliseconds = ttlSeconds * 1000;
            await this.cacheManager.set(redisKey, redisValue, ttlMiliseconds);
        } catch (error) {
            throw error;
        }
    }

    async getTokenFromRedis(tokenId: number): Promise<string | null> {
        try {
            const redisKey = this.createRedisKey(tokenId);
            return await this.cacheManager.get(redisKey);
        } catch (error) {
            throw error;
        }
    }

    async deleteTokenFromRedis(tokenId: number): Promise<void> {
        try {
            const redisKey = this.createRedisKey(tokenId);
            await this.cacheManager.del(redisKey);
        } catch (error) {
            throw error;
        }
    }

    private createRedisKey(tokenId: number): string {
        return `${tokenId}LOGIN${this.redisSecretKey}`;
    }
}