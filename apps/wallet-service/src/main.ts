import { config } from "dotenv";
import { join } from "path";
import { ValidationPipe } from "@nestjs/common";

config({ path: join(__dirname, "..", "..", "..", ".env") });
import { NestFactory } from "@nestjs/core";
import { MicroserviceOptions, Transport } from "@nestjs/microservices";
import { Logger } from "nestjs-pino";
import { AppModule } from "./app.module";
import { walletProtoPath } from "./paths";

async function bootstrap() {
  const grpcUrl = process.env.WALLET_GRPC_URL ?? "0.0.0.0:50052";
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.GRPC,
    options: {
      package: "wallet",
      protoPath: walletProtoPath(),
      url: grpcUrl,
      loader: { keepCase: true, enums: String, longs: String, defaults: true, oneofs: true },
    },
    bufferLogs: true,
  });
  app.useLogger(app.get(Logger));
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  await app.listen();
}

bootstrap().catch((err) => {
  console.error(err);
  process.exit(1);
});
