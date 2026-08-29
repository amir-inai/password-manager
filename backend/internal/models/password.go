package models

import (
	"time"
)

type VaultEntry struct {
	ID              uint      `gorm:"primaryKey" json:"id"`
	Title           string    `gorm:"not null" json:"title"`
	Username        string    `gorm:"not null" json:"username"`
	EncryptedPassword []byte   `gorm:"not null" json:"-"`
	EncryptedURL    []byte    `json:"-"`
	EncryptedNotes  []byte    `json:"-"`
	Category        string    `json:"category"`
	CreatedAt       time.Time `json:"created_at"`
	UpdatedAt       time.Time `json:"updated_at"`
}

func (VaultEntry) TableName() string {
	return "vault_entries"
}

type VaultMeta struct {
	Key   string `gorm:"primaryKey" json:"key"`
	Value string `json:"value"`
}

func (VaultMeta) TableName() string {
	return "vault_meta"
}
