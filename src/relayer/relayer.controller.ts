import {
  Body,
  Controller,
  Headers,
  HttpException,
  Post,
  Req,
} from '@nestjs/common';
import { RelayerService } from './relayer.service';

@Controller('relayer')
export class RelayerController {
  constructor(private readonly relayerService: RelayerService) {}
  @Post('')
  async relay(
    @Headers('signature') idToken: string,
    @Body() payload: any,
    @Req() request: any,
  ): Promise<any> {
    const ip =
      request.headers['x-forwarded-for'] || request.connection.remoteAddress;

    console.log(request.headers['x-forwarded-for']);
    console.log(request.connection.remoteAddress);
    console.log(request.ip);

    const isValidID = await this.relayerService.verifySignature(
      idToken,
      payload.request,
    );
    if (!isValidID) {
      throw new HttpException('Invalid signature', 400);
    }

    const captchaToken = payload.g_response;
    const isValidCaptcha = await this.relayerService.verifyCaptcha(
      captchaToken,
      ip,
    );
    if (!isValidCaptcha) {
      throw new HttpException('Invalid g_respose', 400);
    }
    console.log(payload);
    return this.relayerService.relay(payload.request);
  }
}
