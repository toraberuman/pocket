# Pocket Trip I18n Strategy

Last updated: 2026-04-29

This document defines how Pocket Trip handles multilingual UI and language-neutral data values.

## Principles

- Database values for structured fields should be language-neutral codes.
- UI labels should be resolved through locale dictionaries.
- User-authored content can stay as entered until a real translation workflow is needed.
- Place data should keep both `name` and `native_name` before introducing full multilingual content fields.

## Locales

Initial locales:

- `zh-TW`
- `en`

Future candidates:

- `ja`
- `ko`

## Structured Codes

These values should be stored in D1 as codes, not display labels.

### category

| Code | zh-TW | en |
| --- | --- | --- |
| `transport` | 交通 | Transport |
| `stay` | 住宿 | Stay |
| `restaurant` | 餐廳 | Restaurant |
| `sight` | 景點 | Sight |
| `shopping` | 購物 | Shopping |
| `experience` | 體驗 | Experience |
| `other` | 其他 | Other |

### subcategory

| Code | zh-TW | en |
| --- | --- | --- |
| `flight` | 航班 | Flight |
| `train` | 列車 | Train |
| `taxi` | 計程車 | Taxi |
| `drive` | 開車 | Drive |
| `walk` | 步行 | Walk |
| `bus` | 公車 | Bus |
| `metro` | 地鐵 | Metro |
| `ferry` | 渡輪 | Ferry |
| `transfer` | 接送 | Transfer |
| `stay` | 住宿 | Stay |
| `restaurant` | 餐廳 | Restaurant |
| `sight` | 景點 | Sight |
| `shopping` | 購物 | Shopping |
| `experience` | 體驗 | Experience |
| `other` | 其他 | Other |

## UI Dictionaries

UI labels should live in code, initially under:

- `src/lib/i18n/labels.ts`

This includes:

- category labels
- subcategory labels
- future payment labels
- future split labels
- future common UI labels

## User Content

Keep these fields as user-entered text for now:

- `trips.title`
- `trip_items.notes`
- `places.name`
- `places.native_name`
- `expense_entries.label`
- `detail_json.roomInfo`
- `detail_json.items[].name`
- `detail_json.items[].nativeName`

If multilingual authored content becomes necessary later, use JSON fields such as:

- `title_i18n_json`
- `notes_i18n_json`
- `label_i18n_json`

Example:

```json
{
  "zh-TW": "2026.04 韓國賞櫻",
  "en": "2026 Korea Spring Trip"
}
```

## Migration Notes

Old data may contain Chinese labels in `category` or `subcategory`.

For new records:

- store code values only
- display labels through dictionaries

If old data needs to be preserved later, create a one-time migration mapping:

- `交通` -> `transport`
- `住宿` -> `stay`
- `食` -> `restaurant`
- `餐廳` -> `restaurant`
- `景點` -> `sight`
- `購物` -> `shopping`
- `體驗` -> `experience`
- `其他` -> `other`
