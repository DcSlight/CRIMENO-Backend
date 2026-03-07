import { ApiProperty } from "@nestjs/swagger";
import { IsIn, IsNotEmpty, IsString } from "class-validator";

export class SelectVideoDto {
  @ApiProperty({
    example: "/videos/shop.mp4",
    description: "Video source path",
  })
  @IsString()
  @IsNotEmpty()
  src!: string;

  @ApiProperty({
    example: "local",
    description: "Video type: local file path or online URL",
    enum: ["local", "online"],
  })
  @IsString()
  @IsIn(["local", "online"])
  videoType!: "local" | "online";
}