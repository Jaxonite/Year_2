const photoFiles = [
  "20230309_094151.jpg",
  "IMG-20220911-WA0016.jpg",
  "IMG-20250531-WA0028.jpg",
  "IMG-20250601-WA0046.jpg",
  "IMG20250302145809.jpg",
  "IMG20250302151945.jpg",
  "IMG20250728173726.jpg",
  "IMG20251206152449.jpg",
  "IMG20251206160921.jpg",
  "IMG_20240507_233926.jpg",
  "1000148727_enhanced.jpg.png"
];

const wishlist = [
  { title: "Porsche 911", description: "A sleek drive for a big-year celebration.", visual: "Car" },
  { title: "A Villa", description: "Private space, soft lights, endless calm.", visual: "Villa" },
  { title: "A Farmhouse", description: "Green surroundings and slow mornings.", visual: "Home" },
  { title: "Diamond Ring", description: "A classic sparkle for a milestone year.", visual: "Ring" },
  { title: "Trip to Europe", description: "One dreamy trip with new cities and memories.", visual: "Trip" },
  { title: "A Luxury bag", description: "A beautiful statement piece for the collection.", visual: "Bag" },
  { title: "An iPhone", description: "A fresh everyday upgrade.", visual: "Phone" },
  { title: "A Necklace", description: "Something elegant and close to the heart.", visual: "Necklace" },
  { title: "A Luxury Watch", description: "A polished gift that lasts years.", visual: "Watch" },
  { title: "A sexy Costume", description: "A bold surprise for one unforgettable celebration.", visual: "Style" }
];

const state = {
  step: 0,
  metDate: "",
  vibe: "",
  tinyThing: "",
  word: "",
  ranking: wishlist.map((item) => ({ ...item }))
};

const hero = document.getElementById("hero");
const quiz = document.getElementById("quiz");
const results = document.getElementById("results");
const finalSection = document.getElementById("final");
const slideshowImage = document.getElementById("slideshowImage");
const slideshowCounter = document.getElementById("slideshowCounter");
const prevSlide = document.getElementById("prevSlide");
const nextSlide = document.getElementById("nextSlide");
const beginQuiz = document.getElementById("beginQuiz");
const metDate = document.getElementById("metDate");
const dateFeedback = document.getElementById("dateFeedback");
const tinyThing = document.getElementById("tinyThing");
const rankingList = document.getElementById("rankingList");
const rankingTemplate = document.getElementById("rankingItemTemplate");
const summaryDate = document.getElementById("summaryDate");
const summaryList = document.getElementById("summaryList");
const showResults = document.getElementById("showResults");
const goToFinal = document.getElementById("goToFinal");
const finalParagraph = document.getElementById("finalParagraph");
const correctMeetingDate = "2024-04-28";

const choiceGroups = new Map();
document.querySelectorAll("[data-choice-group]").forEach((group) => {
  choiceGroups.set(group.dataset.choiceGroup, group);
});

let slideshowIndex = 0;
let slideshowTimer = null;

function imagePath(file) {
  return file;
}

function startSlideshow() {
  if (slideshowTimer) {
    window.clearInterval(slideshowTimer);
  }

  const render = () => {
    const file = photoFiles[slideshowIndex % photoFiles.length];
    slideshowImage.src = imagePath(file);
    slideshowImage.alt = `Memory ${slideshowIndex + 1}`;
    slideshowCounter.textContent = `${String(slideshowIndex + 1).padStart(2, "0")} / ${photoFiles.length}`;
  };

  const advance = (direction) => {
    slideshowIndex = (slideshowIndex + direction + photoFiles.length) % photoFiles.length;
    render();
    restartSlideshowTimer();
  };

  window.advanceSlideshow = advance;

  render();
  restartSlideshowTimer();
}

function restartSlideshowTimer() {
  if (slideshowTimer) {
    window.clearInterval(slideshowTimer);
  }

  slideshowTimer = window.setInterval(() => {
    slideshowIndex = (slideshowIndex + 1) % photoFiles.length;
    const file = photoFiles[slideshowIndex];
    slideshowImage.src = imagePath(file);
    slideshowImage.alt = `Memory ${slideshowIndex + 1}`;
    slideshowCounter.textContent = `${String(slideshowIndex + 1).padStart(2, "0")} / ${photoFiles.length}`;
  }, 3000);
}

function formatDate(value) {
  if (!value) {
    return "Not chosen yet";
  }

  return new Date(`${value}T00:00:00`).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric"
  });
}

function scrollToSection(section) {
  section.scrollIntoView({ behavior: "smooth", block: "start" });
}

