package main

import (
	"log"
	"password-manager/backend/internal/config"
	"password-manager/backend/internal/database"
	"password-manager/backend/internal/encryption"
	"password-manager/backend/internal/handlers"
	"password-manager/backend/internal/middleware"

	"github.com/gin-gonic/gin"
)

func main() {
	// Load configuration
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("Failed to load config: %v", err)
	}

	// Initialize database
	db, err := database.Initialize(cfg.DatabasePath)
	if err != nil {
		log.Fatalf("Failed to initialize database: %v", err)
	}
	defer db.Close()

	// Initialize encryption service
	crypto := encryption.NewService()

	// Initialize handlers
	authHandler := handlers.NewAuthHandler(crypto, db)
	passwordHandler := handlers.NewPasswordHandler(crypto, db)
	generatorHandler := handlers.NewGeneratorHandler()

	// Setup router
	router := gin.Default()

	// CORS middleware
	router.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", cfg.FrontendOrigin)
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	})

	// Health check
	router.GET("/api/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})

	// Auth routes (no auth required)
	authRoutes := router.Group("/api")
	{
		authRoutes.POST("/unlock", authHandler.Unlock)
		authRoutes.POST("/lock", authHandler.Lock)
	}

	// Protected routes
	protectedRoutes := router.Group("/api")
	protectedRoutes.Use(middleware.AuthMiddleware(crypto))
	{
		protectedRoutes.GET("/passwords", passwordHandler.List)
		protectedRoutes.POST("/passwords", passwordHandler.Create)
		protectedRoutes.PUT("/passwords/:id", passwordHandler.Update)
		protectedRoutes.DELETE("/passwords/:id", passwordHandler.Delete)
		protectedRoutes.POST("/generate", generatorHandler.Generate)
	}

	// Start server
	log.Printf("Server starting on %s", cfg.ServerAddress)
	if err := router.Run(cfg.ServerAddress); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
