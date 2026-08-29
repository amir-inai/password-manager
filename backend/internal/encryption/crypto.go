package encryption

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"crypto/subtle"
	"encoding/hex"
	"fmt"
	"io"
	"sync"

	"golang.org/x/crypto/argon2"
)

type Service struct {
	mu     sync.RWMutex
	key    []byte
	unlocked bool
}

type Params struct {
	Memory      uint32
	Iterations  uint32
	Parallelism uint8
	SaltLength  uint32
	KeyLength   uint32
}

var DefaultParams = &Params{
	Memory:      64 * 1024, // 64 MB
	Iterations:  3,
	Parallelism: 2,
	SaltLength:  16,
	KeyLength:   32, // AES-256
}

func NewService() *Service {
	return &Service{}
}

func (s *Service) DeriveKey(password string, salt []byte) []byte {
	return argon2.Key([]byte(password), salt, DefaultParams.Iterations, DefaultParams.Memory, DefaultParams.Parallelism, DefaultParams.KeyLength)
}

func (s *Service) Encrypt(plaintext []byte) ([]byte, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	if !s.unlocked {
		return nil, fmt.Errorf("vault is locked")
	}

	block, err := aes.NewCipher(s.key)
	if err != nil {
		return nil, fmt.Errorf("failed to create cipher: %w", err)
	}

	aesGCM, err := cipher.NewGCM(block)
	if err != nil {
		return nil, fmt.Errorf("failed to create GCM: %w", err)
	}

	nonce := make([]byte, aesGCM.NonceSize())
	if _, err := io.ReadFull(rand.Reader, nonce); err != nil {
		return nil, fmt.Errorf("failed to generate nonce: %w", err)
	}

	ciphertext := aesGCM.Seal(nonce, nonce, plaintext, nil)
	return ciphertext, nil
}

func (s *Service) Decrypt(ciphertext []byte) ([]byte, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	if !s.unlocked {
		return nil, fmt.Errorf("vault is locked")
	}

	block, err := aes.NewCipher(s.key)
	if err != nil {
		return nil, fmt.Errorf("failed to create cipher: %w", err)
	}

	aesGCM, err := cipher.NewGCM(block)
	if err != nil {
		return nil, fmt.Errorf("failed to create GCM: %w", err)
	}

	nonceSize := aesGCM.NonceSize()
	if len(ciphertext) < nonceSize {
		return nil, fmt.Errorf("ciphertext too short")
	}

	nonce, ciphertext := ciphertext[:nonceSize], ciphertext[nonceSize:]
	plaintext, err := aesGCM.Open(nil, nonce, ciphertext, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to decrypt: %w", err)
	}

	return plaintext, nil
}

func (s *Service) Unlock(password string, salt []byte, verificationHash string) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	// Derive key from password
	key := s.DeriveKey(password, salt)

	// Verify against stored hash
	computedHash := s.computeHash(key)
	if subtle.ConstantTimeCompare([]byte(computedHash), []byte(verificationHash)) != 1 {
		return fmt.Errorf("invalid master password")
	}

	s.key = key
	s.unlocked = true
	return nil
}

func (s *Service) Lock() {
	s.mu.Lock()
	defer s.mu.Unlock()

	s.key = nil
	s.unlocked = false
}

func (s *Service) IsUnlocked() bool {
	s.mu.RLock()
	defer s.mu.RUnlock()
	return s.unlocked
}

func (s *Service) GenerateVerificationHash(key []byte) string {
	return s.computeHash(key)
}

func (s *Service) computeHash(key []byte) string {
	hash := argon2.Key(key, []byte("verification"), 1, DefaultParams.Memory, DefaultParams.Parallelism, 32)
	return hex.EncodeToString(hash)
}

func (s *Service) GenerateSalt() []byte {
	salt := make([]byte, DefaultParams.SaltLength)
	if _, err := rand.Read(salt); err != nil {
		panic(fmt.Sprintf("failed to generate salt: %v", err))
	}
	return salt
}
