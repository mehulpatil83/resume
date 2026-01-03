package db

import (
	"context"
	"fmt"
	"os"

	"github.com/user/resume-generator/backend/ent"

	_ "github.com/lib/pq"
)

var Client *ent.Client

func Connect() error {
	// dsn variable removed as we use psqlInfo below

	var err error

	// psqlInfo constructed below for lib/pq

	// Standard format for lib/pq: "host=localhost port=5432 user=postgres password=password dbname=resume_db sslmode=disable"
	// Re-doing the string construction properly for lib/pq

	var psqlInfo, migrationDSN string
	if dbURL := os.Getenv("DATABASE_URL"); dbURL != "" {
		psqlInfo = dbURL
		migrationDSN = dbURL
	} else {
		sslMode := getEnv("DB_SSLMODE", "disable")

		psqlInfo = fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=%s",
			getEnv("DB_HOST", "localhost"),
			getEnv("DB_PORT", "5432"),
			getEnv("DB_USER", "postgres"),
			getEnv("DB_PASSWORD", "password"),
			getEnv("DB_NAME", "resume_db"),
			sslMode)

		// URL format for golang-migrate
		migrationDSN = fmt.Sprintf("postgres://%s:%s@%s:%s/%s?sslmode=%s",
			getEnv("DB_USER", "postgres"),
			getEnv("DB_PASSWORD", "password"),
			getEnv("DB_HOST", "localhost"),
			getEnv("DB_PORT", "5432"),
			getEnv("DB_NAME", "resume_db"),
			sslMode)
	}

	// Run Golang-Migrate
	if err := RunMigrations(migrationDSN); err != nil {
		return fmt.Errorf("failed creating schema resources via migrate: %v", err)
	}

	Client, err = ent.Open("postgres", psqlInfo)
	if err != nil {
		return fmt.Errorf("failed opening connection to postgres: %v", err)
	}

	// Ent Auto-Migration (Hybrid mode: ensures DB is synced if migration file is missing)
	// In production, you might want to disable this and rely solely on RunMigrations.
	if getEnv("SKIP_AUTOMIGRATE", "false") != "true" {
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
