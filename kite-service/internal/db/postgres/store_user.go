package postgres

import (
	"context"
	"errors"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/kitecloud/kite/kite-service/internal/db/postgres/pgmodel"
	"github.com/kitecloud/kite/kite-service/internal/model"
	"github.com/kitecloud/kite/kite-service/internal/store"
	"gopkg.in/guregu/null.v4"
)

func (c *Client) User(ctx context.Context, id string) (*model.User, error) {
	row, err := c.Q.GetUser(ctx, id)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, store.ErrNotFound
		}
		return nil, err
	}

	return rowToUser(row), nil
}

func (c *Client) UserByEmail(ctx context.Context, email string) (*model.User, error) {
	row, err := c.Q.GetUserByEmail(ctx, email)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, store.ErrNotFound
		}
		return nil, err
	}

	return rowToUser(row), nil
}

func (c *Client) UserByDiscordID(ctx context.Context, discordID string) (*model.User, error) {
	row, err := c.Q.GetUserByDiscordID(ctx, discordID)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, store.ErrNotFound
		}
		return nil, err
	}

	return rowToUser(row), nil
}

func (c *Client) UpsertUser(ctx context.Context, user *model.User) (*model.User, error) {
	row, err := c.Q.UpsertUser(ctx, pgmodel.UpsertUserParams{
		ID:              user.ID,
		Email:           user.Email,
		DisplayName:     user.DisplayName,
		DiscordID:       user.DiscordID,
		DiscordUsername: user.DiscordUsername,
		DiscordAvatar: pgtype.Text{
			String: user.DiscordAvatar.String,
			Valid:  user.DiscordAvatar.Valid,
		},
		CreatedAt: pgtype.Timestamp{
			Time:  user.CreatedAt.UTC(),
			Valid: true,
		},
		UpdatedAt: pgtype.Timestamp{
			Time:  user.UpdatedAt.UTC(),
			Valid: true,
		},
	})
	if err != nil {
		return nil, err
	}

	return rowToUser(row), nil
}

func (c *Client) UserCredentials(ctx context.Context, email string) (*model.User, string, error) {
	var user model.User
	var avatar pgtype.Text
	var createdAt, updatedAt pgtype.Timestamp
	var passwordHash string

	err := c.DB.QueryRow(ctx,
		`SELECT id, email, display_name, discord_id, discord_username, discord_avatar,
		        created_at, updated_at, COALESCE(password_hash, '')
		 FROM users
		 WHERE lower(email) = lower($1)`,
		email,
	).Scan(
		&user.ID,
		&user.Email,
		&user.DisplayName,
		&user.DiscordID,
		&user.DiscordUsername,
		&avatar,
		&createdAt,
		&updatedAt,
		&passwordHash,
	)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, "", store.ErrNotFound
		}
		return nil, "", err
	}

	user.DiscordAvatar = null.NewString(avatar.String, avatar.Valid)
	user.CreatedAt = createdAt.Time
	user.UpdatedAt = updatedAt.Time

	return &user, passwordHash, nil
}

func (c *Client) CreateEmailUser(ctx context.Context, user *model.User, passwordHash string) (*model.User, error) {
	var created model.User
	var avatar pgtype.Text
	var createdAt, updatedAt pgtype.Timestamp

	err := c.DB.QueryRow(ctx,
		`INSERT INTO users (
			id, email, display_name, discord_id, discord_username, discord_avatar,
			password_hash, created_at, updated_at
		) VALUES ($1, $2, $3, $4, $5, NULL, $6, $7, $8)
		RETURNING id, email, display_name, discord_id, discord_username, discord_avatar,
		          created_at, updated_at`,
		user.ID,
		user.Email,
		user.DisplayName,
		user.DiscordID,
		user.DiscordUsername,
		passwordHash,
		user.CreatedAt,
		user.UpdatedAt,
	).Scan(
		&created.ID,
		&created.Email,
		&created.DisplayName,
		&created.DiscordID,
		&created.DiscordUsername,
		&avatar,
		&createdAt,
		&updatedAt,
	)
	if err != nil {
		return nil, err
	}

	created.DiscordAvatar = null.NewString(avatar.String, avatar.Valid)
	created.CreatedAt = createdAt.Time
	created.UpdatedAt = updatedAt.Time

	return &created, nil
}

func rowToUser(row pgmodel.User) *model.User {
	return &model.User{
		ID:              row.ID,
		Email:           row.Email,
		DisplayName:     row.DisplayName,
		DiscordID:       row.DiscordID,
		DiscordUsername: row.DiscordUsername,
		DiscordAvatar:   null.NewString(row.DiscordAvatar.String, row.DiscordAvatar.Valid),
		CreatedAt:       row.CreatedAt.Time,
		UpdatedAt:       row.UpdatedAt.Time,
	}
}
