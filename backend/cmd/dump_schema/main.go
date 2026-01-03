package main

import (
	"context"
	"log"
	"os"

	"github.com/joho/godotenv"
	"github.com/user/resume-generator/backend/ent"

	_ "github.com/lib/pq"
)

func main() {
	// Try loading from .env in current directory or parent
	_ = godotenv.Load()
	_ = godotenv.Load(".env")

	// Standard connection string
	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		dsn = "host=" + getEnv("DB_HOST", "localhost") +
			" port=" + getEnv("DB_PORT", "5432") +
			" user=" + getEnv("DB_USER", "postgres") +
			" password=" + getEnv("DB_PASSWORD", "password") +
			" dbname=" + getEnv("DB_NAME", "resume_db") +
			" sslmode=" + getEnv("DB_SSLMODE", "disable")
	}

	client, err := ent.Open("postgres", dsn)
	if err != nil {
		log.Fatalf("failed opening connection to postgres: %v", err)
	}
	defer client.Close()

	// Dump the schema changes required to match the Ent schema.
	if err := client.Schema.WriteTo(context.Background(), os.Stdout); err != nil {
		log.Fatalf("failed printing schema: %v", err)
	}
}

func getEnv(key, fallback string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return fallback
}
