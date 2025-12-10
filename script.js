//Quote Data
const DEFAULT_QUOTES = [
    {text: "Believe in yourself!", category: "Motivation" },
    {text: "The best way to predict  the future is to create it.", category: "inspitration" },
    {text: "Stay hungry, stay foolish.", category: "success" },
    {text: "Consistency beats talent.", category: "Decipline" }
];

let selectedCategory ="all";
const SERVER_URL = "https://jsonplaceholder.typicode.com/posts";


function populateCategories() {

  const categoryList = quotes.map(quote => quote.category);

  const uniqueCategories = [...new Set(categoryList)];

  categoryFilter.innerHTML = "";

  const allOption = document.createElement("option");
  allOption.value = "all";
  allOption.textContent = "All Categories";
  categoryFilter.appendChild(allOption);

  uniqueCategories.forEach(category => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    categoryFilter.appendChild(option);
  });

  function restoreLastCategory() {
  const savedCategory = localStorage.getItem(FILTER_KEY);
  if (savedCategory) {
    selectedCategory = savedCategory;   // ✅
    categoryFilter.value = savedCategory;
  }
}

}

async function fetchQuotesFromServer() {
  try {
    const response = await fetch(SERVER_URL);
    const data = await response.json();

    // Convert API posts into "quotes"
    const serverQuotes = data.slice(0, 10).map(item => ({
      text: item.title,
      category: "Server"
    }));

    syncWithServer(serverQuotes);

  } catch (error) {
    console.error("Server fetch failed:", error);
    showMessage("Server unreachable.", "red");
  }
}

async function sendQuotesToServer() {
  try {
    const response = await fetch(SERVER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(quotes)
    });

    const result = await response.json();

    console.log("Server response:", result);
    showMessage("Quotes sent to server successfully.", "green");

  } catch (error) {
    console.error("POST failed:", error);
    showMessage("Failed to send quotes to server.", "red");
  }
}


async function forceServerOverwrite() {
  const response = await fetch(SERVER_URL);
  const data = await response.json();

  quotes = data.slice(0, 10).map(item => ({
    text: item.title,
    category: "Server"
  }));

  saveQuotes();
  populateCategories();
  filterQuotes();
  showMessage("Local data replaced with server data.", "orange");
}

function syncWithServer(serverQuotes) {

  let updates = 0;

  serverQuotes.forEach(serverQuote => {

    const exists = quotes.some(localQuote =>
      localQuote.text === serverQuote.text
    );

    if (!exists) {
      quotes.push(serverQuote);
      updates++;
    }

  });

  if (updates > 0) {
    saveQuotes();
    populateCategories();
    filterQuotes();
    showMessage(updates + " quotes synced from server.", "blue");
  } else {
    showMessage("No new server updates.", "gray");
  }

}

//Storage keys
const LS_KEY = "dqg_quotes_v1";
const SESSION_KEY_LAST_INDEX = "dqg_last_viewed_index";

//state
let quotes = [];

//Dom Elements
const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteBtn = document.getElementById("newQuote");
const formContainer = document.getElementById("formContainer");
const message = document.getElementById("message");
const exportBtn = document.getElementById("exportBtn");
const importFileInput = document.getElementById("importFile");
const clearStorageBtn = document.getElementById("clearStorage");

//Pesistance
function saveQuotes() {
  try{
    localStorage.setItem(LS_KEY,JSON.stringify(quotes));
    showMessage("Quotes saved to local storage.", "green");
  } catch (e) {
    console.error("Failed saving to localStorage:",e);
    showMessage("Error: failed to save to localStorage.", "red");
  }
}

function loadQuotes() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) {
      quotes = [...DEFAULT_QUOTES];
      saveQuotes(); // initialize storage
      return;
    }
    const parsed = JSON.parse(raw);
    // validate shape
    if (Array.isArray(parsed) && parsed.every(isQuoteObject)) {
      quotes = parsed;
    } else {
      // data malformed -> reset to defaults
      console.warn("localStorage data malformed. Resetting to defaults.");
      quotes = [...DEFAULT_QUOTES];
      saveQuotes();
    }
  } catch (e) {
    console.error("Failed loading localStorage:", e);
    quotes = [...DEFAULT_QUOTES];
    saveQuotes();
  }
}

// session storage for last viewed quote index (temporary per tab)
function saveLastViewedIndex(idx) {
  try {
    sessionStorage.setItem(SESSION_KEY_LAST_INDEX, String(idx));
  } catch (e) {
    // ignore
  }
}
function loadLastViewedIndex() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY_LAST_INDEX);
    const idx = raw === null ? null : parseInt(raw, 10);
    if (Number.isInteger(idx) && idx >= 0 && idx < quotes.length) return idx;
    return null;
  } catch {
    return null;
  }
}

//Validation utility
function isQuoteObject(obj) {
  return obj && typeof obj === "object"
    && typeof obj.text === "string"
    && typeof obj.category === "string";
}

//UI helpers
function showMessage(txt, color = "#333") {
  message.textContent = txt;
  message.style.color = color;
  // auto-clear after 4s
  clearTimeout(showMessage._t);
  showMessage._t = setTimeout(() => {
    if (message.textContent === txt) message.textContent = "";
  }, 4000);
}

function renderQuote(quote, index = null) {
  // clear and show nicely
  quoteDisplay.innerHTML = "";
  const p = document.createElement("p");
  p.textContent = quote.text;
  const small = document.createElement("small");
  small.textContent = `Category: ${quote.category}`;
  small.className = "small";

  quoteDisplay.appendChild(p);
  quoteDisplay.appendChild(small);

  if (index !== null) saveLastViewedIndex(index);
}

