const favicon = document.querySelector('link[rel="icon"]');
const darkFavicon = '/images/favicon-dark.png';
const lightFavicon = '/images/favicon-light.png';

if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    favicon.href = darkFavicon;
} else {
    favicon.href = lightFavicon;
}