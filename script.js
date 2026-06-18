/* ════════════════════════════════════════════
   MOVIE DATA
════════════════════════════════════════════ */
const movies = [
  {
    title: "Joker",
    genre: "Crime",
    country: "USA, Canada",
    language: "English",
    year: 2019,
    duration: 122,
    actors: ["Joaquin Phoenix", "Robert De Niro", "Zazie Beetz"],
    poster: "./pics/Joker.jpg",
    actualScore: 8.5
  },
  {
    title: "Tenet",
    genre: "Action",
    country: "UK, USA",
    language: "English, Russian, Ukrainian, Estonian",
    year: 2020,
    duration: 150,
    actors: ["Elizabeth Debicki", "Robert Pattinson", "John David Washington"],
    poster: "./pics/Tenet.jpg",
    actualScore: 7.9
  },
  {
    title: "The Nun",
    genre: "Horror",
    country: "USA",
    language: "English, French, Romanian, Latin",
    year: 2018,
    duration: 96,
    actors: ["Demián Bichir", "Taissa Farmiga", "Jonas Bloquet"],
    poster: "./pics/The nun.jpg",
    actualScore: 5.3
  },
  {
    title: "Once Upon a Time... in Hollywood",
    genre: "Comedy",
    country: "USA, UK, China",
    language: "English, Italian, Spanish, German",
    year: 2019,
    duration: 161,
    actors: ["Leonardo DiCaprio", "Brad Pitt", "Margot Robbie"],
    poster: "./pics/Once Upon a Time... in Hollywood.jpg",
    actualScore: 7.6
  },
  {
    title: "1917",
    genre: "Drama",
    country: "USA, UK, India, Spain, Canada, China",
    language: "English, French, German",
    year: 2019,
    duration: 119,
    actors: ["Dean-Charles Chapman", "George MacKay", "Daniel Mays"],
    poster: "./pics/1917.jpg",
    actualScore: 8.3
  }
];

const modelPredictions = [6.5, 6.5, 5.8, 7.1, 6.8];

const ORDINALS = ["ONE", "TWO", "THREE", "FOUR", "FIVE"];
const ORDINALS_AXIS = ["1st", "2nd", "3rd", "4th", "5th"];

/* ════════════════════════════════════════════
   STATE
════════════════════════════════════════════ */
let userPredictions = [];

/* ════════════════════════════════════════════
   DOM REFS
════════════════════════════════════════════ */
const pageHome = document.getElementById("page-home");
const pageMovies = document.getElementById("page-movies");
const pageResults = document.getElementById("page-results");
const moviesList = document.getElementById("movies-list");
const errorMsg = document.getElementById("error-msg");
const modalInstr = document.getElementById("modal-instruction");

/* ════════════════════════════════════════════
   NAVIGATION
════════════════════════════════════════════ */
function showPage(page) {
  [pageHome, pageMovies, pageResults].forEach(p => p.classList.remove("active"));
  page.classList.add("active");
  window.scrollTo(0, 0);
}

/* ════════════════════════════════════════════
   BUILD MOVIE CARDS
════════════════════════════════════════════ */
function buildMovieCards() {
  moviesList.innerHTML = "";

  movies.forEach((movie, i) => {
    const card = document.createElement("div");
    card.className = "movie-card";

    /* Poster */
    const posterHtml = `
      <div class="movie-poster-wrapper">
        <img
          class="movie-poster"
          src="${movie.poster}"
          alt="${movie.title} poster"
          onerror="this.style.display='none';this.nextElementSibling.style.display='flex';"
        />
      </div>`;

    /* Metadata */
    const metaHtml = `
      <div class="movie-meta">
        <div class="meta-row meta-title"><span class="meta-arrow"></span> > Title: ${movie.title}</div>
        <div class="meta-row">Genre: ${movie.genre}</div>
        <div class="meta-row">Country: ${movie.country}</div>
        <div class="meta-row">Language: ${movie.language}</div>
        <div class="meta-row">Year: ${movie.year}</div>
        <div class="meta-row">Duration (minutes): ${movie.duration}</div>
        <div class="meta-row">Actor 1: ${movie.actors[0]}</div>
        <div class="meta-row">Actor 2: ${movie.actors[1]}</div>
        <div class="meta-row">Actor 3: ${movie.actors[2]}</div>
      </div>`;

    /* Input */
    const inputHtml = `
      <div class="guess-block">
        <label class="guess-label" for="input-${i}">Input your prediction:</label>
        <div class="guess-input-row">
          <span class="guess-prompt">&gt;</span>
          <input
            id="input-${i}"
            class="guess-input"
            type="number"
            min="0"
            max="10"
            step="0.1"
            placeholder="0.0 – 10.0"
            inputmode="decimal"
            aria-label="IMDb score guess for ${movie.title}"
          />
        </div>
      </div>`;

    card.innerHTML = `
      <div class="movie-number-row">
        <span class="movie-number-text">MOVIE ${ORDINALS[i]}</span>
        <span class="movie-number-line"></span>
      </div>
      ${posterHtml}
      ${metaHtml}
      ${inputHtml}
    `;

    moviesList.appendChild(card);
  });

  /* Live validation */
  document.querySelectorAll(".guess-input").forEach(inp => {
    inp.addEventListener("input", () => validateInput(inp));
  });
}

