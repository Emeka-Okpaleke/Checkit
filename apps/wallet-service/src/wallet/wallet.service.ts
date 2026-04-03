import { Injectable } from "@nestjs/common";
import { RpcException } from "@nestjs/microservices";
import { Prisma } from "@assessment/prisma";
import { status } from "@grpc/grpc-js";
import { PrismaService } from "../prisma/prisma.service";
import { UserGrpcClient } from "../user-client/user-grpc.client";
import { CreditWalletGrpcDto, DebitWalletGrpcDto } from "./dto/amount.grpc.dto";

@Injectable()
export class WalletService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly userClient: UserGrpcClient,
  ) {}

  private mapWallet(w: { id: string; userId: string; balance: Prisma.Decimal; createdAt: Date }) {
    return {
      id: w.id,
      user_id: w.userId,
      balance: w.balance.toFixed(2),
      created_at: w.createdAt.toISOString(),
    };
  }

  async createWallet(userId: string) {
    await this.userClient.assertUserExists(userId);
    const wallet = await this.prisma.wallet.upsert({
      where: { userId },
      create: { userId },
      update: {},
    });
    return this.mapWallet(wallet);
  }

  async getWalletById(id: string) {
    const wallet = await this.prisma.wallet.findUnique({ where: { id } });
    if (!wallet) {
      return null;
    }
    return this.mapWallet(wallet);
  }

  async creditWallet(dto: CreditWalletGrpcDto) {
    const amount = new Prisma.Decimal(dto.amount);
    if (amount.lessThanOrEqualTo(0)) {
      throw new RpcException({ code: status.INVALID_ARGUMENT, message: "Amount must be positive" });
    }
    try {
      const wallet = await this.prisma.wallet.update({
        where: { id: dto.id },
        data: { balance: { increment: amount } },
      });
      return this.mapWallet(wallet);
    } catch (e: unknown) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025") {
        throw new RpcException({ code: status.NOT_FOUND, message: "Wallet not found" });
      }
      throw e;
    }
  }

  async debitWallet(dto: DebitWalletGrpcDto) {
    const amount = new Prisma.Decimal(dto.amount);
    if (amount.lessThanOrEqualTo(0)) {
      throw new RpcException({ code: status.INVALID_ARGUMENT, message: "Amount must be positive" });
    }
    try {
      const wallet = await this.prisma.$transaction(async (tx) => {
        const current = await tx.wallet.findUnique({ where: { id: dto.id } });
        if (!current) {
          throw new RpcException({ code: status.NOT_FOUND, message: "Wallet not found" });
        }
        if (current.balance.lessThan(amount)) {
          throw new RpcException({ code: status.FAILED_PRECONDITION, message: "Insufficient balance" });
        }
        return tx.wallet.update({
          where: { id: dto.id },
          data: { balance: { decrement: amount } },
        });
      });
      return this.mapWallet(wallet);
    } catch (e: unknown) {
      if (e instanceof RpcException) {
        throw e;
      }
      throw e;
    }
  }
}
