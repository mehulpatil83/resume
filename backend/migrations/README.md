# Database Migrations

This project uses `golang-migrate` for database migrations.
The initial schema was generated from Ent.

## How to create a new migration

1.  Modify your Ent schema in `ent/schema`.
2.  Run the dumper tool (created in `cmd/dump_schema`) or use Ent's migration feature to generate the SQL.
    ```bash
    go run cmd/dump_schema/main.go > migrations/YYYYMMDDHHMMSS_name.up.sql
    ```
3.  Create a corresponding `.down.sql` file.

## Running Migrations

Migrations are automatically run on backend startup (checking `file://migrations`).
