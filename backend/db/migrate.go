package db

import (
	"fmt"
	"log"

	"github.com/golang-migrate/migrate/v4"
	_ "github.com/golang-migrate/migrate/v4/database/postgres"
	_ "github.com/golang-migrate/migrate/v4/source/file"
)

// RunMigrations executes all "up" migrations located in the migrations directory.
func RunMigrations(dsn string) error {
	// Construct the migration source URL
	// We assume the "migrations" folder is in the current working directory
	sourceURL := "file://migrations"

	// Standardize DSN for migrate (it expects postgres://...)
	// Our 'dsn' usually comes as a lib/pq string "host=...".
	// migrate/v4 with postgres driver can accept the same connection string usually,
	// OR we might need to convert it to a URL.
	// SAFEST: Let's assume we pass the format: "postgres://user:pass@host:port/dbname?sslmode=disable"
	// But currently our code generates "host=...".
	//
	// Let's create a specific DSN constructor for standard postgres URL which is safer for this library.

	m, err := migrate.New(sourceURL, dsn)
	if err != nil {
		return fmt.Errorf("failed to create migrate instance: %w", err)
	}

	if err := m.Up(); err != nil && err != migrate.ErrNoChange {
		return fmt.Errorf("failed to run up migrations: %w", err)
	}

	log.Println("Migrations ran successfully")
	return nil
}
