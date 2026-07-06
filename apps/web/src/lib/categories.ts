const CATEGORY_ICONS: Record<string, string> = {
  FOOD_AND_DRINK: 'utensils',
  RENT_AND_UTILITIES: 'home',
  TRANSPORTATION: 'car',
  GENERAL_MERCHANDISE: 'shopping-bag',
  ENTERTAINMENT: 'clapperboard',
  SUBSCRIPTIONS: 'repeat',
  INCOME: 'arrow-down-left',
  OTHER: 'circle-dashed',
};

export function getCategoryIcon(category: string | null): string {
  if (!category) return 'circle-dashed';
  const key = category.toUpperCase().replace(/\s+/g, '_');
  return CATEGORY_ICONS[key] ?? 'circle-dashed';
}

export function formatCategoryLabel(category: string | null): string {
  if (!category) return 'Other';
  return category
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
