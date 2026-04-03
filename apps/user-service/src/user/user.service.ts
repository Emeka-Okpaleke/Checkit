import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { WalletGrpcClient } from "../wallet-client/wallet-grpc.client";
import { CreateUserGrpcDto } from "./dto/create-user.grpc.dto";

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly walletClient: WalletGrpcClient,
  ) {}

  async createUser(dto: CreateUserGrpcDto) {
    const user = await this.prisma.user.create({
      data: { email: dto.email, name: dto.name },
    });
    await this.walletClient.ensureWalletForUser(user.id);
    return user;
  }

  async getUserById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }
}
