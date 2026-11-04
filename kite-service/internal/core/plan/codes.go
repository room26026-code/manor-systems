package plan

import "strings"

const (
	PlanIDPremium  = "premium"
	PlanIDInvestor = "investor"
)

// premiumCodes unlock the Premium plan: the normal MaNor Hosing limits.
var premiumCodes = []string{
	"PRM7K2X9", "A8M4Q2Z6", "K7P3N9W2", "X5R8T1B4", "M2V9C6L3",
	"Q4H7Y2D8", "B9K3F5W1", "T6N2X8P4", "L3Z7M1Q9", "C8R4V2K6",
	"Y5P9D3H7", "N1W6B8T2", "F4X7L9M3", "D2Q8K5R1", "V9T3C6Y4",
	"H7M2P8Z5", "W3B9N4X6", "R5L1D7Q8", "Z6C4T2V9", "P8Y3H7K1",
	"G2N9W5M4", "X7D1R6B8", "K4V8Q3L2", "M9F5Z2T7", "B6H3P1Y8",
	"T2K7X4N9", "Q8M1C5V3", "L5R9W2D6", "Y3Z8B4H1", "N7P2F6K5",
	"D4X9T3M8", "V1Q6L7R2", "H8C5Y9B3", "W2M7K4Z6", "R9N3P8D1",
	"Z4T6V2X7", "P3B8H1Q5", "G7L2C9M4", "X1Y5R8K3", "K9D4W6T2",
	"M5Q7Z3V8", "B2N6H9P4", "T8R1X5L7", "Q3V9C2D6", "L7K4M8Y1",
	"Y9H2B5N3", "N4F8P1Z6", "D6W3T9R2", "V5X7Q4C8", "H1M9L2B6",
}

// investorCodes unlock the Investor plan: higher resource limits and a custom bot status.
var investorCodes = []string{
	"INV8K3X7", "A4Q9M2Z5", "K6T1P8W3", "X9B4R2N7", "M3V5C8L1",
	"Q7H2Y9D4", "B5K8F1W6", "T4N9X3P2", "L8Z1M6Q5", "C2R7V4K9",
	"Y6P3D8H1", "N9W4B2T7", "F1X6L3M8", "D7Q5K2R9", "V4T8C1Y6",
	"H3M7P9Z2", "W6B1N5X8", "R2L9D4Q7", "Z8C3T5V1", "P6Y4H2K9",
	"G9N1W7M3", "X4D8R2B5", "K1V6Q9L3", "M7F2Z8T4", "B3H9P5Y1",
	"T5K2X7N8", "Q1M6C4V9", "L9R3W5D2", "Y2Z7B8H4", "N6P1F9K3",
	"D8X4T2M7", "V3Q5L1R9", "H9C2Y6B4", "W5M8K3Z1", "R7N4P2D6",
	"Z1T9V5X3", "P4B6H8Q2", "G3L7C1M9", "X8Y2R5K4", "K5D9W1T6",
	"M1Q4Z7V3", "B8N2H6P9", "T3R5X1L8", "Q9V2C7D4", "L2K6M1Y8",
	"Y4H7B3N9", "N5F2P8Z1", "D1W9T6R4", "V8X3Q5C2", "H6M4L9B1",
}

var codePlans = func() map[string]string {
	plans := make(map[string]string, len(premiumCodes)+len(investorCodes))
	for _, code := range premiumCodes {
		plans[code] = PlanIDPremium
	}
	for _, code := range investorCodes {
		plans[code] = PlanIDInvestor
	}
	return plans
}()

// NormalizeCode trims and uppercases a purchase code so users can paste it in any case.
func NormalizeCode(code string) string {
	return strings.ToUpper(strings.TrimSpace(code))
}

// PlanIDForCode returns the plan a purchase code unlocks.
func PlanIDForCode(code string) (string, bool) {
	planID, ok := codePlans[NormalizeCode(code)]
	return planID, ok
}
