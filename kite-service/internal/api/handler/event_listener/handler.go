package eventlistener

import (
	"errors"
	"fmt"
	"time"

	"github.com/kitecloud/kite/kite-service/internal/api/handler"
	"github.com/kitecloud/kite/kite-service/internal/api/wire"
	"github.com/kitecloud/kite/kite-service/internal/core/plan"
	"github.com/kitecloud/kite/kite-service/internal/model"
	"github.com/kitecloud/kite/kite-service/internal/store"
	"github.com/kitecloud/kite/kite-service/internal/util"
	"github.com/kitecloud/kite/kite-service/pkg/flow"
)

type EventListenerHandler struct {
	eventListenerStore store.EventListenerStore
	planManager        *plan.PlanManager
}

func NewEventListenerHandler(eventListenerStore store.EventListenerStore, planManager *plan.PlanManager) *EventListenerHandler {
	return &EventListenerHandler{
		eventListenerStore: eventListenerStore,
		planManager:        planManager,
	}
}

// maxEventListenersPerApp is the limit of the app's active plan. 0 means the plan
// does not include event listeners at all (Basic plan).
func (h *EventListenerHandler) maxEventListenersPerApp(c *handler.Context) int {
	return h.planManager.AppFeatures(c.Context(), c.App.ID).MaxEventListenersPerApp
}

var errEventListenersLocked = handler.ErrBadRequest("feature_locked", "Event listeners are not included in this app's plan. Redeem a Premium purchase code to unlock them.")

func (h *EventListenerHandler) HandleEventListenerList(c *handler.Context) (*wire.EventListenerListResponse, error) {
	eventListeners, err := h.eventListenerStore.EventListenersByApp(c.Context(), c.App.ID)
	if err != nil {
		return nil, fmt.Errorf("failed to get event listeners: %w", err)
	}

	res := make([]*wire.EventListener, len(eventListeners))
	for i, eventListener := range eventListeners {
		res[i] = wire.EventListenerToWire(eventListener)
	}

	return &res, nil
}

func (h *EventListenerHandler) HandleEventListenerGet(c *handler.Context) (*wire.EventListenerGetResponse, error) {
	return wire.EventListenerToWire(c.EventListener), nil
}

func (h *EventListenerHandler) HandleEventListenerCreate(c *handler.Context, req wire.EventListenerCreateRequest) (*wire.EventListenerCreateResponse, error) {
	if maxEventListeners := h.maxEventListenersPerApp(c); maxEventListeners == 0 {
		return nil, errEventListenersLocked
	} else {
		eventListenerCount, err := h.eventListenerStore.CountEventListenersByApp(c.Context(), c.App.ID)
		if err != nil {
			return nil, fmt.Errorf("failed to count event listeners: %w", err)
		}

		if eventListenerCount >= maxEventListeners {
			return nil, handler.ErrBadRequest("resource_limit", fmt.Sprintf("maximum number of event listeners (%d) reached", maxEventListeners))
		}
	}

	eventFlow, err := flow.CompileEventListener(req.FlowSource)
	if err != nil {
		return nil, fmt.Errorf("failed to compile event listener: %w", err)
	}

	eventListener, err := h.eventListenerStore.CreateEventListener(c.Context(), &model.EventListener{
		ID:            util.UniqueID(),
		AppID:         c.App.ID,
		CreatorUserID: c.Session.UserID,
		Source:        model.EventSource(req.Source),
		Type:          model.EventListenerType(eventFlow.EventListenerType()),
		Description:   eventFlow.EventDescription(),
		// TODO: Filter:        eventFlow.EventListenerFilter(),
		FlowSource: req.FlowSource,
		Enabled:    req.Enabled,
		CreatedAt:  time.Now().UTC(),
		UpdatedAt:  time.Now().UTC(),
	})
	if err != nil {
		return nil, fmt.Errorf("failed to create event listener: %w", err)
	}

	return wire.EventListenerToWire(eventListener), nil
}

