const WEATHER_API_KEY = "7e938ba8891d7a55ae2de85ba7c3daec";
const UNSPLASH_API_KEY = "sIlZovwMfbZYQ2h96ZRYnsN7Dj5u5zZt54A9f8toCn4";
const PEXELS_API_KEY = "YOUR_PEXELS_API_KEY"; // Replace with your actual Pexels API key

export async function fetchWeather(lat, lon) {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}`
    );
    return await response.json();
  } catch (error) {
    console.error("Error fetching weather data:", error);
    throw error;
  }
}

export async function fetchBackgroundMedia(cityName, config) {
  try {
    const mediaType =
      config.type === "mixed"
        ? Math.random() < config.videoProbability
          ? "video"
          : "image"
        : config.type;

    if (mediaType === "video") {
      const videoSuccess = await fetchBackgroundVideo(cityName);
      if (!videoSuccess) {
        console.log("Video fetch failed, falling back to image");
        await fetchBackgroundImage(cityName);
      }
    } else {
      await fetchBackgroundImage(cityName);
    }
  } catch (error) {
    console.error("Error in fetchBackgroundMedia:", error);
    // Final fallback: use a default image
    setDefaultBackground();
  }
}

async function fetchBackgroundVideo(cityName) {
  try {
    const timeOfDay = getTimeOfDay();
    let query = encodeURIComponent(`${timeOfDay} cityscape`);
    let url = `https://api.pexels.com/videos/search?query=${query}&orientation=landscape&size=large&per_page=1`;

    console.log("Fetching video with URL:", url);

    const response = await fetch(url, {
      headers: {
        Authorization: PEXELS_API_KEY,
      },
    });
    const data = await response.json();

    console.log("Pexels API response:", data);

    if (data.videos && data.videos.length > 0) {
      const video = data.videos[0];
      const videoFile = video.video_files.find(
        (file) => file.quality === "hd" || file.quality === "sd"
      );

      if (videoFile) {
        const backgroundElement = document.getElementById("background-media");
        backgroundElement.innerHTML = `
          <video autoplay loop muted playsinline>
            <source src="${videoFile.link}" type="video/mp4">
          </video>
        `;
        const video = backgroundElement.querySelector("video");
        video.onloadeddata = function () {
          backgroundElement.classList.add("loaded");
        };
        return true; // Video successfully set
      }
    }
    console.log("No suitable video found");
    return false; // No suitable video found
  } catch (error) {
    console.error("Error fetching background video:", error);
    return false; // Error occurred
  }
}

async function fetchBackgroundImage(cityName) {
  try {
    const query = encodeURIComponent(`${cityName} cityscape`);
    const url = `https://api.unsplash.com/photos/random?query=${query}&orientation=landscape&content_filter=high&client_id=${UNSPLASH_API_KEY}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.urls && data.urls.regular) {
      setBackgroundImage(data.urls.regular);
      return true; // Image successfully set
    } else {
      console.log("No suitable image found");
      return false; // No suitable image found
    }
  } catch (error) {
    console.error("Error fetching background image:", error);
    return false; // Error occurred
  }
}

function setBackgroundImage(imageUrl) {
  const backgroundElement = document.getElementById("background-media");
  const img = new Image();
  img.onload = function () {
    backgroundElement.style.backgroundImage = `url(${imageUrl})`;
    backgroundElement.style.backgroundSize = "cover";
    backgroundElement.style.backgroundPosition = "center";
    backgroundElement.classList.add("loaded");
  };
  img.src = imageUrl;
  // Clear any existing video
  backgroundElement.innerHTML = "";
}

export function setDefaultBackground() {
  // Set a default background color or image
  const backgroundElement = document.getElementById("background-media");
  backgroundElement.style.backgroundColor = "#000000"; // Black background as final fallback
  backgroundElement.style.backgroundImage = "none";
  backgroundElement.innerHTML = "";
  backgroundElement.classList.add("loaded"); // Ensure the black background is visible
}

function getTimeOfDay() {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "morning";
  if (hour >= 12 && hour < 17) return "afternoon";
  if (hour >= 17 && hour < 21) return "evening";
  return "night";
}
