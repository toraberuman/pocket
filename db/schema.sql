create table if not exists trips (
  id text primary key,
  slug text not null unique,
  title text not null,
  destination text not null,
  start_date text not null,
  end_date text not null,
  traveler_count integer not null default 1,
  default_currency text not null default 'TWD',
  cover_image_url text,
  is_private integer not null default 0,
  view_password_hash text,
  edit_password_hash text,
  notes_json text not null default '[]',
  created_at text not null default current_timestamp,
  updated_at text not null default current_timestamp
);

create table if not exists places (
  id text primary key,
  google_place_id text,
  maps_url text,
  name text not null,
  native_name text,
  phone text,
  address text,
  website_url text,
  reservation_url text,
  lat real,
  lng real,
  raw_payload_json text,
  created_at text not null default current_timestamp,
  updated_at text not null default current_timestamp
);

create table if not exists trip_items (
  id text primary key,
  trip_id text not null references trips(id) on delete cascade,
  place_id text references places(id) on delete set null,
  day_date text not null,
  start_time text,
  end_time text,
  category text not null,
  subcategory text,
  reservation_status text,
  payment_method text,
  card_label text,
  amount real,
  currency text,
  notes text,
  detail_json text,
  created_at text not null default current_timestamp,
  updated_at text not null default current_timestamp
);

create table if not exists expense_entries (
  id text primary key,
  trip_item_id text not null references trip_items(id) on delete cascade,
  label text not null,
  category text,
  original_amount real,
  original_currency text,
  paid_amount real,
  paid_currency text,
  fx_rate real,
  payment_method text,
  card_label text,
  paid_by text,
  split_basis text,
  expense_date text,
  statement_date text,
  is_reconciled integer not null default 0,
  memo text,
  created_at text not null default current_timestamp,
  updated_at text not null default current_timestamp
);

create table if not exists expense_splits (
  id text primary key,
  expense_entry_id text not null references expense_entries(id) on delete cascade,
  person_name text not null,
  share_type text not null,
  share_value real,
  owed_amount real,
  owed_currency text,
  settled_amount real,
  settled_at text,
  memo text,
  created_at text not null default current_timestamp,
  updated_at text not null default current_timestamp
);

create index if not exists idx_trip_items_trip_day on trip_items(trip_id, day_date, start_time);
create index if not exists idx_trip_items_trip_subcategory on trip_items(trip_id, subcategory);
create index if not exists idx_places_google_place_id on places(google_place_id);
create index if not exists idx_expense_entries_trip_item on expense_entries(trip_item_id);
create index if not exists idx_expense_entries_paid_by on expense_entries(paid_by);
create index if not exists idx_expense_splits_entry on expense_splits(expense_entry_id);
