import { IsNotEmpty, IsUUID, Matches } from "class-validator";

const decimalPattern = /^\d+(\.\d+)?$/;

export class CreditWalletGrpcDto {
  @IsUUID()
  id!: string;

  /** Non-negative decimal string, e.g. "10" or "10.50" */
  @IsNotEmpty()
  @Matches(decimalPattern, { message: "amount must be a non-negative decimal string" })
  amount!: string;
}

export class DebitWalletGrpcDto {
  @IsUUID()
  id!: string;

  @IsNotEmpty()
  @Matches(decimalPattern, { message: "amount must be a non-negative decimal string" })
  amount!: string;
}
