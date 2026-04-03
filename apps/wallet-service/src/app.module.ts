import { Module } from "@nestjs/common";
import { LoggerModule } from "nestjs-pino";
import { PrismaModule } from "./prisma/prisma.module";
import { UserClientModule } from "./user-client/user-client.module";
import { WalletModule } from "./wallet/wallet.module";

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
    UserClientModule,
    WalletModule,
  ],
})
export class AppModule {}
