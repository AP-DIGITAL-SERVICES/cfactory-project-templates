import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
{{#if (eq decision_caching "redis")}}import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-ioredis-yet';
{{/if}}{{#if (or (eq decision_queue "bullmq") (eq decision_backgroundJobs "bullmq-repeatable"))}}import { BullModule } from '@nestjs/bullmq';
{{/if}}{{#if (eq decision_backgroundJobs "nestjs-schedule")}}import { ScheduleModule } from '@nestjs/schedule';
{{/if}}

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: config.get<string>('DATABASE_URL'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: config.get<string>('NODE_ENV') === 'development',
        logging: config.get<string>('NODE_ENV') === 'development',
      }),
      inject: [ConfigService],
    }),
{{#if (eq decision_caching "redis")}}    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      useFactory: async (config: ConfigService) => ({
        store: await redisStore({ socket: { host: config.get('REDIS_HOST', 'localhost'), port: config.get<number>('REDIS_PORT', 6379) } }),
        ttl: 60,
      }),
      inject: [ConfigService],
    }),
{{/if}}{{#if (or (eq decision_queue "bullmq") (eq decision_backgroundJobs "bullmq-repeatable"))}}    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        connection: {
          host: config.get<string>('REDIS_HOST', 'localhost'),
          port: config.get<number>('REDIS_PORT', 6379),
        },
      }),
      inject: [ConfigService],
    }),
{{/if}}{{#if (eq decision_backgroundJobs "nestjs-schedule")}}    ScheduleModule.forRoot(),
{{/if}}  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
