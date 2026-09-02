package handlers

import (
	"net/http"
	"password-manager/backend/internal/encryption"
	"password-manager/backend/internal/models"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type PasswordHandler struct {
	crypto *encryption.Service
	db     *gorm.DB
}

func NewPasswordHandler(crypto *encryption.Service, db *gorm.DB) *PasswordHandler {
	return &PasswordHandler{
		crypto: crypto,
		db:     db,
	}
}

type PasswordRequest struct {
	Title       string `json:"title" binding:"required"`
	Username    string `json:"username" binding:"required"`
	Password    string `json:"password" binding:"required"`
	URL         string `json:"url"`
	Notes       string `json:"notes"`
	Category    string `json:"category"`
}

type PasswordResponse struct {
	ID          uint   `json:"id"`
	Title       string `json:"title"`
	Username    string `json:"username"`
	URL         string `json:"url"`
	Notes       string `json:"notes"`
	Category    string `json:"category"`
	CreatedAt   string `json:"created_at"`
	UpdatedAt   string `json:"updated_at"`
}

func (h *PasswordHandler) List(c *gin.Context) {
	var entries []models.VaultEntry
	if err := h.db.Order("created_at DESC").Find(&entries).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch passwords"})
		return
	}

	// Decrypt sensitive fields
	var response []PasswordResponse
	for _, entry := range entries {
		_, err := h.crypto.Decrypt(entry.EncryptedPassword)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to decrypt password"})
			return
		}

		url, _ := h.crypto.Decrypt(entry.EncryptedURL)
		notes, _ := h.crypto.Decrypt(entry.EncryptedNotes)

		response = append(response, PasswordResponse{
			ID:        entry.ID,
			Title:     entry.Title,
			Username:  entry.Username,
			URL:       string(url),
			Notes:     string(notes),
			Category:  entry.Category,
			CreatedAt: entry.CreatedAt.Format("2006-01-02 15:04:05"),
			UpdatedAt: entry.UpdatedAt.Format("2006-01-02 15:04:05"),
		})
	}

	c.JSON(http.StatusOK, response)
}

func (h *PasswordHandler) Create(c *gin.Context) {
	var req PasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	// Encrypt sensitive fields
	encryptedPassword, err := h.crypto.Encrypt([]byte(req.Password))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to encrypt password"})
		return
	}

	encryptedURL, err := h.crypto.Encrypt([]byte(req.URL))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to encrypt URL"})
		return
	}

	encryptedNotes, err := h.crypto.Encrypt([]byte(req.Notes))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to encrypt notes"})
		return
	}

	entry := models.VaultEntry{
		Title:            req.Title,
		Username:         req.Username,
		EncryptedPassword: encryptedPassword,
		EncryptedURL:     encryptedURL,
		EncryptedNotes:   encryptedNotes,
		Category:         req.Category,
	}

	if err := h.db.Create(&entry).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save password"})
		return
	}

	c.JSON(http.StatusCreated, PasswordResponse{
		ID:        entry.ID,
		Title:     entry.Title,
		Username:  entry.Username,
		URL:       req.URL,
		Notes:     req.Notes,
		Category:  entry.Category,
		CreatedAt: entry.CreatedAt.Format("2006-01-02 15:04:05"),
		UpdatedAt: entry.UpdatedAt.Format("2006-01-02 15:04:05"),
	})
}

func (h *PasswordHandler) Update(c *gin.Context) {
	id := c.Param("id")

	var entry models.VaultEntry
	if err := h.db.First(&entry, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Password not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	var req PasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	// Encrypt sensitive fields
	encryptedPassword, err := h.crypto.Encrypt([]byte(req.Password))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to encrypt password"})
		return
	}

	encryptedURL, err := h.crypto.Encrypt([]byte(req.URL))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to encrypt URL"})
		return
	}

	encryptedNotes, err := h.crypto.Encrypt([]byte(req.Notes))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to encrypt notes"})
		return
	}

	entry.Title = req.Title
	entry.Username = req.Username
	entry.EncryptedPassword = encryptedPassword
	entry.EncryptedURL = encryptedURL
	entry.EncryptedNotes = encryptedNotes
	entry.Category = req.Category

	if err := h.db.Save(&entry).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update password"})
		return
	}

	c.JSON(http.StatusOK, PasswordResponse{
		ID:        entry.ID,
		Title:     entry.Title,
		Username:  entry.Username,
		URL:       req.URL,
		Notes:     req.Notes,
		Category:  entry.Category,
		CreatedAt: entry.CreatedAt.Format("2006-01-02 15:04:05"),
		UpdatedAt: entry.UpdatedAt.Format("2006-01-02 15:04:05"),
	})
}

func (h *PasswordHandler) Delete(c *gin.Context) {
	id := c.Param("id")

	if err := h.db.Delete(&models.VaultEntry{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete password"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Password deleted"})
}
