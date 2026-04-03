import { Global, Module } from "@nestjs/common";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { walletProtoPath } from "../paths";
import { WalletGrpcClient } from "./wallet-grpc.client";

@Global()
@Module({
  imports: [
    ClientsModule.register([
      {
        name: "WALLET_PACKAGE",
        transport: Transport.GRPC,
        options: {
          package: "wallet",
          protoPath: walletProtoPath(),
          url: process.env.WALLET_GRPC_URL ?? "127.0.0.1:50052",
          loader: { keepCase: true, enums: String, longs: String, defaults: true, oneofs: true },
        },
      },
    ]),
  ],
  providers: [WalletGrpcClient],
  exports: [WalletGrpcClient],
})
export class WalletClientModule {}
