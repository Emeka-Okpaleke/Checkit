import { Controller, UsePipes, ValidationPipe } from "@nestjs/common";
import { GrpcMethod, RpcException } from "@nestjs/microservices";
import { Prisma } from "@assessment/prisma";
import { status } from "@grpc/grpc-js";
import { CreateUserGrpcDto } from "./dto/create-user.grpc.dto";
import { UserService } from "./user.service";

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @GrpcMethod("UserService", "CreateUser")
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async createUser(data: CreateUserGrpcDto & { email: string; name: string }) {
    try {
      const user = await this.userService.createUser({
        email: data.email,
        name: data.name,
      });
      return {
        id: user.id,
        email: user.email,
        name: user.name,
        created_at: user.createdAt.toISOString(),
      };
    } catch (e: unknown) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
        throw new RpcException({ code: status.ALREADY_EXISTS, message: "Email already exists" });
      }
      const message = e instanceof Error ? e.message : "Create user failed";
      throw new RpcException({ code: status.INTERNAL, message });
    }
  }

  @GrpcMethod("UserService", "GetUserById")
  async getUserById(data: { id: string }) {
    const user = await this.userService.getUserById(data.id);
    if (!user) {
      throw new RpcException({ code: status.NOT_FOUND, message: "User not found" });
    }
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      created_at: user.createdAt.toISOString(),
    };
  }
}
