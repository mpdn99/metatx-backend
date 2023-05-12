import { Module } from '@nestjs/common';
import { RelayerController } from './relayer.controller';
import { RelayerService } from './relayer.service';
import { EthersModule, MUMBAI_NETWORK } from 'nestjs-ethers';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    EthersModule.forRoot({
      network: MUMBAI_NETWORK,
      custom: 'https://rpc-mumbai.maticvigil.com/',
      useDefaultProvider: false,
    }),
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
  ],
  controllers: [RelayerController],
  providers: [RelayerService],
})
export class RelayerModule {}
