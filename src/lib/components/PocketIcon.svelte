<script lang="ts">
  type IconName =
    | "calendar"
    | "calendar-plus"
    | "receipt"
    | "briefcase"
    | "cart"
    | "chevron-left"
    | "chevron-right"
    | "map"
    | "map-pin"
    | "train"
    | "utensils"
    | "camera"
    | "building"
    | "bed"
    | "tree"
    | "plane"
    | "car"
    | "taxi"
    | "walk"
    | "footprints"
    | "bus"
    | "tram"
    | "route"
    | "spark"
    | "lock"
    | "plus"
    | "pencil"
    | "edit"
    | "edit-3"
    | "eye"
    | "trash"
    | "x"
    | "search"
    | "clock"
    | "wallet"
    | "credit-card"
    | "banknote"
    | "qr-code"
    | "phone"
    | "users"
    | "star"
    | "coffee"
    | "moon"
    | "sun"
    | "bath"
    | "eye"
    | "wind"
    | "wifi"
    | "image"
    | "external-link"
    | "shopping-bag";

  let { name, size = 20, strokeWidth = 1.8 }: { name: IconName; size?: number; strokeWidth?: number } = $props();
</script>

<svg
  width={size}
  height={size}
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width={strokeWidth}
  stroke-linecap="round"
  stroke-linejoin="round"
  aria-hidden="true"
