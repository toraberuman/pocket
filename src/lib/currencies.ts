export type CurrencyCode = "JPY" | "KRW" | "USD" | "GBP" | "EUR" | "TWD";

export type CurrencyOption = {
  code: CurrencyCode;
  label: string;
  symbol: string;
};

export const defaultCurrencyCode: CurrencyCode = "TWD";

export const currencyOptions: CurrencyOption[] = [
  { code: "JPY", label: "JPY - 日圓", symbol: "¥" },
  { code: "KRW", label: "KRW - 韓元", symbol: "₩" },
  { code: "USD", label: "USD - 美元", symbol: "$" },
  { code: "GBP", label: "GBP - 英鎊", symbol: "£" },
  { code: "EUR", label: "EUR - 歐元", symbol: "€" },
  { code: "TWD", label: "TWD - 新台幣", symbol: "NT$" }
];

const currencyCodes = new Set(currencyOptions.map((option) => option.code));

export function normalizeCurrency(value?: string | null): CurrencyCode {
  const code = String(value || "").trim().toUpperCase();
  return currencyCodes.has(code as CurrencyCode) ? (code as CurrencyCode) : defaultCurrencyCode;
}

export function currencySymbol(currency?: string | null) {
  const value = String(currency || "").trim();
  if (!value) return "";

  const option = currencyOptions.find((entry) => entry.code === normalizeCurrency(value));
  return option?.symbol || `${value.toUpperCase()} `;
}

export function formatCurrencyAmount(amount?: number | null, currency?: string | null, options?: { maximumFractionDigits?: number }) {
  if (typeof amount !== "number" || !Number.isFinite(amount)) return "";

  const maximumFractionDigits = options?.maximumFractionDigits ?? (Number.isInteger(amount) ? 0 : 2);
  return `${currencySymbol(currency)}${amount.toLocaleString("en-US", {
    maximumFractionDigits,
    minimumFractionDigits: 0
  })}`;
}

export function parseCurrencyAmount(value?: string | number | null) {
  if (typeof value === "number") return Number.isFinite(value) ? value : undefined;
  const number = Number(String(value || "").replace(/[^\d.-]/g, ""));
  return Number.isFinite(number) ? number : undefined;
}
