import { Module } from "@nestjs/common";
import { LoggerModule } from "nestjs-pino";
import { PrismaModule } from "./prisma/prisma.module";
import { UserModule } from "./user/user.module";
import { WalletClientModule } from "./wallet-client/wallet-client.module";

@Module({
  imports: [
    LoggerModule.forRoot({
      pinoHttp: {
        transport:
          process.env.NODE_ENV !== "production"
            ? { target: "pino-pretty", options: { singleLine: true } }
            : undefined,
      },
    }),
    PrismaModule,
    WalletClientModule,
    UserModule,
  ],
})
export class AppModule {}
