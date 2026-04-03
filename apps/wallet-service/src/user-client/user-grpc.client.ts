import { Inject, Injectable, OnModuleInit } from "@nestjs/common";
import { ClientGrpc, RpcException } from "@nestjs/microservices";
import { status } from "@grpc/grpc-js";
import { firstValueFrom } from "rxjs";

interface UserMessage {
  id: string;
  email: string;
  name: string;
  created_at: string;
}

interface UserGrpcService {
  getUserById(data: { id: string }): import("rxjs").Observable<UserMessage>;
}

@Injectable()
export class UserGrpcClient implements OnModuleInit {
  private user!: UserGrpcService;

  constructor(@Inject("USER_PACKAGE") private readonly client: ClientGrpc) {}

  onModuleInit() {
    this.user = this.client.getService<UserGrpcService>("UserService");
  }

  async assertUserExists(userId: string): Promise<void> {
    try {
      await firstValueFrom(this.user.getUserById({ id: userId }));
    } catch (err: unknown) {
      const code =
        typeof err === "object" && err !== null && "code" in err ? Number((err as { code: number }).code) : undefined;
      if (code === status.NOT_FOUND) {
        throw new RpcException({ code: status.NOT_FOUND, message: "User not found" });
      }
      throw err;
    }
  }
}
