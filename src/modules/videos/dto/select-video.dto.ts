import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class SelectVideoDto {
  @ApiProperty({
    example: "/videos/shop.mp4",
    description: "Video source path",
  })
  @IsString()
  @IsNotEmpty()
  src!: string;
}