package postgres

import (
	"context"
	"errors"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/kitecloud/kite/kite-service/internal/db/postgres/pgmodel"
	"github.com/kitecloud/kite/kite-service/internal/model"
	"github.com/kitecloud/kite/kite-service/internal/store"
	"github.com/kitecloud/kite/kite-service/internal/util"
	"gopkg.in/guregu/null.v4"
)

func (c *Client) Entitlements(ctx context.Context, appID string) ([]*model.Entitlement, error) {
	rows, err := c.Q.GetEntitlements(ctx, appID)
	if err != nil {
		return nil, err
	}

	entitlements := make([]*model.Entitlement, 0, len(rows))
	for _, row := range rows {
		entitlements = append(entitlements, rowToEntitlement(row))
	}

	return entitlements, nil
}

func (c *Client) ActiveEntitlements(ctx context.Context, appID string, now time.Time) ([]*model.Entitlement, error) {
	rows, err := c.Q.GetActiveEntitlements(ctx, pgmodel.GetActiveEntitlementsParams{
		AppID:  appID,
		EndsAt: pgtype.Timestamp{Time: now, Valid: true},
	})
	if err != nil {
		return nil, err
	}

	entitlements := make([]*model.Entitlement, 0, len(rows))
	for _, row := range rows {
		entitlements = append(entitlements, rowToEntitlement(row))
	}

	return entitlements, nil
}

func (c *Client) UpsertSubscriptionEntitlement(ctx context.Context, entitlement model.Entitlement) (*model.Entitlement, error) {
	row, err := c.Q.UpsertSubscriptionEntitlement(ctx, pgmodel.UpsertSubscriptionEntitlementParams{
		ID:             entitlement.ID,
		Type:           entitlement.Type,
		SubscriptionID: pgtype.Text{String: entitlement.SubscriptionID.String, Valid: entitlement.SubscriptionID.Valid},
		AppID:          entitlement.AppID,
		PlanID:         entitlement.PlanID,
		CreatedAt:      pgtype.Timestamp{Time: entitlement.CreatedAt, Valid: true},
		UpdatedAt:      pgtype.Timestamp{Time: entitlement.UpdatedAt, Valid: true},
		EndsAt:         pgtype.Timestamp{Time: entitlement.EndsAt.Time, Valid: entitlement.EndsAt.Valid},
	})
	if err != nil {
		return nil, err
	}

	return rowToEntitlement(row), nil
}

func (c *Client) UpdateSubscriptionEntitlement(ctx context.Context, entitlement model.Entitlement) (*model.Entitlement, error) {
	row, err := c.Q.UpdateSubscriptionEntitlement(ctx, pgmodel.UpdateSubscriptionEntitlementParams{
		SubscriptionID: pgtype.Text{String: entitlement.SubscriptionID.String, Valid: entitlement.SubscriptionID.Valid},
		PlanID:         entitlement.PlanID,
		UpdatedAt:      pgtype.Timestamp{Time: entitlement.UpdatedAt, Valid: true},
		EndsAt:         pgtype.Timestamp{Time: entitlement.EndsAt.Time, Valid: entitlement.EndsAt.Valid},
	})
	if err != nil {
		return nil, err
	}

	return rowToEntitlement(row), nil
}

// RedeemCode claims a purchase code for an app and grants the matching plan.
// A code can only be redeemed once; a second attempt returns store.ErrAlreadyExists.
func (c *Client) RedeemCode(ctx context.Context, code string, planID string, appID string, now time.Time) (*model.Entitlement, error) {
	tx, err := c.DB.Begin(ctx)
	if err != nil {
		return nil, err
	}
	defer tx.Rollback(ctx)

	// ON CONFLICT DO NOTHING keeps the already-redeemed case out of the Postgres
	// error log: no row is returned when the code was claimed before.
	var inserted string
	if err := tx.QueryRow(ctx,
		`INSERT INTO redeemed_codes (code, plan_id, app_id, redeemed_at) VALUES ($1, $2, $3, $4)
		 ON CONFLICT (code) DO NOTHING
		 RETURNING code`,
		code, planID, appID, now,
	).Scan(&inserted); err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, store.ErrAlreadyExists
		}
		return nil, err
	}

	entitlement := &model.Entitlement{
		ID:        util.UniqueID(),
		Type:      "code",
		AppID:     appID,
		PlanID:    planID,
		CreatedAt: now,
		UpdatedAt: now,
	}

	if _, err := tx.Exec(ctx,
		`INSERT INTO entitlements (id, type, subscription_id, app_id, plan_id, created_at, updated_at, ends_at)
		 VALUES ($1, $2, NULL, $3, $4, $5, $6, NULL)`,
		entitlement.ID, entitlement.Type, appID, planID, now, now,
	); err != nil {
		return nil, err
	}

	if err := tx.Commit(ctx); err != nil {
		return nil, err
	}

	return entitlement, nil
}

func rowToEntitlement(row pgmodel.Entitlement) *model.Entitlement {
	return &model.Entitlement{
		ID:             row.ID,
		Type:           row.Type,
		SubscriptionID: null.NewString(row.SubscriptionID.String, row.SubscriptionID.Valid),
		AppID:          row.AppID,
		PlanID:         row.PlanID,
		CreatedAt:      row.CreatedAt.Time,
		UpdatedAt:      row.UpdatedAt.Time,
		EndsAt:         null.NewTime(row.EndsAt.Time, row.EndsAt.Valid),
	}
}
