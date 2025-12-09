//Quote Data
let quotes = [
    {text: "Believe in yourself!", category: "Motivation" },
    {text: "The best way to predict  the future is to create it.", category: "inspitration" },
    {text: "Stay hungry, stay foolish.", category: "success" },
    {text: "Consistency beats talent.", category: "Decipline" }
];

//Dom Elements
const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteBtn = document.getElementById("newQuote");
const addQuoteBtn = document.getElementById("formContainer");
const message = document.getElementById("message");

//Show Random Quote
function showRandomQuote() {
    const randomIndex = Math.floor(Math.random() * quotes.length);
    const selectedQuote = quotes[randomIndex];

    quoteDisplay.innerHTML = `
    <p>"${selectedQuote.text}"</p>
    <small>Category: ${selectedQuote.category}</small>
    `;
}

// create Add quote Form
function createAddQuoteForm() {

  const formDiv = document.createElement("div");

  const quoteInput = document.createElement("input");
  quoteInput.type = "text";
  quoteInput.placeholder = "Enter a new quote";
  quoteInput.id = "newQuoteText";

  const categoryInput = document.createElement("input");
  categoryInput.type = "text";
  categoryInput.placeholder = "Enter quote category";
  categoryInput.id = "newQuoteCategory";

  const addBtn = document.createElement("button");
  addBtn.textContent = "Add Quote";

  addBtn.addEventListener("click", addQuote);

  formDiv.appendChild(quoteInput);
  formDiv.appendChild(categoryInput);
  formDiv.appendChild(addBtn);

  formContainer.appendChild(formDiv);
}

// Add Quote Array + Update DOM
function addQuote() {
  const quoteText = document.getElementById("newQuoteText").value.trim();
  const quoteCategory = document.getElementById("newQuoteCategory").value.trim();

  if (quoteText === "" || quoteCategory === "") {
    message.textContent = "Please fill in both fields.";
    message.style.color = "red";
    return;
  }

  const newQuote = { text: quoteText, category: quoteCategory };
  quotes.push(newQuote);

  message.textContent = "Quote added successfully!";
  message.style.color = "green";

  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";
}

// Event Listeners
newQuoteBtn.addEventListener("click", showRandomQuote);

//Initialize App
createAddQuoteForm();
showRandomQuote();
