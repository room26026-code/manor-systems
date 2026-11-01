package message

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
)

type MessageHandler struct {
	messageStore         store.MessageStore
	messageInstanceStore store.MessageInstanceStore
	assetStore           store.AssetStore
	appStateManager      store.AppStateManager
	planManager          *plan.PlanManager
	maxMessagesFallback  int
}

func NewMessageHandler(
	messageStore store.MessageStore,
	messageInstanceStore store.MessageInstanceStore,
	assetStore store.AssetStore,
	appStateManager store.AppStateManager,
	planManager *plan.PlanManager,
	maxMessagesPerApp int,
) *MessageHandler {
	return &MessageHandler{
		messageStore:         messageStore,
		messageInstanceStore: messageInstanceStore,
		assetStore:           assetStore,
		appStateManager:      appStateManager,
		planManager:          planManager,
		maxMessagesFallback:  maxMessagesPerApp,
	}
}

// maxMessagesPerApp is the limit of the app's active plan, falling back to the global limit.
func (h *MessageHandler) maxMessagesPerApp(c *handler.Context) int {
	if features := h.planManager.AppFeatures(c.Context(), c.App.ID); features.MaxMessagesPerApp > 0 {
		return features.MaxMessagesPerApp
	}
	return h.maxMessagesFallback
}

func (h *MessageHandler) HandleMessageList(c *handler.Context) (*wire.MessageListResponse, error) {
	messages, err := h.messageStore.MessagesByApp(c.Context(), c.App.ID)
	if err != nil {
		return nil, fmt.Errorf("failed to get messages: %w", err)
	}

	res := make([]*wire.Message, len(messages))
	for i, message := range messages {
		res[i] = wire.MessageToWire(message)
	}

	return &res, nil
}

func (h *MessageHandler) HandleMessageGet(c *handler.Context) (*wire.MessageGetResponse, error) {
	return wire.MessageToWire(c.Message), nil
}

func (h *MessageHandler) HandleMessageCreate(c *handler.Context, req wire.MessageCreateRequest) (*wire.MessageCreateResponse, error) {
	if maxMessages := h.maxMessagesPerApp(c); maxMessages != 0 {
		messageCount, err := h.messageStore.CountMessagesByApp(c.Context(), c.App.ID)
		if err != nil {
			return nil, fmt.Errorf("failed to count messages: %w", err)
		}

		if messageCount >= maxMessages {
			return nil, handler.ErrBadRequest("resource_limit", fmt.Sprintf("maximum number of messages (%d) reached", maxMessages))
		}
	}

	message, err := h.messageStore.CreateMessage(c.Context(), &model.Message{
		ID:            util.UniqueID(),
		Name:          req.Name,
		Description:   req.Description,
		AppID:         c.App.ID,
		CreatorUserID: c.Session.UserID,
		Data:          req.Data,
		FlowSources:   req.FlowSources,
		CreatedAt:     time.Now().UTC(),
		UpdatedAt:     time.Now().UTC(),
	})
	if err != nil {
		return nil, fmt.Errorf("failed to create message: %w", err)
	}

	return wire.MessageToWire(message), nil
}

func (h *MessageHandler) HandleMessagesImport(c *handler.Context, req wire.MessagesImportRequest) (*wire.MessagesImportResponse, error) {
	if maxMessages := h.maxMessagesPerApp(c); maxMessages != 0 {
		messageCount, err := h.messageStore.CountMessagesByApp(c.Context(), c.App.ID)
		if err != nil {
			return nil, fmt.Errorf("failed to count messages: %w", err)
		}

		newMessageCount := messageCount + len(req.Messages)

		if newMessageCount > maxMessages {
			return nil, handler.ErrBadRequest("resource_limit", fmt.Sprintf("maximum number of messages (%d) reached", maxMessages))
		}
	}

	res := make([]*wire.Message, len(req.Messages))

	for i, msg := range req.Messages {
		message, err := h.messageStore.CreateMessage(c.Context(), &model.Message{
			ID:            util.UniqueID(),
			Name:          msg.Name,
			Description:   msg.Description,
			AppID:         c.App.ID,
			CreatorUserID: c.Session.UserID,
			Data:          msg.Data,
			FlowSources:   msg.FlowSources,
			CreatedAt:     time.Now().UTC(),
			UpdatedAt:     time.Now().UTC(),
		})
		if err != nil {
			return nil, fmt.Errorf("failed to create message: %w", err)
		}

		res[i] = wire.MessageToWire(message)
	}

	return &res, nil
}

func (h *MessageHandler) HandleMessageUpdate(c *handler.Context, req wire.MessageUpdateRequest) (*wire.MessageUpdateResponse, error) {
	message, err := h.messageStore.UpdateMessage(c.Context(), &model.Message{
		ID:          c.Message.ID,
		Name:        req.Name,
		Description: req.Description,
		AppID:       c.App.ID,
		Data:        req.Data,
		FlowSources: req.FlowSources,
		UpdatedAt:   time.Now().UTC(),
	})
	if err != nil {
		if errors.Is(err, store.ErrNotFound) {
			return nil, handler.ErrNotFound("unknown_message", "Message not found")
		}
		return nil, fmt.Errorf("failed to update message: %w", err)
	}

	return wire.MessageToWire(message), nil
}

func (h *MessageHandler) HandleMessageDelete(c *handler.Context) (*wire.MessageDeleteResponse, error) {
	err := h.messageStore.DeleteMessage(c.Context(), c.Message.ID)
	if err != nil {
		if errors.Is(err, store.ErrNotFound) {
			return nil, handler.ErrNotFound("unknown_message", "Message not found")
		}
		return nil, fmt.Errorf("failed to delete message: %w", err)
	}

	return &wire.MessageDeleteResponse{}, nil
}
