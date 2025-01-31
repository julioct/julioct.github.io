(function() {
    const urlParams = new URLSearchParams(window.location.search);
    const isEmailSource = urlParams.has("utm_source"); // Detects email visitors

    // Store email visit info in localStorage if UTM parameters are present
    if (isEmailSource) {
        localStorage.setItem("emailSubscriber", "true");
    }

    // Define the discounted link
    const discountBootcampLink = "https://dfl0.us/s/bd76a4ca";

    // Update all bootcamp links if the visitor came from an email
    if (localStorage.getItem("emailSubscriber") === "true") {
        document.querySelectorAll("a[href*='/courses/dotnetbootcamp']").forEach(link => {
            link.href = discountBootcampLink;
        });
    }
})();