func (h *EventListenerHandler) HandleEventListenersImport(c *handler.Context, req wire.EventListenersImportRequest) (*wire.EventListenersImportResponse, error) {
	if maxEventListeners := h.maxEventListenersPerApp(c); maxEventListeners == 0 {
		return nil, errEventListenersLocked
	} else {
		eventListenerCount, err := h.eventListenerStore.CountEventListenersByApp(c.Context(), c.App.ID)
		if err != nil {
			return nil, fmt.Errorf("failed to count event listeners: %w", err)
		}

		newEventListenerCount := eventListenerCount + len(req.EventListeners)

		if newEventListenerCount > maxEventListeners {
			return nil, handler.ErrBadRequest("resource_limit", fmt.Sprintf("maximum number of event listeners (%d) reached", maxEventListeners))
		}
	}

	res := make([]*wire.EventListener, len(req.EventListeners))

	for i, listener := range req.EventListeners {
		eventFlow, err := flow.CompileEventListener(listener.FlowSource)
		if err != nil {
			return nil, fmt.Errorf("failed to compile event listener: %w", err)
		}

		eventListener, err := h.eventListenerStore.CreateEventListener(c.Context(), &model.EventListener{
			ID:            util.UniqueID(),
			AppID:         c.App.ID,
			CreatorUserID: c.Session.UserID,
			Source:        model.EventSource(listener.Source),
			Type:          model.EventListenerType(eventFlow.EventListenerType()),
			Description:   eventFlow.EventDescription(),
			// TODO: Filter:        eventFlow.EventListenerFilter(),
			FlowSource: listener.FlowSource,
			Enabled:    listener.Enabled,
			CreatedAt:  time.Now().UTC(),
			UpdatedAt:  time.Now().UTC(),
		})
		if err != nil {
			return nil, fmt.Errorf("failed to create event listener: %w", err)
		}

		res[i] = wire.EventListenerToWire(eventListener)
	}

	return &res, nil
}

func (h *EventListenerHandler) HandleEventListenerUpdate(c *handler.Context, req wire.EventListenerUpdateRequest) (*wire.EventListenerUpdateResponse, error) {
	eventFlow, err := flow.CompileEventListener(req.FlowSource)
	if err != nil {
		return nil, fmt.Errorf("failed to compile event listener: %w", err)
	}

	eventListener, err := h.eventListenerStore.UpdateEventListener(c.Context(), &model.EventListener{
		ID:          c.EventListener.ID,
		Type:        model.EventListenerType(eventFlow.EventListenerType()),
		Description: eventFlow.EventDescription(),
		// TODO: Filter:      eventFlow.EventListenerFilter(),
		FlowSource: req.FlowSource,
		Enabled:    req.Enabled,
		UpdatedAt:  time.Now().UTC(),
	})
	if err != nil {
		if errors.Is(err, store.ErrNotFound) {
			return nil, handler.ErrNotFound("unknown_event_listener", "Event listener not found")
		}
		return nil, fmt.Errorf("failed to update event listener: %w", err)
	}

	return wire.EventListenerToWire(eventListener), nil
}

func (h *EventListenerHandler) HandleEventListenerUpdateEnabled(c *handler.Context, req wire.EventListenerUpdateEnabledRequest) (*wire.EventListenerUpdateEnabledResponse, error) {
	eventListener, err := h.eventListenerStore.UpdateEventListener(c.Context(), &model.EventListener{
		ID:          c.EventListener.ID,
		Type:        c.EventListener.Type,
		Description: c.EventListener.Description,
		FlowSource:  c.EventListener.FlowSource,
		Enabled:     req.Enabled,
		UpdatedAt:   time.Now().UTC(),
	})
	if err != nil {
		if errors.Is(err, store.ErrNotFound) {
			return nil, handler.ErrNotFound("unknown_event_listener", "Event listener not found")
		}
		return nil, fmt.Errorf("failed to update event listener: %w", err)
	}

	return wire.EventListenerToWire(eventListener), nil
}

func (h *EventListenerHandler) HandleEventListenerDelete(c *handler.Context) (*wire.EventListenerDeleteResponse, error) {
	err := h.eventListenerStore.DeleteEventListener(c.Context(), c.EventListener.ID)
	if err != nil {
		if errors.Is(err, store.ErrNotFound) {
			return nil, handler.ErrNotFound("unknown_event_listener", "Event listener not found")
		}
		return nil, fmt.Errorf("failed to delete event listener: %w", err)
	}

	return &wire.EventListenerDeleteResponse{}, nil
}
