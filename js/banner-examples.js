/* Example Banner Configurations
   Copy one of these configurations to notification-banner.js when needed
*/

// Example 1: Back to School Sale (Current)
const backToSchoolConfig = {
    enabled: true,
    message: "📚 Back to School Sale: <strong>30% OFF EVERYTHING</strong> • Ends&nbsp;September&nbsp;2",
    button: {
        text: "SAVE 30% NOW",
        url: "/courses"
    },
    countdown: {
        enabled: false,
        endDate: null
    },
    backgroundColor: "#E56717",
    textColor: "white",
    buttonBackgroundColor: "#2C3E8C"
};

// Example 2: Black Friday Sale with Countdown
const blackFridayConfig = {
    enabled: true,
    message: "🔥 Black Friday: <strong>50% OFF ALL COURSES</strong>",
    button: {
        text: "GET 50% OFF",
        url: "/courses"
    },
    countdown: {
        enabled: true,
        endDate: new Date('2024-11-30T23:59:59')
    },
    backgroundColor: "#000000",
    textColor: "white",
    buttonBackgroundColor: "#FF6B35"
};

// Example 3: New Year Sale
const newYearConfig = {
    enabled: true,
    message: "🎉 New Year, New Skills: <strong>40% OFF</strong> • Limited Time",
    button: {
        text: "START LEARNING",
        url: "/courses"
    },
    countdown: {
        enabled: false,
        endDate: null
    },
    backgroundColor: "#6C5CE7",
    textColor: "white",
    buttonBackgroundColor: "#A29BFE"
};

// Example 4: Easter Sale
const easterConfig = {
    enabled: true,
    message: "🐰 Easter Special: <strong>25% OFF</strong> All .NET Courses",
    button: {
        text: "CLAIM DISCOUNT",
        url: "/courses"
    },
    countdown: {
        enabled: false,
        endDate: null
    },
    backgroundColor: "#00B894",
    textColor: "white",
    buttonBackgroundColor: "#00A085"
};

// Example 5: Flash Sale with Countdown
const flashSaleConfig = {
    enabled: true,
    message: "⚡ Flash Sale: <strong>35% OFF</strong> • Hurry, Limited Time!",
    button: {
        text: "GRAB NOW",
        url: "/courses"
    },
    countdown: {
        enabled: true,
        endDate: new Date('2024-12-15T23:59:59')
    },
    backgroundColor: "#E17055",
    textColor: "white",
    buttonBackgroundColor: "#D63031"
};

// Example 6: Summer Sale
const summerConfig = {
    enabled: true,
    message: "☀️ Summer Learning: <strong>30% OFF</strong> All Courses",
    button: {
        text: "SAVE NOW",
        url: "/courses"
    },
    countdown: {
        enabled: false,
        endDate: null
    },
    backgroundColor: "#FDCB6E",
    textColor: "#2d3436",
    buttonBackgroundColor: "#E84393"
};

// Example 7: Product Launch Announcement
const productLaunchConfig = {
    enabled: true,
    message: "🚀 NEW COURSE: Advanced .NET Microservices is here!",
    button: {
        text: "LEARN MORE",
        url: "/courses/microservices"
    },
    countdown: {
        enabled: false,
        endDate: null
    },
    backgroundColor: "#0984E3",
    textColor: "white",
    buttonBackgroundColor: "#74B9FF"
};

// Example 8: Disabled Banner (No banner shown)
const disabledConfig = {
    enabled: false,
    message: "",
    button: {
        text: "",
        url: ""
    },
    countdown: {
        enabled: false,
        endDate: null
    },
    backgroundColor: "",
    textColor: "",
    buttonBackgroundColor: ""
};
