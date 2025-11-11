
export type AspectRatio = "1:1" | "16:9" | "9:16" | "4:3" | "3:4";

export interface AdSize {
  name: string;
  width: number;
  height: number;
}

export interface AdCopy {
  headline: string;
  cta: string;
  sizeName: string;
}

export interface GeneratedAd extends AdCopy {
  size: AdSize;
}
