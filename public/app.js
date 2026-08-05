const form = document.getElementById("cv-form");
const fileInput = document.getElementById("file-input");
const dropzone = document.getElementById("dropzone");
const dropzoneText = document.getElementById("dropzone-text");
const submitBtn = document.getElementById("submit-btn");
const statusEl = document.getElementById("status");
const errorEl = document.getElementById("error");
const resultEl = document.getElementById("result");
const docxLink = document.getElementById("docx-link");
const pdfLink = document.getElementById("pdf-link");

let selectedFile = null;

dropzone.addEventListener("click", () => fileInput.click());

["dragover", "dragenter"].forEach((evt) =>
  dropzone.addEventListener(evt, (e) => {
    e.preventDefault();
    dropzone.classList.add("dragover");
  })
);
["dragleave", "drop"].forEach((evt) =>
  dropzone.addEventListener(evt, (e) => {
    e.preventDefault();
    dropzone.classList.remove("dragover");
  })
);
dropzone.addEventListener("drop", (e) => {
  const file = e.dataTransfer.files[0];
  if (file) setFile(file);
});
fileInput.addEventListener("change", () => {
  if (fileInput.files[0]) setFile(fileInput.files[0]);
});

function setFile(file) {
  selectedFile = file;
  dropzoneText.textContent = file.name;
  submitBtn.disabled = false;
}

function setStatus(message) {
  statusEl.textContent = message || "";
}

function setError(message) {
  errorEl.textContent = message || "";
  errorEl.style.display = message ? "block" : "none";
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!selectedFile) return;

  resultEl.classList.remove("ok");
  setError("");
  submitBtn.disabled = true;
  setStatus("Procesando CV, puede tardar unos segundos…");

  try {
    const formData = new FormData();
    formData.append("cv", selectedFile);

    const res = await fetch("/api/process-cv", { method: "POST", body: formData });
    const payload = await res.json();

    if (!res.ok) {
      throw new Error(payload.error || "Error procesando el CV.");
    }

    docxLink.href = payload.docxUrl;
    pdfLink.href = payload.pdfUrl;
    resultEl.classList.add("ok");
    setStatus("");
  } catch (err) {
    setError(err.message);
    setStatus("");
  } finally {
    submitBtn.disabled = false;
  }
});
