-- Entitlements belong to the app's owner: a plan unlocked on one bot applies to
-- every bot that user owns. Both queries therefore resolve the plan set of the
-- app's owner instead of only rows whose app_id matches.
-- name: GetEntitlements :many
SELECT e.id, e.type, e.subscription_id, e.app_id, e.plan_id, e.created_at, e.updated_at, e.ends_at
FROM entitlements e
JOIN apps a ON a.id = e.app_id
WHERE a.owner_user_id = (SELECT owner_user_id FROM apps WHERE id = $1)
ORDER BY e.created_at DESC;

-- name: GetActiveEntitlements :many
SELECT e.id, e.type, e.subscription_id, e.app_id, e.plan_id, e.created_at, e.updated_at, e.ends_at
FROM entitlements e
JOIN apps a ON a.id = e.app_id
WHERE a.owner_user_id = (SELECT owner_user_id FROM apps WHERE id = $1)
  AND (e.ends_at IS NULL OR e.ends_at > $2)
ORDER BY e.created_at DESC;

-- name: UpsertSubscriptionEntitlement :one
INSERT INTO entitlements (
    id,
    type,
    subscription_id,
    app_id,
    plan_id,
    created_at,
    updated_at,
    ends_at
)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
ON CONFLICT (subscription_id, app_id) DO UPDATE SET 
    plan_id = EXCLUDED.plan_id,
    updated_at = EXCLUDED.updated_at,
    ends_at = EXCLUDED.ends_at
RETURNING *;

-- name: UpdateSubscriptionEntitlement :one
UPDATE entitlements SET
    plan_id = $2,
    updated_at = $3,
    ends_at = $4
WHERE subscription_id = $1 RETURNING *;
