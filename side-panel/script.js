const FASHION_FACTS = [
    "The average woman owns around 103 pieces of clothing.",
    "High heels were originally worn by men in the 17th century.",
    "Coco Chanel popularized the little black dress in 1926.",
    "The largest fashion show had 1,600 models walking at once.",
    "High-waisted jeans first became popular in the 1970s.",
    "The average person spends $20,000 on clothing in their lifetime.",
    "The most expensive dress costs $30 million and has 70 diamonds.",
    "Fashion trends recycle every 20-30 years.",
    "Ancient Egyptians used linen to symbolize wealth.",
    "The 1960s ‘mod’ movement featured bold prints and mini skirts.",
    "Leather jackets became a symbol of rebellion in the 1950s.",
    "The term ‘fashionista’ was first used in the early 1990s.",
    "Denim jeans were originally designed for miners.",
    "The color black has symbolized elegance since the 1920s.",
    "Fashion shows can be as theatrical as they are stylish."
];




const divider = document.getElementById('divider');
const resultContainer = document.getElementById('result-container')
const resultImage = document.getElementById('result-image')
const fact = document.getElementById('fact');
const userInput = document.getElementById('user-input')
const uploadContainer = document.getElementById('upload-container')
const userImage = document.getElementById('user-image')
const loader = document.getElementById('loader')
const tryBtn = document.getElementById('try-now')
const downloadBtn = document.getElementById('download-btn')
const outfitImage = document.getElementById('outfit-image')
let outfitDescription = null;
let humanImageUrl = null;
let outfitUrl = null;

// Connect to the background script
const port = chrome.runtime.connect();

// Handle the response from the background script
port.onMessage.addListener((response) => {
  if (response && response.url) {
    outfitImage.src = response.url;
    outfitUrl = response.url
    outfitImage.classList.remove('hidden')
    outfitDescription = response.description
  }
});

port.postMessage({ type: "REQUEST_OUTFIT_URL" });

// loader
let currentFactIndex = 0;
fact.textContent = FASHION_FACTS[0];
function updateFact() {
    const factElement = document.getElementById('fact');
    factElement.textContent = FASHION_FACTS[currentFactIndex];
    currentFactIndex = (currentFactIndex + 1) % FASHION_FACTS.length;
}


// user input file change:
userInput.addEventListener("change", async function () {
    const file = this.files[0];
    if (file) {
        const reader = new FileReader();
        
        reader.onload = function (e) {
          uploadContainer.classList.add('hide')
          userImage.src = e.target.result;
          userImage.classList.add("loading");
          resultContainer.classList.remove('hide')
      };
  
      reader.readAsDataURL(file);
  
      const formData = new FormData();
      formData.append("image", file);
  
      try {
        const response = await fetch("http://localhost:3000/api/upload", {
          method: "POST",
          body: formData,
        });
  
        if (response.ok) {
          const { data } = await response.json();
          console.log("File uploaded successfully:", data.url);
          userImage.src = data.url;
          humanImageUrl = data.url;
          userImage.classList.remove("loading");
          setTimeout(() => {
           
        }, 1000)
        } else {
          console.log('upload failed')
          console.error("Upload failed");
        }
      } catch (error) {
        console.log('upload failed')
        console.error("Error uploading file:", error);
      }
    }
  });
  

// Drag event for comparision
let isDragging = false
document.addEventListener("dragstart", (e) => e.preventDefault());
divider.addEventListener('mousedown', (e) => {
    isDragging = true;
    e.preventDefault();
});
document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const rect = resultImage.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    if (offsetX < 0 || offsetX > resultImage.offsetWidth) return;
    divider.style.left = `${offsetX}px`;
    resultImage.style.clipPath = `inset(0 ${resultImage.offsetWidth - offsetX}px 0 0)`;
});
document.addEventListener('mouseup', () => {
    isDragging = false;
});
document.addEventListener('mouseleave', () => {
    isDragging = false;
});

const tryOutfit = async (humanImageUrl, outfitUrl, description = '') => {
  const response =  await fetch("http://localhost:3000/api/virtual-tryon", {
    method: "POST",
    body: JSON.stringify({
      humanImageUrl,
      outfitUrl,
      description
    }),
    headers: {
      "Content-Type": "application/json",
    },
  });
  const result = await response.json();
  if (!result.success) throw new Error("Something went wrong");
  return result.image.url;
}

tryBtn.addEventListener("click", async () => {
  console.log(humanImageUrl);
  
  if (outfitUrl && humanImageUrl) {
    loader.classList.remove("hide");
    const intervalId = setInterval(updateFact, 4000);
    try {
      const imageUrl = await tryOutfit(humanImageUrl, outfitUrl, outfitDescription);
      resultImage.src = imageUrl;
      divider.classList.remove("hidden");
      resultImage.classList.remove("hide");
      loader.classList.add("hide");
      tryBtn.classList.add("hide");
      downloadBtn.href = imageUrl
      downloadBtn.classList.remove("hidden");
    } catch (error) {
      console.error(error.message);
    } finally {
      clearInterval(intervalId);
    }
  }
});