package handlers

import (
	"crypto/rand"
	"math/big"
	"net/http"

	"github.com/gin-gonic/gin"
)

type GeneratorHandler struct{}

func NewGeneratorHandler() *GeneratorHandler {
	return &GeneratorHandler{}
}

type GenerateRequest struct {
	Length           int  `json:"length"`
	IncludeUppercase bool `json:"include_uppercase"`
	IncludeLowercase bool `json:"include_lowercase"`
	IncludeNumbers   bool `json:"include_numbers"`
	IncludeSymbols   bool `json:"include_symbols"`
}

type GenerateResponse struct {
	Password string `json:"password"`
}

func (h *GeneratorHandler) Generate(c *gin.Context) {
	var req GenerateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	// Default values
	if req.Length <= 0 {
		req.Length = 16
	}
	if req.Length > 128 {
		req.Length = 128
	}

	// If no options selected, use all
	if !req.IncludeUppercase && !req.IncludeLowercase && !req.IncludeNumbers && !req.IncludeSymbols {
		req.IncludeUppercase = true
		req.IncludeLowercase = true
		req.IncludeNumbers = true
		req.IncludeSymbols = true
	}

	password, err := generatePassword(req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate password"})
		return
	}

	c.JSON(http.StatusOK, GenerateResponse{Password: password})
}

func generatePassword(req GenerateRequest) (string, error) {
	var charset string
	if req.IncludeUppercase {
		charset += "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
	}
	if req.IncludeLowercase {
		charset += "abcdefghijklmnopqrstuvwxyz"
	}
	if req.IncludeNumbers {
		charset += "0123456789"
	}
	if req.IncludeSymbols {
		charset += "!@#$%^&*()_+-=[]{}|;:,.<>?"
	}

	if len(charset) == 0 {
		return "", nil
	}

	password := make([]byte, req.Length)
	for i := 0; i < req.Length; i++ {
		randomIndex, err := rand.Int(rand.Reader, big.NewInt(int64(len(charset))))
		if err != nil {
			return "", err
		}
		password[i] = charset[randomIndex.Int64()]
	}

	return string(password), nil
}