>
  {#if name === "calendar"}
    <path d="M8 2v4m8-4v4" />
    <rect width="18" height="18" x="3" y="4" rx="2" />
    <path d="M3 10h18M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01" />
  {:else if name === "calendar-plus"}
    <path d="M8 2v4" />
    <path d="M16 2v4" />
    <rect x="3" y="5" width="18" height="16" rx="1" />
    <path d="M3 10h18" />
    <path d="M12 14v4" />
    <path d="M10 16h4" />
  {:else if name === "receipt"}
    <path d="M12 17V7m4 1h-6a2 2 0 0 0 0 4h4a2 2 0 0 1 0 4H8" />
    <path d="M4 3a1 1 0 0 1 1-1a1.3 1.3 0 0 1 .7.2l.933.6a1.3 1.3 0 0 0 1.4 0l.934-.6a1.3 1.3 0 0 1 1.4 0l.933.6a1.3 1.3 0 0 0 1.4 0l.933-.6a1.3 1.3 0 0 1 1.4 0l.934.6a1.3 1.3 0 0 0 1.4 0l.933-.6A1.3 1.3 0 0 1 19 2a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1a1.3 1.3 0 0 1-.7-.2l-.933-.6a1.3 1.3 0 0 0-1.4 0l-.934.6a1.3 1.3 0 0 1-1.4 0l-.933-.6a1.3 1.3 0 0 0-1.4 0l-.933.6a1.3 1.3 0 0 1-1.4 0l-.934-.6a1.3 1.3 0 0 0-1.4 0l-.933.6a1.3 1.3 0 0 1-.7.2a1 1 0 0 1-1-1z" />
  {:else if name === "briefcase"}
    <path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    <rect width="20" height="14" x="2" y="6" rx="2" />
  {:else if name === "cart"}
    <path d="M4 5h2l2 11h10l2-8H8" />
    <circle cx="10" cy="20" r="1" />
    <circle cx="18" cy="20" r="1" />
  {:else if name === "chevron-left"}
    <path d="m15 18-6-6 6-6" />
  {:else if name === "chevron-right"}
    <path d="m9 18 6-6-6-6" />
  {:else if name === "map"}
    <path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3V6Z" />
    <path d="M9 3v15" />
    <path d="M15 6v15" />
  {:else if name === "map-pin"}
    <path d="M12 21s7-5.2 7-12a7 7 0 1 0-14 0c0 6.8 7 12 7 12Z" />
    <circle cx="12" cy="9" r="2" />
  {:else if name === "train"}
    <rect x="5" y="3" width="14" height="14" rx="2" />
    <path d="M8 17 6 21" />
    <path d="m16 17 2 4" />
    <path d="M8 8h8" />
    <path d="M8 13h.01" />
    <path d="M16 13h.01" />
  {:else if name === "utensils"}
    <path d="M4 3v8" />
    <path d="M7 3v8" />
    <path d="M4 7h3" />
    <path d="M5.5 11v10" />
    <path d="M17 3v18" />
    <path d="M17 3c3 2 3 6 0 8" />
  {:else if name === "camera"}
    <path d="M4 7h4l2-3h4l2 3h4v13H4V7Z" />
    <circle cx="12" cy="13" r="3" />
  {:else if name === "building"}
    <rect x="4" y="4" width="16" height="17" rx="1" />
    <path d="M8 8h.01" />
    <path d="M12 8h.01" />
    <path d="M16 8h.01" />
    <path d="M8 12h.01" />
    <path d="M12 12h.01" />
    <path d="M16 12h.01" />
    <path d="M10 21v-5h4v5" />
  {:else if name === "bed"}
    <path d="M2 20v-8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v8" />
    <path d="M4 10V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4" />
    <path d="M12 4v6" />
    <path d="M2 18h20" />
  {:else if name === "tree"}
    <path d="M12 3 4 14h5l-3 5h12l-3-5h5L12 3Z" />
    <path d="M12 19v3" />
  {:else if name === "plane"}
    <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2" />
  {:else if name === "car"}
    <path d="M5 16h14" />
    <path d="m6 16 2-6h8l2 6" />
    <circle cx="8" cy="18" r="1.5" />
    <circle cx="16" cy="18" r="1.5" />
  {:else if name === "taxi"}
    <path d="M10 2h4l1 3h-6l1-3Z" />
    <path d="M5 16h14" />
    <path d="m6 16 2-7h8l2 7" />
    <circle cx="8" cy="18" r="1.5" />
    <circle cx="16" cy="18" r="1.5" />
  {:else if name === "walk"}
    <circle cx="13" cy="4" r="2" />
    <path d="m10 22 2-7-3-3 2-4 4 2 2 4" />
    <path d="m15 22-3-7" />
  {:else if name === "footprints"}
    <path d="M4 16v-2.5a2.5 2.5 0 0 1 5 0V16a2.5 2.5 0 0 1-5 0Z" />
    <path d="M15 10V7.5a2.5 2.5 0 0 1 5 0V10a2.5 2.5 0 0 1-5 0Z" />
    <path d="M7 19v1" />
    <path d="M18 13v1" />
  {:else if name === "bus"}
    <rect x="5" y="3" width="14" height="15" rx="2" />
    <path d="M7 8h10" />
    <path d="M8 18v2" />
    <path d="M16 18v2" />
    <path d="M8 14h.01" />
    <path d="M16 14h.01" />
  {:else if name === "tram"}
    <rect x="5" y="3" width="14" height="14" rx="2" />
    <path d="M7 17 5 21" />
    <path d="m17 17 2 4" />
    <path d="M9 3 8 1" />
    <path d="m15 3 1-2" />
    <path d="M8 8h8" />
    <path d="M8 13h.01" />
    <path d="M16 13h.01" />
  {:else if name === "route"}
    <circle cx="6" cy="6" r="2" />
    <circle cx="18" cy="18" r="2" />
    <path d="M8 6h4a4 4 0 0 1 0 8H8a4 4 0 0 0 0 8h2" />
  {:else if name === "spark"}
    <path d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z" />
    <path d="m19 16 .8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8L19 16Z" />
  {:else if name === "lock"}
    <rect x="5" y="10" width="14" height="11" rx="1" />
    <path d="M8 10V7a4 4 0 0 1 8 0v3" />
  {:else if name === "plus"}
    <path d="M12 5v14" />
    <path d="M5 12h14" />
  {:else if name === "pencil" || name === "edit" || name === "edit-3"}
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5Z" />
  {:else if name === "eye"}
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
    <circle cx="12" cy="12" r="3" />
  {:else if name === "trash"}
    <path d="M3 6h18" />
    <path d="M8 6V4h8v2" />
    <path d="M19 6 18 20H6L5 6" />
    <path d="M10 11v5" />
    <path d="M14 11v5" />
  {:else if name === "x"}
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  {:else if name === "search"}
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  {:else if name === "clock"}
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  {:else if name === "wallet"}
    <path d="M3 7h16a2 2 0 0 1 2 2v9H5a2 2 0 0 1-2-2V7Z" />
    <path d="M3 7V6a2 2 0 0 1 2-2h12v3" />
    <path d="M16 13h.01" />
  {:else if name === "credit-card"}
    <rect x="2" y="5" width="20" height="14" rx="2" />
    <path d="M2 10h20" />
  {:else if name === "banknote"}
    <rect x="3" y="6" width="18" height="12" rx="2" />
    <circle cx="12" cy="12" r="2" />
    <path d="M6 12h.01M18 12h.01" />
  {:else if name === "qr-code"}
    <rect x="3" y="3" width="5" height="5" rx="1" />
    <rect x="16" y="3" width="5" height="5" rx="1" />
    <rect x="3" y="16" width="5" height="5" rx="1" />
    <path d="M12 7h.01M12 12h.01M12 17h.01M17 12h4M17 17h.01M21 21h-5v-5" />
  {:else if name === "phone"}
    <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.7.6 2.5a2 2 0 0 1-.4 2.1L8 9.6a16 16 0 0 0 6.4 6.4l1.3-1.3a2 2 0 0 1 2.1-.4c.8.3 1.6.5 2.5.6a2 2 0 0 1 1.7 2Z" />
  {:else if name === "users"}
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
  {:else if name === "star"}
    <path d="m12 2 3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14 2 9.27l6.91-1.01L12 2Z" />
  {:else if name === "coffee"}
    <path d="M10 2v2M14 2v2M16 8h1a4 4 0 0 1 0 8h-1" />
    <path d="M4 8h12v7a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5Z" />
    <path d="M6 2v2" />
  {:else if name === "moon"}
    <path d="M12 3a6 6 0 0 0 9 7.5A9 9 0 1 1 12 3Z" />
  {:else if name === "sun"}
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
  {:else if name === "bath"}
    <path d="M9 6 6.5 8.5M4 10h16v2a6 6 0 0 1-6 6H9a5 5 0 0 1-5-5v-3Z" />
    <path d="M6 20v-2M18 20v-2M5 10V5a2 2 0 0 1 4 0v1" />
  {:else if name === "wind"}
    <path d="M3 8h11a3 3 0 1 0-3-3" />
    <path d="M3 12h15a3 3 0 1 1-3 3" />
    <path d="M3 16h5" />
  {:else if name === "wifi"}
    <path d="M5 13a10 10 0 0 1 14 0" />
    <path d="M8.5 16.5a5 5 0 0 1 7 0" />
    <path d="M12 20h.01" />
  {:else if name === "image"}
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <circle cx="9" cy="9" r="2" />
    <path d="m21 15-3.1-3.1a2 2 0 0 0-2.8 0L6 21" />
  {:else if name === "external-link"}
    <path d="M15 3h6v6" />
    <path d="M10 14 21 3" />
    <path d="M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5" />
  {:else if name === "shopping-bag"}
    <path d="M6 8h12l-1 13H7L6 8Z" />
    <path d="M9 8a3 3 0 0 1 6 0" />
  {/if}
</svg>
