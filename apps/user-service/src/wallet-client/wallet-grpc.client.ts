import { Inject, Injectable, OnModuleInit } from "@nestjs/common";
import { ClientGrpc } from "@nestjs/microservices";
import { firstValueFrom, Observable } from "rxjs";

interface WalletGrpcService {
  createWallet(data: { user_id: string }): Observable<unknown>;
}

@Injectable()
export class WalletGrpcClient implements OnModuleInit {
  private wallet!: WalletGrpcService;

  constructor(@Inject("WALLET_PACKAGE") private readonly client: ClientGrpc) {}

  onModuleInit() {
    this.wallet = this.client.getService<WalletGrpcService>("WalletService");
  }

  async ensureWalletForUser(userId: string): Promise<void> {
    await firstValueFrom(this.wallet.createWallet({ user_id: userId }));
  }
}
