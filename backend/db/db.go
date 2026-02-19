package db

import (
	"context"
	"fmt"
	"log"
	"os"

	"github.com/user/resume-generator/backend/ent"

	_ "github.com/golang-migrate/migrate/v4/database/postgres"
	_ "github.com/golang-migrate/migrate/v4/database/sqlite3"
	_ "github.com/golang-migrate/migrate/v4/source/file"
	_ "github.com/lib/pq"
	_ "github.com/mattn/go-sqlite3"
)

var Client *ent.Client

func Connect() error {
	var err error
	var driverName, dataSourceName, migrationDSN string

	dbURL := os.Getenv("DATABASE_URL")
	if dbURL != "" {
		// Use provided URL directly
		driverName = "postgres" // Assuming postgres for now if URL provided, or parse scheme
		dataSourceName = dbURL
		migrationDSN = dbURL
	} else {
		// Check for specific Postgres env vars to indicate preference
		if os.Getenv("DB_USER") != "" {
			sslMode := getEnv("DB_SSLMODE", "disable")
			dataSourceName = fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=%s",
				getEnv("DB_HOST", "localhost"),
				getEnv("DB_PORT", "5432"),
				getEnv("DB_USER", "postgres"),
				getEnv("DB_PASSWORD", "password"),
				getEnv("DB_NAME", "resume_db"),
				sslMode)

			migrationDSN = fmt.Sprintf("postgres://%s:%s@%s:%s/%s?sslmode=%s",
				getEnv("DB_USER", "postgres"),
				getEnv("DB_PASSWORD", "password"),
				getEnv("DB_HOST", "localhost"),
				getEnv("DB_PORT", "5432"),
				getEnv("DB_NAME", "resume_db"),
				sslMode)
			driverName = "postgres"
		} else {
			// Default to SQLite
			driverName = "sqlite3"
			dataSourceName = "file:resume.db?cache=shared&_fk=1"
			migrationDSN = "sqlite3://resume.db"
			log.Println("Using SQLite database: resume.db")
		}
	}

	// Try running migrations if available
	if err := RunMigrations(migrationDSN); err != nil {
		log.Printf("Migration warning (can be ignored for new SQLite db): %v", err)
	}

	Client, err = ent.Open(driverName, dataSourceName)
	if err != nil {
		return fmt.Errorf("failed opening connection to %s: %v", driverName, err)
	}

	// Always run Auto-Migrate for SQLite to ensure tables exist
	if driverName == "sqlite3" || getEnv("SKIP_AUTOMIGRATE", "false") != "true" {
		if err := Client.Schema.Create(context.Background()); err != nil {
			return fmt.Errorf("failed creating schema resources: %v", err)
		}
	}

	return nil
}

func getEnv(key, fallback string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return fallback
}
