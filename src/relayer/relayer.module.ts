import { Module } from '@nestjs/common';
import { RelayerController } from './relayer.controller';
import { RelayerService } from './relayer.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
  ],
  controllers: [RelayerController],
  providers: [RelayerService],
})
export class RelayerModule {}
