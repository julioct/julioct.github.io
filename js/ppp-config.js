/**
 * Purchase Parity Pricing (PPP) Configuration
 *
 * This file contains all configuration for regional pricing.
 * Toggle PPP on/off and manage coupon codes in one place.
 */

window.PPPConfig = {
    // ============================================================
    // MASTER TOGGLE - Set to false to disable PPP entirely
    // ============================================================
    enabled: true,

    // ============================================================
    // DISCOUNT TIERS
    // Each tier has a discount percentage and a Thinkific coupon code.
    // Replace the placeholder coupon codes with your actual Thinkific codes.
    // ============================================================
tiers: {
        tier1: {
            discount: 40,
            couponCode: "PPP-VKX7M2"
        },
        tier2: {
            discount: 30,
            couponCode: "PPP-QN4F8R"
        },
        // TODO: Remove this test tier after verifying PPP works in production
        tierTest: {
            discount: 5,   // 5% OFF - minimal for testing
            couponCode: "PPP-TEST"
        }
    },

    // ============================================================
    // COUNTRY MAPPING (Strictly based on your >25 Visitors Data)
    // ============================================================
    countryTiers: {
        // === TIER 1: HEAVY DISCOUNT (40%) ===
        // High Volume / Low Currency Strength
        "IN": "tier1", // India (366 visitors)
        "EG": "tier1", // Egypt (35 visitors)
        "BD": "tier1", // Bangladesh (34 visitors)
        "NG": "tier1", // Nigeria (33 visitors)
        "PK": "tier1", // Pakistan (26 visitors)

        // === TIER 2: MID DISCOUNT (30%) ===
        // Emerging Markets / Higher Purchasing Power
        "BR": "tier2", // Brazil (63 visitors)
        "UA": "tier2", // Ukraine (47 visitors)
        "ZA": "tier2", // South Africa (35 visitors)
        "MX": "tier2", // Mexico (32 visitors)
        "TR": "tier2", // Turkey (29 visitors)

        // === TEST TIER: Remove after testing ===
        "US": "tierTest" // TODO: Remove this line after verifying PPP works
    },

    // ============================================================
    // COUNTRY NAMES (For Banner Display)
    // ============================================================
    countryNames: {
        "IN": "India",
        "EG": "Egypt",
        "BD": "Bangladesh",
        "NG": "Nigeria",
        "PK": "Pakistan",
        "BR": "Brazil",
        "UA": "Ukraine",
        "ZA": "South Africa",
        "MX": "Mexico",
        "TR": "Turkey",
        "US": "United States" // TODO: Remove after testing
    }
};
