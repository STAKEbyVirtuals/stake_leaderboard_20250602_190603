import { hierarchy, treemap } from "d3-hierarchy";
import { LeaderboardItem } from '../types';

export function useTreemapLayout(data: LeaderboardItem[], width: number, height: number) {
  if (!data || data.length === 0) return [];
  const root = hierarchy({ children: data } as any)
    .sum((d: any) => d.value)
    .sort((a, b) => (b.value as number) - (a.value as number));
  treemap().size([width, height]).paddingInner(2).paddingOuter(3)(root);
  return root.leaves();
} 