function validateInput(input) {
  const v = parseFloat(input.value);
  if (input.value.trim() === "") {
    input.classList.remove("valid", "invalid");
  } else if (isNaN(v) || v < 0 || v > 10) {
    input.classList.replace("valid", "invalid") || input.classList.add("invalid");
  } else {
    input.classList.replace("invalid", "valid") || input.classList.add("valid");
  }
}

/* ════════════════════════════════════════════
   COLLECT & VALIDATE
════════════════════════════════════════════ */
function collectPredictions() {
  const inputs = [...document.querySelectorAll(".guess-input")];
  const vals = [];

  for (let i = 0; i < inputs.length; i++) {
    const raw = inputs[i].value.trim();
    if (raw === "") {
      errorMsg.textContent = `⚠ Please fill in all 5 scores. Movie ${ORDINALS[i]} is missing.`;
      inputs[i].classList.add("invalid");
      inputs[i].scrollIntoView({ behavior: "smooth", block: "center" });
      return null;
    }
    const v = parseFloat(raw);
    if (isNaN(v) || v < 0 || v > 10) {
      errorMsg.textContent = `⚠ Movie ${ORDINALS[i]}: score must be between 0.0 and 10.0.`;
      inputs[i].classList.add("invalid");
      inputs[i].scrollIntoView({ behavior: "smooth", block: "center" });
      return null;
    }
    vals.push(v);
  }

  errorMsg.textContent = "";
  return vals;
}

/* ════════════════════════════════════════════
   CALCULATE ERRORS
════════════════════════════════════════════ */
function avgAbsError(preds, actuals) {
  return preds.reduce((s, p, i) => s + Math.abs(p - actuals[i]), 0) / preds.length;
}

/* ════════════════════════════════════════════
   BUILD RESULTS
════════════════════════════════════════════ */
function buildResults() {
  const actuals = movies.map(m => m.actualScore);
  const uErr = avgAbsError(userPredictions, actuals);
  const mErr = avgAbsError(modelPredictions, actuals);

  document.getElementById("user-error").textContent = uErr.toFixed(1);
  document.getElementById("model-error").textContent = mErr.toFixed(1);

  drawChart(actuals);
}

