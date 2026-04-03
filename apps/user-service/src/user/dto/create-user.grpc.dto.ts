import { IsEmail, IsNotEmpty, IsString, MaxLength } from "class-validator";

export class CreateUserGrpcDto {
  @IsEmail()
  email!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name!: string;
}
