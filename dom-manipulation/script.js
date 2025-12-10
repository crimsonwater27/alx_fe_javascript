// DEFAULT DATA
const DEFAULT_QUOTES = [
  { text: "Believe in yourself!", category: "Motivation" },
  { text: "The best way to predict the future is to create it.", category: "Inspiration" },
  { text: "Stay hungry, stay foolish.", category: "Success" },
  { text: "Consistency beats talent.", category: "Discipline" }
];

// CONSTANTS
const LS_KEY = "dqg_quotes_v1";
const FILTER_KEY = "dqg_selected_category";
const SESSION_KEY_LAST_INDEX = "dqg_last_viewed_index";
const SERVER_URL = "https://jsonplaceholder.typicode.com/posts";

// STATE
let quotes = [];
let selectedCategory = "all";

// DOM ELEMENTS
const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteBtn = document.getElementById("newQuote");
const formContainer = document.getElementById("formContainer");
const message = document.getElementById("message");
const exportBtn = document.getElementById("exportBtn");
const importFileInput = document.getElementById("importFile");
const clearStorageBtn = document.getElementById("clearStorage");
const categoryFilter = document.getElementById("categoryFilter");

// STORAGE FUNCTIONS
function saveQuotes() {
  localStorage.setItem(LS_KEY, JSON.stringify(quotes));
}

function loadQuotes() {
  const data = localStorage.getItem(LS_KEY);
  if (!data) {
    quotes = [...DEFAULT_QUOTES];
    saveQuotes();
  } else {
    quotes = JSON.parse(data);
  }
}

function saveLastViewedIndex(i) {
  sessionStorage.setItem(SESSION_KEY_LAST_INDEX, i);
}

function loadLastViewedIndex() {
  return parseInt(sessionStorage.getItem(SESSION_KEY_LAST_INDEX));
}

// UI MESSAGES
function showMessage(text, color = "black") {
  message.textContent = text;
  message.style.color = color;
  setTimeout(() => message.textContent = "", 4000);
}

// CATEGORY FILTERING
function populateCategories() {
  const categories = quotes.map(q => q.category);
  const unique = [...new Set(categories)];

  categoryFilter.innerHTML = "";

  const all = document.createElement("option");
  all.value = "all";
  all.textContent = "All Categories";
  categoryFilter.appendChild(all);

  unique.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    categoryFilter.appendChild(option);
  });
}

function restoreLastCategory() {
  const saved = localStorage.getItem(FILTER_KEY);
  if (saved) {
    selectedCategory = saved;
    categoryFilter.value = saved;
  }
}

function filterQuotes() {
  selectedCategory = categoryFilter.value;
  localStorage.setItem(FILTER_KEY, selectedCategory);

  const filtered =
    selectedCategory === "all"
      ? quotes
      : quotes.filter(q => q.category === selectedCategory);

  if (filtered.length === 0) {
    quoteDisplay.textContent = "No quotes in this category.";
    return;
  }

  const random = Math.floor(Math.random() * filtered.length);
  displayQuote(filtered[random], random);
}

// QUOTE DISPLAY
function displayQuote(quote, index) {
  quoteDisplay.innerHTML = "";
  const p = document.createElement("p");
  const small = document.createElement("small");

  p.textContent = quote.text;
  small.textContent = quote.category;

  quoteDisplay.appendChild(p);
  quoteDisplay.appendChild(small);

  saveLastViewedIndex(index);
}

function showRandomQuote() {
  filterQuotes();
}

// CREATE FORM
function createAddQuoteForm() {
  const formDiv = document.createElement("div");

  const quoteInput = document.createElement("input");
  quoteInput.id = "newQuoteText";
  quoteInput.placeholder = "Enter quote";

  const categoryInput = document.createElement("input");
  categoryInput.id = "newQuoteCategory";
  categoryInput.placeholder = "Enter category";

  const addBtn = document.createElement("button");
  addBtn.textContent = "Add Quote";

  addBtn.addEventListener("click", addQuote);

  formDiv.appendChild(quoteInput);
  formDiv.appendChild(categoryInput);
  formDiv.appendChild(addBtn);

  formContainer.appendChild(formDiv);
}

// ADD QUOTE
function addQuote() {
  const text = document.getElementById("newQuoteText").value.trim();
  const category = document.getElementById("newQuoteCategory").value.trim();

  if (!text || !category) {
    showMessage("Please fill both fields", "red");
    return;
  }

  quotes.push({ text, category });
  saveQuotes();
  populateCategories();
  showMessage("Quote added", "green");
}

// EXPORT & IMPORT
function exportToJsonFile(filename = "quotes.json") {
  const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
}

function importFromJsonFile(file) {
  const reader = new FileReader();
  reader.onload = e => {
    const imported = JSON.parse(e.target.result);
    imported.forEach(q => quotes.push(q));
    saveQuotes();
    populateCategories();
    showMessage("Quotes imported", "green");
  };
  reader.readAsText(file);
}

// CLEAR STORAGE
function clearLocalStorageAndReset() {
  localStorage.removeItem(LS_KEY);
  loadQuotes();
  populateCategories();
  showMessage("Reset complete", "green");
}

// SERVER SYNC
async function fetchQuotesFromServer() {
  try {
    const response = await fetch(SERVER_URL);
    const data = await response.json();

    const serverQuotes = data.slice(0, 10).map(post => ({
      text: post.title,
      category: "Server"
    }));

    syncQuotes(serverQuotes);

  } catch {
    showMessage("Server unreachable", "red");
  }
}

function syncQuotes(serverQuotes) {
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
    showMessage(`${updates} quotes synced from server.`, "blue");

    alert("Quotes synced with server!");
  } else {
    showMessage("No new server updates.", "gray");
  }
}


// POST TO SERVER
async function sendQuotesToServer() {
  try {
    await fetch(SERVER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(quotes)
    });
  } catch {
    console.log("POST failed");
  }
}

// EVENT LISTENERS
newQuoteBtn.addEventListener("click", showRandomQuote);
categoryFilter.addEventListener("change", filterQuotes);
exportBtn.addEventListener("click", exportToJsonFile);
importFileInput.addEventListener("change", e => importFromJsonFile(e.target.files[0]));
clearStorageBtn.addEventListener("click", clearLocalStorageAndReset);

// INIT
function init() {
  loadQuotes();
  createAddQuoteForm();
  populateCategories();
  restoreLastCategory();
  filterQuotes();
  fetchQuotesFromServer();
  sendQuotesToServer();
  setInterval(fetchQuotesFromServer, 30000);
}

init();

