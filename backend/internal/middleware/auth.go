package middleware

import (
	"net/http"
	"password-manager/backend/internal/encryption"

	"github.com/gin-gonic/gin"
)

func AuthMiddleware(crypto *encryption.Service) gin.HandlerFunc {
	return func(c *gin.Context) {
		if !crypto.IsUnlocked() {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "vault is locked"})
			c.Abort()
			return
		}
		c.Next()
	}
}
