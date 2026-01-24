/**
 * Purchase Parity Pricing (PPP) Script
 *
 * Detects visitor's country and applies regional pricing discounts.
 * Works with Thinkific checkout links by appending coupon codes.
 *
 * Dependencies: ppp-config.js must be loaded before this script.
 */

(function () {
    'use strict';

    // Wait for config to be available
    if (typeof window.PPPConfig === 'undefined') {
        console.warn('PPP: ppp-config.js must be loaded before purchase-parity-pricing.js');
        return;
    }

    const config = window.PPPConfig;

    /**
     * Check for test mode via URL parameter (localhost only)
     * Usage: Add ?ppp_test=BR (or any country code) to the URL
     */
    function getTestCountry() {
        // Only allow test mode on localhost/local files for security
        const isLocalhost = window.location.hostname === 'localhost'
            || window.location.hostname === '127.0.0.1'
            || window.location.hostname.endsWith('.local')
            || window.location.protocol === 'file:';

        if (!isLocalhost) {
            return null;
        }

        const urlParams = new URLSearchParams(window.location.search);
        const testCountry = urlParams.get('ppp_test');
        if (testCountry) {
            console.log('PPP: Test mode enabled for country:', testCountry.toUpperCase());
            return testCountry.toUpperCase();
        }
        return null;
    }

    // Check if test mode is active
    const isTestMode = !!getTestCountry();

    // Exit early if PPP is disabled (unless test mode is active)
    if (!config.enabled && !isTestMode) {
        console.log('PPP: Disabled via config');
        return;
    }

    // Storage key for caching country detection
    const STORAGE_KEY = 'ppp_country_code';
    const STORAGE_EXPIRY_KEY = 'ppp_country_expiry';
    const CACHE_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

    /**
     * Get cached country code if still valid
     */
    function getCachedCountry() {
        // Skip cache in test mode
        if (getTestCountry()) {
            return null;
        }
        try {
            const expiry = localStorage.getItem(STORAGE_EXPIRY_KEY);
            if (expiry && Date.now() < parseInt(expiry, 10)) {
                return localStorage.getItem(STORAGE_KEY);
            }
        } catch (e) {
            // localStorage not available
        }
        return null;
    }

    /**
     * Cache country code
     */
    function cacheCountry(countryCode) {
        try {
            localStorage.setItem(STORAGE_KEY, countryCode);
            localStorage.setItem(STORAGE_EXPIRY_KEY, (Date.now() + CACHE_DURATION_MS).toString());
        } catch (e) {
            // localStorage not available
        }
    }

    /**
     * Detect visitor's country using free IP geolocation API
     */
    async function detectCountry() {
        // Check for test mode first (URL parameter override)
        const testCountry = getTestCountry();
        if (testCountry) {
            return testCountry;
        }

        // Check cache
        const cached = getCachedCountry();
        if (cached) {
            return cached;
        }

        try {
            // Using Cloudflare's trace endpoint - free, unlimited, fast
            const response = await fetch('/cdn-cgi/trace');

            if (!response.ok) {
                throw new Error('Failed to detect country');
            }

            const text = await response.text();
            // Parse "loc=XX" from the response
            const match = text.match(/loc=(\w+)/);
            const countryCode = match ? match[1] : null;

            if (countryCode) {
                cacheCountry(countryCode);
                return countryCode;
            }
        } catch (error) {
            console.warn('PPP: Could not detect country:', error.message);
        }

        return null;
    }

    /**
     * Get PPP tier info for a country
     */
    function getTierForCountry(countryCode) {
        const tierName = config.countryTiers[countryCode];
        if (!tierName) {
            return null;
        }

        const tier = config.tiers[tierName];
        if (!tier) {
            return null;
        }

        return {
            name: tierName,
            discount: tier.discount,
            couponCode: tier.couponCode
        };
    }

    /**
     * Calculate discounted price
     */
    function calculateDiscountedPrice(originalPrice, discountPercent) {
        const discounted = originalPrice * (1 - discountPercent / 100);
        return Math.round(discounted);
    }

    /**
     * Extract price from element text (handles formats like "$497", "497", etc.)
     */
    function extractPrice(text) {
        const match = text.replace(/,/g, '').match(/\d+/);
        return match ? parseInt(match[0], 10) : null;
    }

    /**
     * Append coupon code to Thinkific URL
     */
    function appendCouponToUrl(url, couponCode) {
        if (!url || !couponCode) return url;

        try {
            const urlObj = new URL(url);
            urlObj.searchParams.set('coupon', couponCode);
            return urlObj.toString();
        } catch (e) {
            // Fallback for relative URLs or invalid URLs
            const separator = url.includes('?') ? '&' : '?';
            return url + separator + 'coupon=' + encodeURIComponent(couponCode);
        }
    }

    /**
     * Update pricing display for standard course pages
     */
    function updateStandardCoursePricing(tierInfo, countryName) {
        const fullPriceContainer = document.getElementById('full-price');
        const discountedPriceContainer = document.getElementById('discounted-price');
        const discountedPriceValue = document.getElementById('discounted-price-value');
        const originalPriceEl = document.getElementById('original-price');
        const discountAmountEl = document.getElementById('discount-amount');
        const paymentLink = document.getElementById('one-time-payment-link');

        if (!fullPriceContainer || !discountedPriceContainer) {
            return false;
        }

        // Find the original price from the full-price container
        const priceValueEl = fullPriceContainer.querySelector('.value');
        if (!priceValueEl) return false;

        const originalPrice = extractPrice(priceValueEl.textContent);
        if (!originalPrice) return false;

        // Calculate discounted price
        const discountedPrice = calculateDiscountedPrice(originalPrice, tierInfo.discount);

        // Update discounted price display
        if (discountedPriceValue) {
            discountedPriceValue.textContent = discountedPrice;
        }

        // Update original price strikethrough
        if (originalPriceEl) {
            originalPriceEl.textContent = '$' + originalPrice;
        }

        // Hide the "% OFF" text - we show the regional note instead
        if (discountAmountEl) {
            discountAmountEl.style.display = 'none';
        }

        // Show discounted price, hide full price
        fullPriceContainer.style.display = 'none';
        discountedPriceContainer.style.display = 'block';

        // Update checkout link with coupon code
        if (paymentLink) {
            paymentLink.href = appendCouponToUrl(paymentLink.href, tierInfo.couponCode);
        }

        // Add regional pricing note
        addRegionalPricingNote(discountedPriceContainer, tierInfo.discount, countryName);

        return true;
    }

    /**
     * Update pricing display for bootcamp page (has multiple pricing options)
     */
    function updateBootcampPricing(tierInfo, countryName) {
        // One-time payment container
        const onetimeContainer = document.getElementById('onetime-payment-container');
        if (!onetimeContainer) return false;

        const fullPriceContainer = onetimeContainer.querySelector('#full-price');
        const discountedPriceContainer = onetimeContainer.querySelector('#discounted-price');
        const discountedPriceValue = onetimeContainer.querySelector('#discounted-price-value');
        const originalPriceEl = onetimeContainer.querySelector('#original-price');
        const discountAmountEl = onetimeContainer.querySelector('#discount-amount');
        const onetimeLink = document.getElementById('onetime-payment-link');

        if (!fullPriceContainer || !discountedPriceContainer) {
            return false;
        }

        // Find the original price
        const priceValueEl = fullPriceContainer.querySelector('.value');
        if (!priceValueEl) return false;

        const originalPrice = extractPrice(priceValueEl.textContent);
        if (!originalPrice) return false;

        // Calculate discounted price
        const discountedPrice = calculateDiscountedPrice(originalPrice, tierInfo.discount);

        // Update discounted price display
        if (discountedPriceValue) {
            discountedPriceValue.textContent = discountedPrice;
        }

        // Update original price strikethrough
        if (originalPriceEl) {
            originalPriceEl.textContent = '$' + originalPrice;
        }

        // Hide the "% OFF" text - we show the regional note instead
        if (discountAmountEl) {
            discountAmountEl.style.display = 'none';
        }

        // Show discounted price, hide full price
        fullPriceContainer.style.display = 'none';
        discountedPriceContainer.style.display = 'block';

        // Update checkout link with coupon code
        if (onetimeLink) {
            onetimeLink.href = appendCouponToUrl(onetimeLink.href, tierInfo.couponCode);
        }

        // Add regional pricing note
        addRegionalPricingNote(discountedPriceContainer, tierInfo.discount, countryName);

        // Hide payment plan option when PPP is active (coupon only applies to one-time)
        const paymentPlanContainer = document.getElementById('payment-plan-container');
        if (paymentPlanContainer) {
            paymentPlanContainer.style.display = 'none';
        }

        return true;
    }

    /**
     * Add a note explaining the regional pricing
     */
    function addRegionalPricingNote(container, discount, countryName) {
        // Check if note already exists
        if (container.querySelector('.ppp-note')) return;

        const note = document.createElement('div');
        note.className = 'ppp-note';
        note.style.cssText = `
            display: inline-block;
            margin-top: 0.4rem;
            padding: 0.3rem 0.75rem;
            background: rgba(255, 255, 255, 0.12);
            border: 1px solid rgba(255, 255, 255, 0.25);
            border-radius: 20px;
            font-size: 0.8rem;
            color: #e4e7fc;
        `;
        note.innerHTML = `<i class="fas fa-globe" style="margin-right: 0.4rem; opacity: 0.8;"></i>Regional pricing for ${countryName}`;

        // Insert before "Lifetime Access" (element with class 'frequency')
        const frequencyEl = container.querySelector('.frequency');
        if (frequencyEl) {
            frequencyEl.parentNode.insertBefore(note, frequencyEl);
        } else {
            container.appendChild(note);
        }
    }

    /**
     * Main initialization
     */
    async function init() {
        const countryCode = await detectCountry();

        if (!countryCode) {
            console.log('PPP: Could not detect country');
            return;
        }

        const tierInfo = getTierForCountry(countryCode);

        if (!tierInfo) {
            console.log('PPP: No discount tier for country:', countryCode);
            return;
        }

        const countryName = config.countryNames[countryCode] || countryCode;

        console.log('PPP: Applying', tierInfo.discount + '% discount for', countryName);

        // Determine page type and update accordingly
        const isBootcamp = window.location.pathname.includes('bootcamp');

        if (isBootcamp) {
            updateBootcampPricing(tierInfo, countryName);
        } else {
            updateStandardCoursePricing(tierInfo, countryName);
        }
    }

    // Run when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
