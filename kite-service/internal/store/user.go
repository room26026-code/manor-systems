package store

import (
	"context"

	"github.com/kitecloud/kite/kite-service/internal/model"
)

type UserStore interface {
	User(ctx context.Context, id string) (*model.User, error)
	UserByEmail(ctx context.Context, email string) (*model.User, error)
	UserByDiscordID(ctx context.Context, discordID string) (*model.User, error)
	UpsertUser(ctx context.Context, user *model.User) (*model.User, error)

	// UserCredentials returns the user with the given email (case insensitive)
	// together with the bcrypt hash of their password.
	UserCredentials(ctx context.Context, email string) (*model.User, string, error)
	// CreateEmailUser creates a user that signs in with email and password.
	CreateEmailUser(ctx context.Context, user *model.User, passwordHash string) (*model.User, error)
}
