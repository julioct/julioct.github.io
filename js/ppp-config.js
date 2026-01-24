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
    // ============================================================
    tiers: {
        tier1: {
            discount: 40,
            couponCode: "PPP-VKX7M2" // Heavy Discount (40%)
        },
        tier2: {
            discount: 30,
            couponCode: "PPP-QN4F8R" // Mid Discount (30%)
        }
        // ========================================================
        // TEST TIER: Uncomment below to test locally with a US VPN
        // ========================================================
        // tierTest: {
        //     discount: 5,   // 5% OFF - minimal for testing
        //     couponCode: "PPP-TEST"
        // }
    },

    // ============================================================
    // COUNTRY MAPPING (Validated by Sales & Traffic Data)
    // ============================================================
    countryTiers: {
        // === TIER 1: HEAVY DISCOUNT (40%) ===
        "IN": "tier1", // India (146 Users, $238 Avg Spend)
        "EG": "tier1", // Egypt (High traffic)
        "NG": "tier1", // Nigeria (11 Users)
        "BD": "tier1", // Bangladesh (High traffic)
        "PK": "tier1", // Pakistan (High traffic)
        "PH": "tier1", // Philippines ($188 Avg Spend)
        "VN": "tier1", // Vietnam ($228 Avg Spend)
        "GH": "tier1", // Ghana ($164 Avg Spend)

        // === TIER 2: MID DISCOUNT (30%) ===
        "BR": "tier2", // Brazil (39 Users, $290 Avg Spend)
        "PL": "tier2", // Poland (29 Users, $241 Avg Spend)
        "PT": "tier2", // Portugal (15 Users, $208 Avg Spend)
        "ZA": "tier2", // South Africa (14 Users)
        "TR": "tier2", // Turkey (13 Users)
        "UA": "tier2", // Ukraine (15 Users)
        "AR": "tier2", // Argentina ($277 Avg Spend)
        "PE": "tier2"  // Peru ($254 Avg Spend)

        // === TEST MAPPING: Uncomment to force US users into Test Tier ===
        // "US": "tierTest"
    },

    // ============================================================
    // COUNTRY NAMES (For Banner Display)
    // ============================================================
    countryNames: {
        "IN": "India",
        "EG": "Egypt",
        "NG": "Nigeria",
        "BD": "Bangladesh",
        "PK": "Pakistan",
        "PH": "Philippines",
        "VN": "Vietnam",
        "GH": "Ghana",
        "BR": "Brazil",
        "PL": "Poland",
        "PT": "Portugal",
        "ZA": "South Africa",
        "TR": "Turkey",
        "UA": "Ukraine",
        "AR": "Argentina",
        "PE": "Peru"
        // "US": "United States" // TODO: Remove after testing
    }
};