package config

import (
	"fmt"
	"os"
	"strconv"
)

type Config struct {
	ServerAddress string
	DatabasePath  string
	FrontendOrigin string
}

func Load() (*Config, error) {
	cfg := &Config{
		ServerAddress: getEnvOrDefault("SERVER_ADDRESS", ":8080"),
		DatabasePath:  getEnvOrDefault("DATABASE_PATH", "./vault.db"),
		FrontendOrigin: getEnvOrDefault("FRONTEND_ORIGIN", "http://localhost:5173"),
	}

	return cfg, nil
}

func getEnvOrDefault(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

func getEnvAsIntOrDefault(key string, defaultValue int) int {
	if value := os.Getenv(key); value != "" {
		if intValue, err := strconv.Atoi(value); err == nil {
			return intValue
		}
	}
	return defaultValue
}

func (c *Config) Validate() error {
	if c.ServerAddress == "" {
		return fmt.Errorf("server address is required")
	}
	if c.DatabasePath == "" {
		return fmt.Errorf("database path is required")
	}
	if c.FrontendOrigin == "" {
		return fmt.Errorf("frontend origin is required")
	}
	return nil
}
