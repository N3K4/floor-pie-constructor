export interface CoatingType {
  id: string;
  name: string;
  thickness: string;
  color: string;
  pattern: string;
}

export interface PieLayer {
  id: string;
  coatingType: CoatingType;
  order: number;
}

export interface Pie {
  id: string;
  number: string;
  name: string;
  layers: PieLayer[];
}
