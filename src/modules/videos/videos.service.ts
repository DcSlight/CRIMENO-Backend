import { Injectable } from "@nestjs/common";

export type VideoOptionDto = {
  label: string;
  src: string;
};

@Injectable()
export class VideosService {
  getVideoOptions(): VideoOptionDto[] {
    return [
      { label: "Shop Camera", src: "/videos/shop.mp4" },
      { label: "Warehouse Camera", src: "/videos/warehouse.mp4" },
    ];
  }
}
