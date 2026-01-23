import { ApiProperty } from "@nestjs/swagger";

export class SelectVideoDto {
  @ApiProperty({
    example: "/videos/shop.mp4",
    description: "Video source path",
  })
  src!: string;
}