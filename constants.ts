
import { AdSize, AspectRatio } from './types';

export const ASPECT_RATIOS: AspectRatio[] = ["1:1", "16:9", "9:16", "4:3", "3:4"];

export const STANDARD_AD_SIZES: AdSize[] = [
  { name: "Medium Rectangle", width: 300, height: 250 },
  { name: "Leaderboard", width: 728, height: 90 },
  { name: "Half Page", width: 300, height: 600 },
  { name: "Large Mobile Banner", width: 320, height: 100 },
  { name: "Skyscraper", width: 160, height: 600 },
  { name: "Large Rectangle", width: 336, height: 280 },
];
