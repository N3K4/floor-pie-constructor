import { CoatingType } from './types';

export const coatingTypes: CoatingType[] = [
  {
    id: 'insulation',
    name: 'Засыпная изоляция',
    thickness: '210',
    color: '#D4C5A9',
    pattern: 'dots',
  },
  {
    id: 'asphalt',
    name: 'Асфальтобетон',
    thickness: '80 (40+40)',
    color: '#4A4A4A',
    pattern: 'gravel',
  },
  {
    id: 'screed',
    name: 'Стяжка ЦПС армированная',
    thickness: '100',
    color: '#B8B8B8',
    pattern: 'mesh',
  },
  {
    id: 'terrazzo',
    name: 'Тераццо',
    thickness: '30',
    color: '#C9B8A8',
    pattern: 'terrazzo',
  },
  {
    id: 'laminate',
    name: 'Ламинат',
    thickness: '10',
    color: '#C4A882',
    pattern: 'wood',
  },
  {
    id: 'parquet',
    name: 'Паркет',
    thickness: '10',
    color: '#8B6914',
    pattern: 'herringbone',
  },
  {
    id: 'wood',
    name: 'Деревянные покрытия',
    thickness: '10',
    color: '#A0784C',
    pattern: 'planks',
  },
  {
    id: 'linoleum',
    name: 'Линолеум',
    thickness: '6',
    color: '#7BA3A8',
    pattern: 'smooth',
  },
  {
    id: 'carpet',
    name: 'Ковровое покрытие',
    thickness: '6',
    color: '#8B7D6B',
    pattern: 'fibers',
  },
  {
    id: 'ceramic',
    name: 'Керамогранитная плитка',
    thickness: '6',
    color: '#E8DDD0',
    pattern: 'tiles',
  },
  {
    id: 'glue',
    name: 'Клеевой состав',
    thickness: '3',
    color: '#C8B89A',
    pattern: 'glue',
  },
  {
    id: 'metal',
    name: 'Металл покрытие',
    thickness: '5',
    color: '#A8B8C8',
    pattern: 'metal',
  },
];

/** Извлекает первое число из строки толщины для арифметических операций */
export function parseThicknessValue(str: string): number {
  const match = str.match(/[\d]+[.,]?\d*/);
  if (!match) return 0;
  return parseFloat(match[0].replace(',', '.'));
}
