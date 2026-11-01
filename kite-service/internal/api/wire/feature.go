package wire

type Features struct {
	MaxCollaborators     int  `json:"max_collaborators"`
	UsageCreditsPerMonth int  `json:"usage_credits_per_month"`
	MaxGuilds            int  `json:"max_guilds"`
	PrioritySupport      bool `json:"priority_support"`

	MaxCommandsPerApp       int  `json:"max_commands_per_app"`
	MaxMessagesPerApp       int  `json:"max_messages_per_app"`
	MaxEventListenersPerApp int  `json:"max_event_listeners_per_app"`
	CustomStatus            bool `json:"custom_status"`
}

type FeaturesGetResponse = Features