/* ════════════════════════════════════════════
   CHART  (scatter, no connecting lines — matches design mockup)
════════════════════════════════════════════ */
function drawChart(actuals) {
  const canvas = document.getElementById("result-chart");
  const dpr = window.devicePixelRatio || 1;

  const cw = canvas.parentElement.clientWidth || 340;
  const PAD_L = 52, PAD_R = 16, PAD_T = 24, PAD_B = 64;
  const W = cw;
  const H = Math.round(W * 0.82);

  canvas.width = W * dpr;
  canvas.height = H * dpr;
  canvas.style.width = W + "px";
  canvas.style.height = H + "px";

  const ctx = canvas.getContext("2d");
  ctx.scale(dpr, dpr);

  const chartW = W - PAD_L - PAD_R;
  const chartH = H - PAD_T - PAD_B;

  /* Background */
  ctx.fillStyle = "#e8e4db";
  ctx.fillRect(0, 0, W, H);

  /* Axes */
  ctx.strokeStyle = "#0a0a0a";
  ctx.lineWidth = 2;
  ctx.setLineDash([]);

  // Y axis
  ctx.beginPath();
  ctx.moveTo(PAD_L, PAD_T);
  ctx.lineTo(PAD_L, PAD_T + chartH);
  ctx.stroke();

  // X axis
  ctx.beginPath();
  ctx.moveTo(PAD_L, PAD_T + chartH);
  ctx.lineTo(PAD_L + chartW, PAD_T + chartH);
  ctx.stroke();

  /* Y axis labels & ticks */
  const PIXEL_FONT = "16px 'Jersey 10', monospace";
  const JERSEY_FONT = "16px 'Jersey 10', sans-serif";

  ctx.fillStyle = "#0a0a0a";
  ctx.textAlign = "right";
  ctx.textBaseline = "middle";

  const yTicks = [0, 2, 4, 6, 8, 10];
  yTicks.forEach(score => {
    const y = PAD_T + chartH - (score / 10) * chartH;

    // tick
    ctx.beginPath();
    ctx.moveTo(PAD_L - 4, y);
    ctx.lineTo(PAD_L, y);
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // light grid line
    ctx.strokeStyle = "rgba(0,0,0,0.08)";
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(PAD_L, y);
    ctx.lineTo(PAD_L + chartW, y);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.strokeStyle = "#0a0a0a";

    ctx.font = PIXEL_FONT;
    ctx.fillStyle = "#0a0a0a";
    ctx.fillText(score.toFixed(1), PAD_L - 7, y);
  });

  /* Y axis title */
  ctx.save();
  ctx.translate(9, PAD_T + chartH / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.font = PIXEL_FONT;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("IMDb Scores", 0, 0);
  ctx.restore();

  /* X axis labels */
  const n = 5;
  const slotW = chartW / (n + 1); // leave half-slot padding on each side
  const getX = i => PAD_L + slotW * (i + 1);

  ctx.font = JERSEY_FONT;
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.fillStyle = "#0a0a0a";

  ORDINALS_AXIS.forEach((lbl, i) => {
    const x = getX(i);
    // tick
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x, PAD_T + chartH);
    ctx.lineTo(x, PAD_T + chartH + 4);
    ctx.stroke();
    ctx.fillText(lbl, x, PAD_T + chartH + 7);
  });

  /* X axis title */
  ctx.font = PIXEL_FONT;
  ctx.fillStyle = "#0a0a0a";
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.fillText("Movies", PAD_L + chartW / 2, PAD_T + chartH + 30);

  /* Helper */
  const scoreToY = s => PAD_T + chartH - (s / 10) * chartH;
  const SQ = 9;   // square half-size
  const CR = 6;   // circle radius

  ORDINALS_AXIS.forEach((_, i) => {
    const cx = getX(i);

    /* ── User: solid black square ── */
    const uy = scoreToY(userPredictions[i]);
    ctx.fillStyle = "#0a0a0a";
    ctx.fillRect(cx - SQ / 2, uy - SQ / 2, SQ, SQ);

    /* ── Model: hollow black square (offset right slightly) ── */
    const my = scoreToY(modelPredictions[i]);
    ctx.strokeStyle = "#0a0a0a";
    ctx.lineWidth = 2;
    ctx.strokeRect(cx - SQ / 2 + 2, my - SQ / 2 + 2, SQ, SQ);

    /* ── Actual: coral/red filled circle ── */
    const ay = scoreToY(actuals[i]);
    ctx.fillStyle = "#e87070";
    ctx.beginPath();
    ctx.arc(cx + 1, ay, CR, 0, Math.PI * 2);
    ctx.fill();

    /* Vertical connector line between user & model */
    ctx.strokeStyle = "#0a0a0a";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(cx, uy);
    ctx.lineTo(cx, my);
    ctx.stroke();
  });
}

/* ════════════════════════════════════════════
   RESET
════════════════════════════════════════════ */
function resetGame() {
  userPredictions = [];
  document.querySelectorAll(".guess-input").forEach(inp => {
    inp.value = "";
    inp.classList.remove("valid", "invalid");
  });
  if (errorMsg) errorMsg.textContent = "";
  document.getElementById("user-error").textContent = "—";
  document.getElementById("model-error").textContent = "—";
  const canvas = document.getElementById("result-chart");
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

/* ════════════════════════════════════════════
   EVENT LISTENERS
════════════════════════════════════════════ */
document.getElementById("btn-play").addEventListener("click", () => showPage(pageMovies));

document.getElementById("btn-instruction").addEventListener("click", () => {
  modalInstr.removeAttribute("hidden");
});

document.getElementById("btn-close-modal").addEventListener("click", () => {
  modalInstr.setAttribute("hidden", "");
});

modalInstr.addEventListener("click", e => {
  if (e.target === modalInstr) modalInstr.setAttribute("hidden", "");
});

document.getElementById("btn-see-results").addEventListener("click", () => {
  const preds = collectPredictions();
  if (!preds) return;
  userPredictions = preds;
  buildResults();
  showPage(pageResults);
});

document.getElementById("btn-home").addEventListener("click", () => {
  resetGame();
  showPage(pageHome);
});

/* ════════════════════════════════════════════
   INIT
════════════════════════════════════════════ */
buildMovieCards();