function setActiveStep(index) {
  state.step = index;
  document.querySelectorAll(".quiz-step").forEach((step) => {
    step.classList.toggle("active", Number(step.dataset.step) === index);
  });

  const activeStep = document.querySelector(`.quiz-step[data-step="${index}"]`);
  if (activeStep) {
    activeStep.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function reorderRanking(fromIndex, toIndex) {
  if (toIndex < 0 || toIndex >= state.ranking.length) {
    return;
  }

  const [item] = state.ranking.splice(fromIndex, 1);
  state.ranking.splice(toIndex, 0, item);
  renderRanking();
}

function moveRankingItem(index, direction) {
  const targetIndex = direction === "up" ? index - 1 : index + 1;
  reorderRanking(index, targetIndex);
}

function renderRanking() {
  rankingList.innerHTML = "";

  state.ranking.forEach((item, index) => {
    const node = rankingTemplate.content.firstElementChild.cloneNode(true);
    node.dataset.index = String(index);
    node.querySelector(".ranking-item__year").textContent = String(2027 + index);
    node.querySelector("strong").textContent = item.title;
    node.querySelector("p").textContent = item.description;

    node.style.cursor = "grab";
    node.addEventListener("dragstart", (event) => {
      event.dataTransfer.setData("text/plain", String(index));
      event.dataTransfer.effectAllowed = "move";
    });

    node.addEventListener("dragover", (event) => event.preventDefault());

    node.addEventListener("drop", (event) => {
      event.preventDefault();
      const fromIndex = Number(event.dataTransfer.getData("text/plain"));
      const dropIndex = Number(node.dataset.index);
      if (Number.isNaN(fromIndex) || Number.isNaN(dropIndex) || fromIndex === dropIndex) {
        return;
      }

      const moved = state.ranking.splice(fromIndex, 1)[0];
      state.ranking.splice(dropIndex, 0, moved);
      renderRanking();
    });

    node.querySelector('[data-dir="up"]').addEventListener("click", () => moveRankingItem(index, "up"));
    node.querySelector('[data-dir="down"]').addEventListener("click", () => moveRankingItem(index, "down"));

    rankingList.appendChild(node);
  });
}

function renderSummary() {
  summaryDate.textContent = formatDate(state.metDate);
  summaryList.innerHTML = "";

  state.ranking.forEach((item, index) => {
    const row = document.createElement("div");
    row.className = "summary-row";
    row.innerHTML = `<strong>${2027 + index}</strong> — ${item.title}`;
    summaryList.appendChild(row);
  });
}

function goNext() {
  if (state.step < 4) {
    setActiveStep(state.step + 1);
  }
}

function canAdvanceFrom(stepIndex) {
  if (stepIndex === 0) {
    return metDate.value === correctMeetingDate;
  }

  if (stepIndex === 1) {
    return state.ranking.length === wishlist.length;
  }

  if (stepIndex === 2) {
    return Boolean(state.vibe);
  }

  if (stepIndex === 3) {
    return tinyThing.value.trim().length > 0;
  }

  if (stepIndex === 4) {
    return Boolean(state.word);
  }

  return true;
}

function showChoiceSelected(groupName, value) {
  const group = choiceGroups.get(groupName);
  if (!group) {
    return;
  }

  group.querySelectorAll(".choice-card").forEach((button) => {
    button.classList.toggle("selected", button.dataset.value === value);
  });
}

function showResultsSection() {
  renderSummary();
  results.hidden = false;
  scrollToSection(results);
}

function updateFinalParagraph() {
  finalParagraph.textContent =
    "A little paragraph for Tamanna will live here. You can replace this with your own note before publishing.";
}

function renderCurrentSlide() {
  const file = photoFiles[slideshowIndex % photoFiles.length];
  slideshowImage.src = imagePath(file);
  slideshowImage.alt = `Memory ${slideshowIndex + 1}`;
  slideshowCounter.textContent = `${String(slideshowIndex + 1).padStart(2, "0")} / ${photoFiles.length}`;
}

beginQuiz.addEventListener("click", () => {
  quiz.hidden = false;
  results.hidden = true;
  finalSection.hidden = true;
  scrollToSection(quiz);
});

metDate.addEventListener("change", () => {
  state.metDate = metDate.value;
  dateFeedback.textContent = metDate.value === correctMeetingDate ? "That's the right date." : "";
});

tinyThing.addEventListener("input", () => {
  state.tinyThing = tinyThing.value;
});

document.querySelectorAll("[data-action=\"next\"]").forEach((button) => {
  button.addEventListener("click", () => {
    if (state.step === 0 && metDate.value !== correctMeetingDate) {
      dateFeedback.textContent = "Nope. Try the exact date again.";
      metDate.focus();
      return;
    }

    if (canAdvanceFrom(state.step)) {
      goNext();
    }
  });
});

document.querySelector('[data-action="shuffle"]').addEventListener("click", () => {
  state.ranking = [...state.ranking].sort(() => Math.random() - 0.5);
  renderRanking();
});

document.querySelectorAll(".choice-grid").forEach((grid) => {
  const groupName = grid.dataset.choiceGroup;
  grid.querySelectorAll(".choice-card").forEach((button) => {
    button.addEventListener("click", () => {
      if (groupName === "vibe") {
        state.vibe = button.dataset.value;
      }

      if (groupName === "word") {
        state.word = button.dataset.value;
      }

      showChoiceSelected(groupName, button.dataset.value);
    });
  });
});

showResults.addEventListener("click", () => {
  if (!canAdvanceFrom(4)) {
    return;
  }

  showResultsSection();
});

prevSlide.addEventListener("click", () => {
  slideshowIndex = (slideshowIndex - 1 + photoFiles.length) % photoFiles.length;
  renderCurrentSlide();
  restartSlideshowTimer();
});

nextSlide.addEventListener("click", () => {
  slideshowIndex = (slideshowIndex + 1) % photoFiles.length;
  renderCurrentSlide();
  restartSlideshowTimer();
});

goToFinal.addEventListener("click", () => {
  window.location.href = "final.html";
});

renderRanking();
updateFinalParagraph();
quiz.hidden = true;
results.hidden = true;
finalSection.hidden = true;
startSlideshow();