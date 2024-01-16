import { Module } from '@nestjs/common';
import { AppController } from './modena-api.controller';
import { AppService } from './modena-api.service';
import { DevtoolsModule } from '@nestjs/devtools-integration'

@Module({
  imports: [
    DevtoolsModule.register({
      http: process.env.NODE_ENV !== 'production',
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
