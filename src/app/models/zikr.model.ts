export interface Zikr {
  _id?: string;
  category: string;
  text: string;
  count: number;
  benefit: string;
  reference: string;
  order: number;
  currentCount?: number;
  completed?: boolean;
}