//Show Random Quote
function showRandomQuote() {
  if (!Array.isArray(quotes) || quotes.length === 0) {
    quoteDisplay.textContent = "No quotes available.";
    return;
  }

  // if session has last index, show next (demo of sessionStorage usage)
  const last = loadLastViewedIndex();
  let idx;
  if (last === null) {
    idx = Math.floor(Math.random() * quotes.length);
  } else {
    // show a different random index if possible, else same
    if (quotes.length === 1) idx = 0;
    else {
      do {
        idx = Math.floor(Math.random() * quotes.length);
      } while (idx === last && quotes.length > 1);
    }
  }

  renderQuote(quotes[idx], idx);
}

// create Add quote Form
function createAddQuoteForm() {
  const formDiv = document.createElement("div");

  const quoteInput = document.createElement("input");
  quoteInput.setAttribute("type", "text");
  quoteInput.setAttribute("id", "newQuoteText");
  quoteInput.setAttribute("placeholder", "Enter a new quote");

  const categoryInput = document.createElement("input");
  categoryInput.setAttribute("type", "text");
  categoryInput.setAttribute("id", "newQuoteCategory");
  categoryInput.setAttribute("placeholder", "Enter quote category");

  const addBtn = document.createElement("button");
  addBtn.textContent = "Add Quote";

  populateCategories();
  function filterQuotes() {
  selectedCategory = categoryFilter.value;
  localStorage.setItem(FILTER_KEY, selectedCategory);

  const filteredQuotes =
    selectedCategory === "all"
      ? quotes
      : quotes.filter(quote => quote.category === selectedCategory);

  if (filteredQuotes.length === 0) {
    quoteDisplay.textContent = "No quotes for this category.";
    return;
  }

  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  const quote = filteredQuotes[randomIndex];

  quoteDisplay.innerHTML = `"${quote.text}"<br><small>${quote.category}</small>`;
}


  // click handler
  addBtn.addEventListener("click", function (ev) {
    ev.preventDefault();
    addQuote();
  });

  // Append nodes (explicit appendChild usage)
  formDiv.appendChild(quoteInput);
  formDiv.appendChild(categoryInput);
  formDiv.appendChild(addBtn);

  // small hint text
  const hint = document.createElement("div");
  hint.className = "small";
  hint.textContent = "Quotes must include text and a category.";

  formContainer.appendChild(formDiv);
  formContainer.appendChild(hint);
}

// Add Quote to data and persist
function addQuote() {
  const textEl = document.getElementById("newQuoteText");
  const catEl = document.getElementById("newQuoteCategory");
  const text = textEl.value.trim();
  const category = catEl.value.trim();

  if (!text || !category) {
    showMessage("Please fill both fields.", "red");
    return;
  }

  const newQ = { text, category };
  quotes.push(newQ);
  saveQuotes();
  showMessage("Quote added & saved.", "green");

  // clear inputs
  textEl.value = "";
  catEl.value = "";
}

//Export quotes
function exportToJsonFile(filename = "quotes.json") {
  try {
    const json = JSON.stringify(quotes, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    // create a temporary link and click it
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();

    // cleanup
    setTimeout(() => {
      URL.revokeObjectURL(url);
      document.body.removeChild(a);
    }, 100);

    showMessage("Export started (download).", "green");
  } catch (e) {
    console.error(e);
    showMessage("Export failed.", "red");
  }
}

//Import from JSON file
function importFromJsonFile(file) {
  if (!file) return showMessage("No file selected.", "red");

  const reader = new FileReader();
  reader.onload = function (evt) {
    try {
      const parsed = JSON.parse(evt.target.result);
      if (!Array.isArray(parsed)) {
        showMessage("Imported JSON must be an array of quotes.", "red");
        return;
      }

      // Validate each item
      const valid = parsed.filter(isQuoteObject);
      if (valid.length === 0) {
        showMessage("No valid quote objects found in file.", "red");
        return;
      }

      // Merge: push only valid ones (simple dedupe could be added)
      quotes.push(...valid);
      saveQuotes();
      showMessage(`Imported ${valid.length} quotes.`, "green");
      // show the last imported quote
      renderQuote(valid[valid.length - 1], quotes.length - 1);
    } catch (err) {
      console.error("Import error:", err);
      showMessage("Failed to parse JSON file.", "red");
    }
  };
  reader.onerror = function () {
    showMessage("Could not read file.", "red");
  };
  reader.readAsText(file);
}

// -----------------------------
// Utility: clear local storage (and reset to defaults)
// -----------------------------
function clearLocalStorageAndReset() {
  if (!confirm("Clear saved quotes in localStorage and reset to defaults?")) return;
  localStorage.removeItem(LS_KEY);
  loadQuotes();
  showMessage("localStorage cleared, reset to defaults.", "green");
  showRandomQuote();
}

//Event wiring
newQuoteBtn.addEventListener("click", showRandomQuote);
exportBtn.addEventListener("click", () => exportToJsonFile("quotes_export.json"));
importFileInput.addEventListener("change", (ev) => {
  const file = ev.target.files && ev.target.files[0];
  if (file) importFromJsonFile(file);
  // reset input so same file can be re-imported if needed
  ev.target.value = "";
});
clearStorageBtn.addEventListener("click", clearLocalStorageAndReset);

//Initialize App
function init() {
  loadQuotes();
  createAddQuoteForm();
  populateCategories();
  restoreLastCategory();
  filterQuotes();
  fetchQuotesFromServer();

  // show last viewed if available, else show random one
  const lastIndex = loadLastViewedIndex();
  if (Number.isInteger(lastIndex)) {
    renderQuote(quotes[lastIndex], lastIndex);
  } else {
    showRandomQuote();
  }
}

// run
init();

// Auto-sync every 30 seconds
setInterval(fetchQuotesFromServer, 30000);
sendQuotesToServer();

