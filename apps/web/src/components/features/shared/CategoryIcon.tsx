'use client';

import {
  CircleDashed,
  Clapperboard,
  Coffee,
  Home,
  Repeat,
  ShoppingBag,
  Utensils,
  Car,
  ArrowDownLeft,
  type LucideIcon,
} from 'lucide-react';
import { formatCategoryLabel } from '@/lib/categories';

const ICON_MAP: Record<string, LucideIcon> = {
  FOOD_AND_DRINK: Utensils,
  RENT_AND_UTILITIES: Home,
  TRANSPORTATION: Car,
  GENERAL_MERCHANDISE: ShoppingBag,
  ENTERTAINMENT: Clapperboard,
  SUBSCRIPTIONS: Repeat,
  INCOME: ArrowDownLeft,
  COFFEE: Coffee,
  OTHER: CircleDashed,
};

export function CategoryIcon({ category, size = 14 }: { category: string | null; size?: number }) {
  const key = (category ?? 'OTHER').toUpperCase().replace(/\s+/g, '_');
  const Icon = ICON_MAP[key] ?? CircleDashed;
  return <Icon size={size} strokeWidth={1.75} />;
}

export { formatCategoryLabel };
