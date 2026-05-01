import type { LocaleCode, TripCategory, TripSubcategory } from "$lib/types";

export const defaultLocale: LocaleCode = "zh-TW";

export const categoryLabels: Record<LocaleCode, Record<TripCategory, string>> = {
  "zh-TW": {
    transport: "交通",
    stay: "住宿",
    restaurant: "餐飲",
    sight: "景點",
    shopping: "購物",
    experience: "體驗",
    other: "其他"
  },
  en: {
    transport: "Transport",
    stay: "Stay",
    restaurant: "Restaurant",
    sight: "Sight",
    shopping: "Shopping",
    experience: "Experience",
    other: "Other"
  }
};

export const subcategoryLabels: Record<LocaleCode, Record<TripSubcategory, string>> = {
  "zh-TW": {
    flight: "航班",
    train: "火車",
    taxi: "計程車",
    drive: "開車",
    walk: "步行",
    bus: "巴士",
    metro: "地鐵",
    ferry: "渡輪",
    transfer: "接送",
    stay: "住宿",
    restaurant: "餐飲",
    sight: "景點",
    shopping: "購物",
    experience: "體驗",
    other: "其他"
  },
  en: {
    flight: "Flight",
    train: "Train",
    taxi: "Taxi",
    drive: "Drive",
    walk: "Walk",
    bus: "Bus",
    metro: "Metro",
    ferry: "Ferry",
    transfer: "Transfer",
    stay: "Stay",
    restaurant: "Restaurant",
    sight: "Sight",
    shopping: "Shopping",
    experience: "Experience",
    other: "Other"
  }
};

export function categoryLabel(category: string | undefined, locale: LocaleCode = defaultLocale) {
  return categoryLabels[locale][category as TripCategory] || category || categoryLabels[locale].other;
}

export function subcategoryLabel(subcategory: string | undefined, locale: LocaleCode = defaultLocale) {
  return subcategoryLabels[locale][subcategory as TripSubcategory] || subcategory || subcategoryLabels[locale].other;
}
