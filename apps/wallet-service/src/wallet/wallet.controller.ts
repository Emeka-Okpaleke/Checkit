import { Controller, UsePipes, ValidationPipe } from "@nestjs/common";
import { GrpcMethod, RpcException } from "@nestjs/microservices";
import { status } from "@grpc/grpc-js";
import { CreditWalletGrpcDto, DebitWalletGrpcDto } from "./dto/amount.grpc.dto";
import { WalletService } from "./wallet.service";

@Controller()
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @GrpcMethod("WalletService", "CreateWallet")
  async createWallet(data: { user_id: string }) {
    try {
      return await this.walletService.createWallet(data.user_id);
    } catch (e: unknown) {
      if (e instanceof RpcException) {
        throw e;
      }
      const message = e instanceof Error ? e.message : "Create wallet failed";
      throw new RpcException({ code: status.INTERNAL, message });
    }
  }

  @GrpcMethod("WalletService", "GetWallet")
  async getWallet(data: { id: string }) {
    const wallet = await this.walletService.getWalletById(data.id);
    if (!wallet) {
      throw new RpcException({ code: status.NOT_FOUND, message: "Wallet not found" });
    }
    return wallet;
  }

  @GrpcMethod("WalletService", "CreditWallet")
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async creditWallet(data: CreditWalletGrpcDto & { id: string; amount: string }) {
    return this.walletService.creditWallet({
      id: data.id,
      amount: data.amount,
    });
  }

  @GrpcMethod("WalletService", "DebitWallet")
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async debitWallet(data: DebitWalletGrpcDto & { id: string; amount: string }) {
    return this.walletService.debitWallet({
      id: data.id,
      amount: data.amount,
    });
  }
}
