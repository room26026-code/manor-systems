package auth

import (
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/kitecloud/kite/kite-service/internal/api/handler"
	"github.com/kitecloud/kite/kite-service/internal/api/wire"
	"github.com/kitecloud/kite/kite-service/internal/model"
	"github.com/kitecloud/kite/kite-service/internal/store"
	"github.com/kitecloud/kite/kite-service/internal/util"
	"golang.org/x/crypto/bcrypt"
)

var errInvalidCredentials = handler.ErrUnauthorized("invalid_credentials", "Incorrect email or password.")

func (h *AuthHandler) HandleEmailLogin(c *handler.Context, req wire.AuthEmailLoginRequest) (*wire.AuthLoginResponse, error) {
	user, passwordHash, err := h.userStore.UserCredentials(c.Context(), normalizeEmail(req.Email))
	if err != nil {
		if errors.Is(err, store.ErrNotFound) {
			return nil, errInvalidCredentials
		}
		return nil, fmt.Errorf("failed to get user: %w", err)
	}

	if passwordHash == "" || bcrypt.CompareHashAndPassword([]byte(passwordHash), []byte(req.Password)) != nil {
		return nil, errInvalidCredentials
	}

	if _, _, err := h.sessionManager.CreateSessionCookie(c, user.ID); err != nil {
		return nil, fmt.Errorf("failed to create session: %w", err)
	}

	return wire.UserToWire(user, true), nil
}

func (h *AuthHandler) HandleEmailRegister(c *handler.Context, req wire.AuthEmailRegisterRequest) (*wire.AuthRegisterResponse, error) {
	email := normalizeEmail(req.Email)

	_, _, err := h.userStore.UserCredentials(c.Context(), email)
	if err == nil {
		return nil, handler.ErrBadRequest("email_in_use", "An account with this email already exists.")
	}
	if !errors.Is(err, store.ErrNotFound) {
		return nil, fmt.Errorf("failed to check existing user: %w", err)
	}

	passwordHash, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, fmt.Errorf("failed to hash password: %w", err)
	}

	now := time.Now().UTC()
	userID := util.UniqueID()
	displayName := email
	if i := strings.Index(email, "@"); i > 0 {
		displayName = email[:i]
	}

	user, err := h.userStore.CreateEmailUser(c.Context(), &model.User{
		ID:            userID,
		Email:         email,
		DisplayName:   displayName,
		DiscordID:     "email:" + userID,
		CreatedAt:     now,
		UpdatedAt:     now,
	}, string(passwordHash))
	if err != nil {
		return nil, fmt.Errorf("failed to create user: %w", err)
	}

	if _, _, err := h.sessionManager.CreateSessionCookie(c, user.ID); err != nil {
		return nil, fmt.Errorf("failed to create session: %w", err)
	}

	return wire.UserToWire(user, true), nil
}

func normalizeEmail(email string) string {
	return strings.ToLower(strings.TrimSpace(email))
}
