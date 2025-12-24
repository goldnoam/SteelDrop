
export type RewardType = 'HERO' | 'COINS' | 'EMPTY';

export interface HeroCard {
  id: string;
  name: string;
  power: string;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary' | 'Mythic';
  description: string;
  imageUrl: string;
}

export interface Slot {
  id: number;
  type: RewardType;
  label: string;
  color: string;
}

export interface GameState {
  coins: number;
  collection: HeroCard[];
  isDropping: boolean;
  lastReward: RewardType | null;
  streak: number;
}
