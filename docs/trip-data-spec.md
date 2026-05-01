# Pocket Trip Data Spec

Last updated: 2026-04-29

This document is the working spec for Pocket Trip's trip model, item model, expense model, and editor behavior.

## Goals

- Keep trip viewing simple for travelers.
- Make trip editing structured enough to support different item types.
- Support expense review, reconciliation, and splitting later without reworking the core data model.
- Keep category-specific fields flexible while the product is still evolving.

## Current Direction

- `D1` is the primary application data store.
- `CSV` is an import/export artifact, not the long-term source of truth.
- `trip_items` stores common timeline fields.
- `places` stores reusable place data.
- `detail_json` stores category-specific fields.
- `expense_entries` and `expense_splits` will store money details and splitting.

## Core Entities

### trips

Represents one trip.

Recommended fields:

- `id`
- `slug`
- `title`
- `destination`
- `start_date`
- `end_date`
- `traveler_count`
- `cover_image_url`
- `notes_json`
- `is_private`
- `view_password_hash`
- `edit_password_hash`

Possible future fields:

- `default_currency`
- `settlement_currency`
- `members_json`
- `archived`

### places

Stores shared place-level information.

Recommended fields:

- `id`
- `maps_url`
- `google_place_id`
- `name`
- `native_name`
- `phone`
- `address`
- `website_url`
- `reservation_url`
- `lat`
- `lng`
- `updated_at`

### trip_items

Represents one itinerary event on the timeline.

Recommended fields:

- `id`
- `trip_id`
- `place_id`
- `day_date`
- `start_time`
- `end_time`
- `category`
- `subcategory`
- `reservation_status`
- `payment_method`
- `card_label`
- `amount`
- `currency`
- `notes`
- `detail_json`
- `updated_at`

Notes:

- `amount` and `currency` stay here as timeline summary fields.
- Full expense accounting belongs in `expense_entries`.

### expense_entries

Represents one actual cost entry linked to a trip item.

Recommended fields:

- `id`
- `trip_item_id`
- `label`
- `category`
- `original_amount`
- `original_currency`
- `paid_amount`
- `paid_currency`
- `fx_rate`
- `payment_method`
- `card_label`
- `paid_by`
- `split_basis`
- `expense_date`
- `statement_date`
- `is_reconciled`
- `memo`
- `created_at`
- `updated_at`

Notes:

- `original_*` stores the travel-time amount and currency.
- `paid_*` stores the actual bank charge amount and currency.
- `split_basis` should support:
  - `original`
  - `paid`

### expense_splits

Represents who owes what for one expense entry.

Recommended fields:

- `id`
- `expense_entry_id`
- `person_name`
- `share_type`
- `share_value`
- `owed_amount`
- `owed_currency`
- `settled_amount`
- `settled_at`
- `memo`
- `created_at`
- `updated_at`

Recommended `share_type` values:

- `equal`
- `fixed`
- `weight`
- `excluded`

## Category Model

### Primary categories

- `交通`
- `住宿`
- `餐廳`
- `景點`
- `購物`
- `體驗`
- `其他`

### Recommended subcategories

#### 交通

- `航班`
- `列車`
- `計程車`
- `開車`
- `步行`
- `巴士`
- `地鐵`
- `渡輪`
- `接送`

#### Other categories

- `住宿`
- `餐廳`
- `景點`
- `購物`
- `體驗`
- `其他`

## detail_json Conventions

Use `detail_json` for category-specific fields.

### Flight fields

Suggested keys:

- `flightNumber`
- `airline`
- `carrierCode`
- `fromAirportCode`
- `fromAirportName`
- `fromTerminal`
- `toAirportCode`
- `toAirportName`
- `toTerminal`
- `scheduledDeparture`
- `scheduledArrival`
- `estimatedDeparture`
- `estimatedArrival`
- `status`
- `gate`
- `seat`
- `cabinClass`
- `bookingReference`
- `baggage`
- `checkInUrl`
- `lastSyncedAt`

### Train fields

Suggested keys:

- `trainNumber`
- `trainType`
- `carriageClass`
- `carNumber`
- `seat`
- `fromStation`
- `toStation`
- `platform`
- `durationMinutes`
- `distanceKm`
- `operator`

