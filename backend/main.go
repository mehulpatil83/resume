package main

import (
	"context"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/user/resume-generator/backend/db"
	"github.com/user/resume-generator/backend/routes"
)

func main() {
	// Initialize Database (Ent)
	if err := db.Connect(); err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer db.Client.Close()
	log.Println("Database connection and migration successful")

	// Seed default user
	_, _ = db.Client.User.Create().
		SetEmail("test@example.com").
		SetFullName("Test User").
		SetPasswordHash("dummyhash").
		Save(context.Background())
	// Ignore error if user already exists (unique constraint)

	r := gin.Default()

	// CORS Middleware
	r.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	})

	routes.SetupRoutes(r)

	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status": "up",
		})
	})

	log.Println("Server running on :8081")
	if err := r.Run(":8081"); err != nil {
		log.Fatalf("Failed to run server: %v", err)
	}
}
