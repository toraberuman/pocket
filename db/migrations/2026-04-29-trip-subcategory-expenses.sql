alter table trip_items add column subcategory text;

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

create index if not exists idx_trip_items_trip_subcategory on trip_items(trip_id, subcategory);
create index if not exists idx_expense_entries_trip_item on expense_entries(trip_item_id);
create index if not exists idx_expense_entries_paid_by on expense_entries(paid_by);
create index if not exists idx_expense_splits_entry on expense_splits(expense_entry_id);
