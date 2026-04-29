alter table trips add column is_private integer not null default 0;
alter table trips add column view_password_hash text;
alter table trips add column edit_password_hash text;
