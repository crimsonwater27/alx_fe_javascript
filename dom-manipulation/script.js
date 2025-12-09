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
const addQuoteBtn = document.getElementById("addQuoteBtn");
const message = document.getElementById("message");

//Show Random Quote
function showRandomQuote() {
    const randomIndex =Math.floor(Math.random() *quoteslength);
    const selectedQuote = quotes[randomIndex];

    quoteDisplay.innerHTML = `
    <p>"${selectedQuote.text}"</p>
    <small>Category: ${selectedQuote.category}</small>
    `;
}

//Add New Quote
function addQuote() {
    const quoteText = document.getElementById("newQuoteText").value.trim();
    const quoteCategory = document.getElementById("newQuoteCategory").value.trim();

    if (quoteText === "" || quoteCategory === ""){
        message.textContent = "Please fill in both fields.";
        message.style.color = "red";
        return;
    }

    const newQuote = {
        text: quoteText,
        category: quoteCategory
    };

    quotes.push(newQuote);
    message.textContent = "Quote added successfully!";
    message.style.color = "green";

    document.getElementById("newQuoteText").value = "";
    document.getElementById("newQuoteCategory").value = "";
}

// Event Listeners
newQuoteBtn.addEventListener("click", showRandomQuote);
addQuoteBtn.addEventListener("click", addQuote);

//Display first quote on load
showRandomQuote();