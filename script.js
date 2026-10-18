// Reference Dataset Centers [sepalLength, sepalWidth, petalLength, petalWidth]
const SPECIES_DATA = {
  setosa: {
    name: "Iris Setosa",
    center: [5.00, 3.42, 1.46, 0.24],
    image: "images/setosa.jpg", // Local image path
    desc: "Setosa has distinctly small petals (length under 2 cm) and relatively wide sepals."
  },
  versicolor: {
    name: "Iris Versicolor",
    center: [5.93, 2.77, 4.26, 1.32],
    image: "images/versicolor.jpg", // Local image path
    desc: "Versicolor features moderate dimensions, falling directly between Setosa and Virginica."
  },
  virginica: {
    name: "Iris Virginica",
    center: [6.58, 2.97, 5.55, 2.02],
    image: "images/virginica.jpg", // Local image path
    desc: "Virginica has the largest petals and sepals of all three species."
  }
};

// Preset sample values
const PRESETS = {
  setosa: [5.1, 3.5, 1.4, 0.2],
  versicolor: [6.0, 2.8, 4.5, 1.3],
  virginica: [6.7, 3.0, 5.2, 2.3]
};

// Target elements
const inputs = {
  sl: document.getElementById("sepalLength"),
  sw: document.getElementById("sepalWidth"),
  pl: document.getElementById("petalLength"),
  pw: document.getElementById("petalWidth")
};

const labels = {
  sl: document.getElementById("sepalLengthVal"),
  sw: document.getElementById("sepalWidthVal"),
  pl: document.getElementById("petalLengthVal"),
  pw: document.getElementById("petalWidthVal")
};

// Update slider labels live
Object.keys(inputs).forEach(key => {
  inputs[key].addEventListener("input", (e) => {
    labels[key].textContent = `${parseFloat(e.target.value).toFixed(1)} cm`;
    classify();
  });
});

// Load preset sample into sliders
function applyPreset(speciesKey) {
  const vals = PRESETS[speciesKey];
  if (!vals) return;

  inputs.sl.value = vals[0];
  inputs.sw.value = vals[1];
  inputs.pl.value = vals[2];
  inputs.pw.value = vals[3];

  labels.sl.textContent = `${vals[0].toFixed(1)} cm`;
  labels.sw.textContent = `${vals[1].toFixed(1)} cm`;
  labels.pl.textContent = `${vals[2].toFixed(1)} cm`;
  labels.pw.textContent = `${vals[3].toFixed(1)} cm`;

  classify();
}

// Compute Euclidean distance in 4D space
function getDistance(vectorA, vectorB) {
  return Math.sqrt(
    Math.pow(vectorA[0] - vectorB[0], 2) +
    Math.pow(vectorA[1] - vectorB[1], 2) +
    Math.pow(vectorA[2] - vectorB[2], 2) +
    Math.pow(vectorA[3] - vectorB[3], 2)
  );
}

// Run classification and update probabilities
function classify() {
  const userInputs = [
    parseFloat(inputs.sl.value),
    parseFloat(inputs.sw.value),
    parseFloat(inputs.pl.value),
    parseFloat(inputs.pw.value)
  ];

  const speciesKeys = Object.keys(SPECIES_DATA);
  const distances = {};

  // 1. Calculate distances
  speciesKeys.forEach(key => {
    distances[key] = getDistance(userInputs, SPECIES_DATA[key].center);
  });

  // 2. Convert to probabilities via Softmax
  const scalingFactor = 1.2;
  const expValues = {};
  let expSum = 0;

  speciesKeys.forEach(key => {
    const expVal = Math.exp(-distances[key] * scalingFactor);
    expValues[key] = expVal;
    expSum += expVal;
  });

  // 3. Find winner & calculated percentages
  let topKey = speciesKeys[0];
  let maxProbability = -1;
  const probs = {};

  speciesKeys.forEach(key => {
    const percentage = (expValues[key] / expSum) * 100;
    probs[key] = percentage;

    if (percentage > maxProbability) {
      maxProbability = percentage;
      topKey = key;
    }
  });

  const predicted = SPECIES_DATA[topKey];

  // 4. Update UI title, description & confidence score
  document.getElementById("speciesName").textContent = predicted.name;
  document.getElementById("speciesDesc").textContent = predicted.desc;
  document.getElementById("confidenceBadge").textContent = `${maxProbability.toFixed(1)}% Confidence`;

  // Update local image smoothly
  const imgEl = document.getElementById("speciesImg");
  const currentPath = imgEl.getAttribute("src");

  if (currentPath !== predicted.image) {
    imgEl.style.opacity = "0.2";
    setTimeout(() => {
      imgEl.src = predicted.image;
      imgEl.alt = predicted.name;
      imgEl.style.opacity = "1";
    }, 150);
  }

  // 5. Update probability progress bars
  speciesKeys.forEach(key => {
    const percent = probs[key];
    const fillEl = document.getElementById(`fill-${key}`);
    const textEl = document.getElementById(`prob-${key}`);
    const rowEl = document.getElementById(`row-${key}`);

    fillEl.style.width = `${percent}%`;
    textEl.textContent = `${percent.toFixed(1)}%`;
    
    if (key === topKey) {
      rowEl.classList.add("active");
    } else {
      rowEl.classList.remove("active");
    }
  });
}

// Form submit event
document.getElementById("irisForm").addEventListener("submit", (e) => {
  e.preventDefault();
  classify();
});

// Run initial evaluation on load
classify();
