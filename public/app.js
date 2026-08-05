const form = document.getElementById("cv-form");
const fileInput = document.getElementById("file-input");
const dropzone = document.getElementById("dropzone");
const dropzoneText = document.getElementById("dropzone-text");
const submitBtn = document.getElementById("submit-btn");
const statusEl = document.getElementById("status");
const resultsEl = document.getElementById("results");
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

function setStatus(message, isError = false) {
  statusEl.hidden = !message;
  statusEl.textContent = message;
  statusEl.classList.toggle("error", isError);
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!selectedFile) return;

  resultsEl.hidden = true;
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
    resultsEl.hidden = false;
    setStatus("");
  } catch (err) {
    setStatus(err.message, true);
  } finally {
    submitBtn.disabled = false;
  }
});
