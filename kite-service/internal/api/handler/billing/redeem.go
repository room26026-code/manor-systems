package billing

import (
	"errors"
	"fmt"
	"time"

	"github.com/kitecloud/kite/kite-service/internal/api/handler"
	"github.com/kitecloud/kite/kite-service/internal/api/wire"
	"github.com/kitecloud/kite/kite-service/internal/core/plan"
	"github.com/kitecloud/kite/kite-service/internal/store"
)

// HandleAppRedeemCode unlocks a Premium or Investor plan for the app with a purchase code.
func (h *BillingHandler) HandleAppRedeemCode(c *handler.Context, req wire.RedeemCodeRequest) (*wire.RedeemCodeResponse, error) {
	code := plan.NormalizeCode(req.Code)
	if code == "" {
		return nil, handler.ErrBadRequest("invalid_code", "Enter a purchase code.")
	}

	planID, ok := plan.PlanIDForCode(code)
	if !ok {
		return nil, handler.ErrBadRequest("invalid_code", "That purchase code is not valid.")
	}

	if _, err := h.entitlementStore.RedeemCode(c.Context(), code, planID, c.App.ID, time.Now().UTC()); err != nil {
		if errors.Is(err, store.ErrAlreadyExists) {
			return nil, handler.ErrBadRequest("code_already_used", "That purchase code has already been redeemed.")
		}
		return nil, fmt.Errorf("failed to redeem purchase code: %w", err)
	}

	res := &wire.RedeemCodeResponse{
		PlanID:    planID,
		PlanTitle: planID,
	}

	if p := h.planManager.PlanByID(planID); p != nil {
		res.PlanTitle = p.Title
	}

	return res, nil
}

func (h *BillingHandler) HandleAppEntitlementList(c *handler.Context) (*wire.EntitlementListResponse, error) {
	entitlements, err := h.entitlementStore.Entitlements(c.Context(), c.App.ID)
	if err != nil {
		return nil, fmt.Errorf("failed to get entitlements: %w", err)
	}

	res := make([]*wire.Entitlement, len(entitlements))
	for i, entitlement := range entitlements {
		res[i] = &wire.Entitlement{
			Type:      entitlement.Type,
			PlanID:    entitlement.PlanID,
			CreatedAt: entitlement.CreatedAt,
			EndsAt:    entitlement.EndsAt,
		}
	}

	return &res, nil
}
