import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import {
  recoverAddress,
  hashMessage,
  JsonRpcProvider,
  Contract,
  Wallet,
} from 'ethers';
import { firstValueFrom } from 'rxjs';
import { ForwarderAbi } from '../abi/forwarder';

@Injectable()
export class RelayerService {
  constructor(private readonly httpService: HttpService) {}

  async verifySignature(token: any, payload: any) {
    const message = 'vaix';
    const recoveredPublicKeyToken = recoverAddress(hashMessage(message), token);
    const payloadSender = payload.request.from;
    if (recoveredPublicKeyToken === payloadSender) {
      return true;
    } else {
      return false;
    }
  }
  async verifyCaptcha(token: any, ip: any) {
    console.log(token, ip);
    try {
      const { data } = await firstValueFrom(
        this.httpService.post(
          `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${token}$remoteip=${ip}`,
        ),
      );
      return data.success;
    } catch (error) {
      throw error;
    }
  }
  async relay(payload: any) {
    const provider = new JsonRpcProvider(
      'https://rpc-mumbai.maticvigil.com/',
      80001,
    );
    const signer = new Wallet(process.env.PRIVATE_KEY, provider);
    const forwarder = new Contract(
      '0xAd5CF9924Fe942812F339438Ca310F4632dC1285',
      ForwarderAbi,
      signer,
    );
    const valid = await forwarder.verify(payload.request, payload.signature);
    if (!valid) {
      throw new Error('Invalid signature for request');
    }
    const gasLimit = (parseInt(payload.request.gas) || 0) + 50000;
    const gasPrice = (await forwarder.runner.provider.getFeeData())
      .maxFeePerGas;
    const excute = await forwarder.execute(payload.request, payload.signature, {
      gasLimit,
      gasPrice,
    });
    return excute;
  }
}