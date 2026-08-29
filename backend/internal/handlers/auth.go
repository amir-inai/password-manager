package handlers

import (
	"net/http"
	"password-manager/backend/internal/encryption"
	"password-manager/backend/internal/models"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type AuthHandler struct {
	crypto *encryption.Service
	db     *gorm.DB
}

func NewAuthHandler(crypto *encryption.Service, db *gorm.DB) *AuthHandler {
	return &AuthHandler{
		crypto: crypto,
		db:     db,
	}
}

type UnlockRequest struct {
	Password string `json:"password" binding:"required"`
}

type UnlockResponse struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
}

func (h *AuthHandler) Unlock(c *gin.Context) {
	var req UnlockRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	// Check if vault is already initialized
	var meta models.VaultMeta
	result := h.db.Where("key = ?", "salt").First(&meta)
	if result.Error == gorm.ErrRecordNotFound {
		// First time setup - initialize vault
		salt := h.crypto.GenerateSalt()
		key := h.crypto.DeriveKey(req.Password, salt)
		verificationHash := h.crypto.GenerateVerificationHash(key)

		// Store salt and verification hash
		h.db.Create(&models.VaultMeta{Key: "salt", Value: string(salt)})
		h.db.Create(&models.VaultMeta{Key: "verification_hash", Value: verificationHash})

		// Unlock the vault
		h.crypto.Unlock(req.Password, salt, verificationHash)

		c.JSON(http.StatusOK, UnlockResponse{
			Success: true,
			Message: "Vault initialized successfully",
		})
		return
	}

	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	// Vault exists - verify password
	var verificationHashMeta models.VaultMeta
	if err := h.db.Where("key = ?", "verification_hash").First(&verificationHashMeta).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	salt := []byte(meta.Value)
	verificationHash := verificationHashMeta.Value

	if err := h.crypto.Unlock(req.Password, salt, verificationHash); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid master password"})
		return
	}

	c.JSON(http.StatusOK, UnlockResponse{
		Success: true,
		Message: "Vault unlocked successfully",
	})
}

func (h *AuthHandler) Lock(c *gin.Context) {
	h.crypto.Lock()
	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Vault locked"})
}
