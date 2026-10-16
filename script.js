const form = document.getElementById("searchForm");
const urlInput = document.getElementById("urlInput");
const resultsSection = document.getElementById("resultsSection");
const thumbnailGrid = document.getElementById("thumbnailGrid");
const errorBox = document.getElementById("errorBox");
const copyIdButton = document.getElementById("copyIdButton");

let currentVideoId = "";

const variants = [
  { key: "maxresdefault", label: "Máxima resolución", expected: "1280×720 aprox." },
  { key: "sddefault", label: "SD", expected: "640×480 aprox." },
  { key: "hqdefault", label: "Alta calidad", expected: "480×360" },
  { key: "mqdefault", label: "Calidad media", expected: "320×180" },
  { key: "default", label: "Básica", expected: "120×90" }
];

function extractVideoId(value) {
  const raw = value.trim();

  if (/^[a-zA-Z0-9_-]{11}$/.test(raw)) return raw;

  try {
    const url = new URL(raw);
    const host = url.hostname.replace(/^www\./, "");

    if (host === "youtu.be") {
      return url.pathname.split("/").filter(Boolean)[0] || null;
    }

    if (
      host === "youtube.com" ||
      host === "m.youtube.com" ||
      host === "music.youtube.com"
    ) {
      if (url.pathname === "/watch") return url.searchParams.get("v");

      const parts = url.pathname.split("/").filter(Boolean);
      if (["shorts", "embed", "live"].includes(parts[0])) return parts[1] || null;
    }
  } catch (_) {}

  const match = raw.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/|live\/))([a-zA-Z0-9_-]{11})/
  );
  return match?.[1] || null;
}

function imageInfo(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      resolve({
        ok: true,
        width: img.naturalWidth,
        height: img.naturalHeight
      });
    };
    img.onerror = () => resolve({ ok: false, width: 0, height: 0 });
    img.src = `${src}?t=${Date.now()}`;
  });
}

function showError(message) {
  errorBox.textContent = message;
  errorBox.classList.remove("hidden");
  resultsSection.classList.add("hidden");
}

function hideError() {
  errorBox.classList.add("hidden");
}

async function downloadImage(url, filename) {
  try {
    const response = await fetch(url, { mode: "cors" });
    if (!response.ok) throw new Error("No se pudo descargar");

    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = objectUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(objectUrl);
  } catch (_) {
    window.open(url, "_blank", "noopener,noreferrer");
  }
}

function createCard({ variant, src, info }) {
  const card = document.createElement("article");
  card.className = "thumb-card";

  const size =
    info.width && info.height
      ? `${info.width}×${info.height}`
      : variant.expected;

  card.innerHTML = `
    <div class="preview-wrap">
      <img src="${src}" alt="Miniatura ${variant.label}" loading="lazy" />
      <span class="quality-pill">${variant.label}</span>
    </div>
    <div class="thumb-body">
      <div class="meta-row">
        <span>${variant.key}.jpg</span>
        <span>${size}</span>
      </div>
      <div class="thumb-actions">
        <a class="action-link" href="${src}" target="_blank" rel="noopener noreferrer">Abrir</a>
        <button class="download-button" type="button">Descargar</button>
      </div>
    </div>
  `;

  card.querySelector(".download-button").addEventListener("click", () => {
    downloadImage(src, `${currentVideoId}-${variant.key}.jpg`);
  });

  return card;
}

async function renderThumbnails(videoId) {
  currentVideoId = videoId;
  hideError();
  thumbnailGrid.innerHTML = "";

  const checks = await Promise.all(
    variants.map(async (variant) => {
      const src = `https://i.ytimg.com/vi/${videoId}/${variant.key}.jpg`;
      const info = await imageInfo(src);
      return { variant, src, info };
    })
  );

  const available = checks.filter(
    (item) =>
      item.info.ok &&
      item.info.width >= 120 &&
      item.info.height >= 90 &&
      !(item.variant.key === "maxresdefault" && item.info.width <= 120)
  );

  if (!available.length) {
    showError("No pude encontrar miniaturas para ese video. Revisa que la URL sea correcta y que el video exista.");
    return;
  }

  available.forEach((item) => thumbnailGrid.appendChild(createCard(item)));
  resultsSection.classList.remove("hidden");
  resultsSection.scrollIntoView({ behavior: "smooth", block: "start" });
}

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const videoId = extractVideoId(urlInput.value);

  if (!videoId || !/^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
    showError("No reconozco esa URL de YouTube. Prueba con un enlace normal, un Short o un enlace youtu.be.");
    return;
  }

  renderThumbnails(videoId);
});

copyIdButton.addEventListener("click", async () => {
  if (!currentVideoId) return;

  try {
    await navigator.clipboard.writeText(currentVideoId);
    const oldText = copyIdButton.textContent;
    copyIdButton.textContent = "Copiado ✓";
    setTimeout(() => (copyIdButton.textContent = oldText), 1400);
  } catch (_) {
    copyIdButton.textContent = currentVideoId;
  }
});

const params = new URLSearchParams(window.location.search);
const initialUrl = params.get("url");
if (initialUrl) {
  urlInput.value = initialUrl;
  const videoId = extractVideoId(initialUrl);
  if (videoId) renderThumbnails(videoId);
}
