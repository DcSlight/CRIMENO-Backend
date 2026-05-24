import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsBoolean, IsIn, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class SelectVideoDto {

   @ApiProperty({
    example: "1",
    description: "buisness id",
  })
  @IsNumber()
  @IsNotEmpty()
  businessId!: number;

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

  @ApiPropertyOptional({
    example: false,
    description: "Whether to send business context to qwen before playback",
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  includeContext: boolean = false;
}