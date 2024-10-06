import { setLogoWidth, setAnimationDuration } from "./src/utils/style.js";
import { getRandomPosition } from "./src/utils/position.js";
import { thoughts } from "./src/data/thoughts.js";
import { animateOverlay } from "./src/utils/animation.js";
import { fetchWeather, fetchBackgroundMedia } from "./src/utils/api.js";

const config = {
  overlay: {
    minOpacity: 0.7,
    maxOpacity: 0.9,
    opacityStep: 0.0001,
  },
  weatherProbability: 0.2,
  background: {
    type: "mixed",
    videoProbability: 0.3,
  },
};

document.addEventListener("DOMContentLoaded", () => {
  const thoughtContainer = document.getElementById("thought-container");
  const backgroundMedia = document.getElementById("background-media");
  const head = document.getElementById("hanging-head");
  let thoughtIndex = 0;
  let weatherData = null;

  function createThoughtBubble(text) {
    const bubble = document.createElement("div");
    bubble.className = "thought-bubble";
    bubble.innerText = text;

    const [x, y] = getRandomPosition(
      head,
      window.innerHeight > window.innerWidth
    );
    bubble.style.left = `${x}px`;
    bubble.style.top = `${y}px`;

    const calloutLine = document.createElement("div");
    calloutLine.className = "callout-line";

    thoughtContainer.appendChild(bubble);
    thoughtContainer.appendChild(calloutLine);

    setTimeout(() => {
      bubble.style.opacity = "1";
      calloutLine.style.opacity = "0.25";
      updateCalloutLine(calloutLine, head, bubble);
    }, 100);

    function animateCalloutLine() {
      updateCalloutLine(calloutLine, head, bubble);
      if (parseFloat(bubble.style.opacity) > 0) {
        requestAnimationFrame(animateCalloutLine);
      }
    }

    animateCalloutLine();

    setTimeout(() => {
      bubble.style.opacity = "0";
      calloutLine.style.opacity = "0";
      setTimeout(() => {
        bubble.remove();
        calloutLine.remove();
      }, 1000);
    }, 6000);
  }

  function updateCalloutLine(line, head, bubble) {
    const headRect = head.getBoundingClientRect();
    const bubbleRect = bubble.getBoundingClientRect();

    const startX = headRect.left + headRect.width / 2;
    const startY = headRect.top + headRect.height / 2;
    const endX = bubbleRect.left + bubbleRect.width / 2;
    const endY = bubbleRect.top + bubbleRect.height / 2;

    const angle = Math.atan2(endY - startY, endX - startX);
    const length = Math.sqrt(
      Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2)
    );

    line.style.width = `${length}px`;
    line.style.left = `${startX}px`;
    line.style.top = `${startY}px`;
    line.style.transform = `rotate(${angle}rad)`;
  }

  async function updateWeatherAndBackground(lat, lon) {
    try {
      weatherData = await fetchWeather(lat, lon);
      if (weatherData && weatherData.name) {
        await fetchBackgroundMedia(weatherData.name, config.background);
      } else {
        throw new Error("Invalid weather data");
      }
    } catch (error) {
      console.error("Error updating weather and background:", error);
      setDefaultBackground(); // Ensure we always have a background
    }
  }

  function getWeatherThought() {
    if (weatherData && weatherData.weather && weatherData.main) {
      const temp = (weatherData.main.temp - 273.15).toFixed(1);
      const description = weatherData.weather[0].description;
      const cityName = weatherData.name;
      return `Hey, it's ${temp}°C with ${description} in ${cityName} right now. Just thought you should know.`;
    }
    return "I tried to check the weather, but my brain got foggy. Maybe later.";
  }

  function getLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          updateWeatherAndBackground(
            position.coords.latitude,
            position.coords.longitude
          );
        },
        (error) => {
          console.error("Error getting location:", error);
          setDefaultBackground();
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
      setDefaultBackground();
    }
  }

  function fetchThoughts() {
    let thought;
    if (Math.random() < config.weatherProbability && weatherData) {
      thought = getWeatherThought();
    } else {
      thought = thoughts[thoughtIndex];
      thoughtIndex = (thoughtIndex + 1) % thoughts.length;
    }
    createThoughtBubble(thought);
  }

  function updateLogoAnimation() {
    const logo = document.getElementById("logo");
    const logoWidth = logo.offsetWidth;
    const screenWidth = window.innerWidth;
    setLogoWidth(logoWidth);
    setAnimationDuration(screenWidth, logoWidth);
  }

  function init() {
    updateLogoAnimation();
    getLocation();
    animateOverlay(config.overlay);
    fetchThoughts();
    setInterval(fetchThoughts, 7000);
    setInterval(getLocation, 5 * 60 * 1000); // Update weather every 5 minutes
  }

  init();

  window.addEventListener("resize", updateLogoAnimation);
});
