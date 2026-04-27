create table if not exists trips (
  id text primary key,
  slug text not null unique,
  title text not null,
  destination text not null,
  start_date text not null,
  end_date text not null,
  traveler_count integer not null default 1,
  cover_image_url text,
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

create index if not exists idx_trip_items_trip_day on trip_items(trip_id, day_date, start_time);
create index if not exists idx_places_google_place_id on places(google_place_id);
