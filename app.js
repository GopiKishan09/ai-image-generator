const themeToggle = document.querySelector(".theme-toggele");
const promptInput = document.querySelector(".prompt-input");
const promptBtn = document.querySelector(".Prompt-btn");
const promptForm = document.querySelector(".prompt-form");
const modelSelect = document.getElementById("model-select");
const countSelect = document.getElementById("count-select");
const ratioSelect = document.getElementById("ratio-select");
const gridGalley = document.querySelector(".gallery-grid");
const generateBtn = document.querySelector(".generate-btn");

const API_KEY = "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";

// Example prompts
const examplePrompts = [
  "A magic forest with glowing plants and fairy homes among giant mushrooms",
  "An old steampunk airship floating through golden clouds at sunset",
  "A future Mars colony with glass domes and gardens against red mountains",
  "A dragon sleeping on gold coins in a crystal cave",
];

// -------------------------------------------
// THEME TOGGLE
// -------------------------------------------
(() => {
  const saved = localStorage.getItem("theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const isDark = saved === "dark" || (!saved && prefersDark);

  document.body.classList.toggle("dark-theme", isDark);
  themeToggle.querySelector("i").className = isDark
    ? "fas fa-sun"
    : "fas fa-moon";
})();

// Theme toggle
themeToggle.addEventListener("click", () => {
  const isDark = document.body.classList.toggle("dark-theme");
  localStorage.setItem("theme", isDark ? "dark" : "light");

  themeToggle.querySelector("i").className = isDark
    ? "fas fa-sun"
    : "fas fa-moon";
});

// -------------------------------------------
// Aspect Ratio to Image Dimensions
// -------------------------------------------
const getImageDimensions = (ar) => {
  switch (ar) {
    case "1/1":
      return { width: 1024, height: 1024 };
    case "16/9":
      return { width: 1280, height: 720 };
    case "9/16":
      return { width: 720, height: 1280 };
    default:
      return { width: 1024, height: 1024 };
  }
};

// -------------------------------------------
// Create Loading Cards
// -------------------------------------------
const createImageCards = (model, count, ratio, prompt) => {
  gridGalley.innerHTML = "";

  for (let i = 0; i < count; i++) {
    gridGalley.innerHTML += `
      <div class="image-card loading" id="img-card${i}" style="aspect-ratio:${ratio}">
        <div class="status-container">
          <div class="spinner"></div>
          <p class="status-text">Generating...</p>
        </div>
        <img class="result-img" />
      </div>
    `;
  }
};

// -------------------------------------------
// GENERATE IMAGE FUNCTION
// -------------------------------------------
const generateImage = async (
  selectedModel,
  imageCount,
  aspectRatio,
  promptText
) => {
  const MODEL_URL = `https://router.huggingface.co/hf-inference/models/${selectedModel}`;
  const { width, height } = getImageDimensions(aspectRatio);

  const tasks = Array.from({ length: imageCount }, async (_, i) => {
    const card = document.getElementById(`img-card${i}`);

    try {
      const response = await fetch(MODEL_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: promptText,
          parameters: { width, height },
          options: { wait_for_model: true },
        }),
      });

      if (!response.ok) throw new Error("API Error");

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      // Update Card UI
      card.classList.remove("loading");
      const imgElement = card.querySelector(".result-img");
      imgElement.src = url;

      // ADD DOWNLOAD BUTTON + OVERLAY
      let overlay = document.createElement("div");
      overlay.className = "img-overlay";

      let downloadBtn = document.createElement("button");
      downloadBtn.className = "img-download-btn";
      downloadBtn.innerHTML = `<i class="fa-solid fa-download"></i>`;

      downloadBtn.addEventListener("click", () => {
        const a = document.createElement("a");
        a.href = url;
        a.download = `AI-image-${i + 1}.png`;
        a.click();
      });

      overlay.appendChild(downloadBtn);
      card.appendChild(overlay);
    } catch (err) {
      card.classList.add("error");
      card.innerHTML = `
        <div class="status-container">
          <i class="fa-solid fa-triangle-exclamation"></i>
          <p class="status-text">Error generating image</p>
        </div>
      `;
      console.error(err);
    }
  });

  await Promise.allSettled(tasks);

  // Unlock Generate Button
  generateBtn.disabled = false;
  generateBtn.innerHTML = `<i class="fa-solid fa-wand-magic-sparkles"></i> Generate`;
};

// -------------------------------------------
// FORM SUBMIT HANDLER
// -------------------------------------------
const handleformSubmit = (e) => {
  e.preventDefault();

  const selectedModel = modelSelect.value;
  const imageCount = +countSelect.value;
  const aspectRatio = ratioSelect.value;
  const promptText = promptInput.value.trim();

  // Create loading cards
  createImageCards(selectedModel, imageCount, aspectRatio, promptText);

  // Disable button + loader
  generateBtn.disabled = true;
  generateBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Generating...`;

  // Call API
  generateImage(selectedModel, imageCount, aspectRatio, promptText);
};

promptForm.addEventListener("submit", handleformSubmit);

// -------------------------------------------
// RANDOM PROMPT BUTTON
// -------------------------------------------
promptBtn.addEventListener("click", () => {
  const random =
    examplePrompts[Math.floor(Math.random() * examplePrompts.length)];
  promptInput.value = random;
});

