import { Global, Module } from "@nestjs/common";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { userProtoPath } from "../paths";
import { UserGrpcClient } from "./user-grpc.client";

@Global()
@Module({
  imports: [
    ClientsModule.register([
      {
        name: "USER_PACKAGE",
        transport: Transport.GRPC,
        options: {
          package: "user",
          protoPath: userProtoPath(),
          url: process.env.USER_GRPC_URL ?? "127.0.0.1:50051",
          loader: { keepCase: true, enums: String, longs: String, defaults: true, oneofs: true },
        },
      },
    ]),
  ],
  providers: [UserGrpcClient],
  exports: [UserGrpcClient],
})
export class UserClientModule {}
