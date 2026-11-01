package model

type Plan struct {
	ID          string
	Title       string
	Description string
	Price       float32
	Default     bool
	Popular     bool
	Hidden      bool

	LemonSqueezyProductID string
	LemonSqueezyVariantID string

	DiscordRoleID string

	FeatureMaxCollaborators     int
	FeatureUsageCreditsPerMonth int
	FeatureMaxGuilds            int
	FeaturePrioritySupport      bool

	FeatureMaxCommandsPerApp       int
	FeatureMaxMessagesPerApp       int
	FeatureMaxEventListenersPerApp int
	FeatureCustomStatus            bool
}

func (p Plan) Features() Features {
	return Features{
		MaxCollaborators:        p.FeatureMaxCollaborators,
		UsageCreditsPerMonth:    p.FeatureUsageCreditsPerMonth,
		MaxGuilds:               p.FeatureMaxGuilds,
		PrioritySupport:         p.FeaturePrioritySupport,
		MaxCommandsPerApp:       p.FeatureMaxCommandsPerApp,
		MaxMessagesPerApp:       p.FeatureMaxMessagesPerApp,
		MaxEventListenersPerApp: p.FeatureMaxEventListenersPerApp,
		CustomStatus:            p.FeatureCustomStatus,
	}
}

type Features struct {
	MaxCollaborators     int
	UsageCreditsPerMonth int
	MaxGuilds            int
	PrioritySupport      bool

	MaxCommandsPerApp       int
	MaxMessagesPerApp       int
	MaxEventListenersPerApp int
	CustomStatus            bool
}

func (f Features) Merge(other Features) Features {
	return Features{
		MaxCollaborators:        max(f.MaxCollaborators, other.MaxCollaborators),
		UsageCreditsPerMonth:    max(f.UsageCreditsPerMonth, other.UsageCreditsPerMonth),
		MaxGuilds:               max(f.MaxGuilds, other.MaxGuilds),
		PrioritySupport:         f.PrioritySupport || other.PrioritySupport,
		MaxCommandsPerApp:       max(f.MaxCommandsPerApp, other.MaxCommandsPerApp),
		MaxMessagesPerApp:       max(f.MaxMessagesPerApp, other.MaxMessagesPerApp),
		MaxEventListenersPerApp: max(f.MaxEventListenersPerApp, other.MaxEventListenersPerApp),
		CustomStatus:            f.CustomStatus || other.CustomStatus,
	}
}

func max(a, b int) int {
	if a > b {
		return a
	}
	return b
}