### Taxi / drive / walk fields

Suggested shared keys:

- `provider`
- `fromName`
- `toName`
- `durationMinutes`
- `distanceKm`
- `routeNotes`

Extra driving keys:

- `parkingName`
- `parkingFee`
- `rentalCarCompany`
- `navigationUrl`
- `tollFee`
- `fuelFee`

### Stay fields

Suggested keys:

- `checkIn`
- `checkOut`
- `roomType`
- `roomInfo`
- `meals`
- `bookingReference`
- `bookingPlatform`
- `rooms`

Suggested `rooms` structure:

```json
[
  {
    "label": "Room1",
    "name": "Cabin U Ocean Village View(9~11F)",
    "size": "87平方米（1客廳、1卧室、1浴室）",
    "roomInfoUrl": "https://...",
    "facilityUrl": "https://..."
  }
]
```

### Restaurant fields

Suggested keys:

- `mealType`
- `cuisine`
- `bookingName`
- `bookingTime`
- `queueNotes`
- `menuUrl`
- `items`

Suggested `items` structure:

```json
[
  {
    "name": "海鮮刀削麵",
    "nativeName": "해물칼국수",
    "unitPrice": 12000,
    "quantity": 2,
    "subtotal": 24000
  }
]
```

### Shopping fields

Suggested keys:

- `storeType`
- `taxRefund`
- `items`

### Sight / experience fields

Suggested sight keys:

- `ticketType`
- `ticketPrice`
- `openingHours`
- `stayDurationMinutes`
- `highlights`
- `officialNotice`
- `bookingRequired`

Suggested experience keys:

- `experienceType`
- `operator`
- `bookingReference`
- `meetingPoint`
- `durationMinutes`
- `includedItems`
- `whatToBring`

## Editor UX Direction

### Shared principle

The editor should not show one giant generic form for every item type.

Instead:

- user chooses `category`
- user chooses `subcategory`
- editor shows the relevant fields for that type

### Flight create flow

Minimum manual input:

- `dayDate`
- `flightNumber`
- optional summary fields:
  - `paymentMethod`
  - `amount`
  - `notes`

Then:

- click `Auto fill`
- system attempts to populate:
  - airline
  - from/to airport
  - departure/arrival time
  - terminals
  - status
  - gate

Still manually editable:

- `seat`
- `cabinClass`
- `bookingReference`
- `baggage`
- `paymentMethod`
- `cardLabel`
- `amount`
- `currency`
- `notes`

## Expense UX Direction

Future trip-level pages:

- `Expenses`
- `Split`
- `Reconcile`

### Expenses

Shows all cost entries for a trip:

- by date
- by category
- by payer
- by original currency
- by paid currency
- by reconciled status

### Split

Shows:

- who owes what
- who paid what
- who has settled

### Reconcile

Shows:

- original foreign amount
- actual bank charge amount
- charge date / statement date
- card used
- reconciled or not

## Migration Plan

### Phase 1

- add `trip_items.subcategory`
- create `expense_entries`
- create `expense_splits`

### Phase 2

- update editor to support category/subcategory-specific forms
- allow one item to hold one or more expense entries

### Phase 3

- add dedicated `Expenses`, `Split`, and `Reconcile` trip pages

## Open Rules

These rules are currently assumed unless changed:

- `D1` is the canonical app data source.
- `CSV` is for import/export and fallback migration only.
- `subcategory` is a first-class column.
- category-specific fields stay in `detail_json` unless they become query-heavy later.
- `trip_items.amount/currency` remains as summary display data even after `expense_entries` is introduced.

## Change Process

When this spec changes:

1. update this file first
2. then update schema/migrations
3. then update TypeScript types
4. then update editor/viewer UI

## I18n Rule

Structured values such as `category`, `subcategory`, `share_type`, and `split_basis` should be stored as language-neutral codes.

Examples:

- `category = transport`
- `subcategory = flight`
- `split_basis = original`

Display labels should be resolved through i18n dictionaries. See [i18n-strategy.md](./i18n-strategy.md).
