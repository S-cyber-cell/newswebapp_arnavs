const API_KEY = "d7f66e2e9d2441d5a00d5cad1b22dc8c";
const url = "https://newsapi.org/v2/everything?q=";

window.addEventListener("load", () => {
    if (!localStorage.getItem("preferences")) {
        document.getElementById("preferences-modal").style.display = "flex";
        fetchNews("India"); // Default while waiting
    } else {
        const prefs = JSON.parse(localStorage.getItem("preferences"));
        fetchPersonalizedNews(prefs);
    }
});

function reload() {
    window.location.reload();
}

async function fetchNews(query, isPersonalized = false) {
    const res = await fetch(`${url}${query}&apiKey=${API_KEY}`);
    const data = await res.json();
    if (isPersonalized) {
        displayPersonalizedNews(data.articles);
    } else {
        bindData(data.articles);
    }
}

function bindData(articles) {
    const cardsContainer = document.getElementById("cards-container");
    const newsCardTemplate = document.getElementById("template-news-card");

    cardsContainer.innerHTML = "";

    articles.forEach((article) => {
        if (!article.urlToImage) return;
        const cardClone = newsCardTemplate.content.cloneNode(true);
        fillDataInCard(cardClone, article);
        cardsContainer.appendChild(cardClone);
    });

    setupGeminiPrediction(); // Make sure buttons work after rendering
}
function fillDataInCard(cardClone, article) {
    const newsImg = cardClone.querySelector("#news-img");
    const newsTitle = cardClone.querySelector("#news-title");
    const newsSource = cardClone.querySelector("#news-source");
    const newsDesc = cardClone.querySelector("#news-desc");

    newsImg.src = article.urlToImage;
    newsTitle.innerHTML = article.title;
    newsDesc.innerHTML = article.description;

    const date = new Date(article.publishedAt).toLocaleString("en-US", {
        timeZone: "Asia/Jakarta",
    });

    newsSource.innerHTML = `${article.source.name} · ${date}`;

    // Add Check Fake button
    const button = document.createElement("button");
    button.className = "check-fake-button";
    button.textContent = "Check if Fake";
    cardClone.querySelector(".card").appendChild(button);

    // Add Prediction Result text
    const result = document.createElement("p");
    result.className = "prediction-result";
    result.style.fontWeight = "bold";
    result.style.color = "#2294ed";
    cardClone.querySelector(".card").appendChild(result);

    // Add click event to open article
    cardClone.firstElementChild.addEventListener("click", () => {
        window.open(article.url, "_blank");
    });
}

function fillDataInCard(cardClone, article) {
    const newsImg = cardClone.querySelector("#news-img");
    const newsTitle = cardClone.querySelector("#news-title");
    const newsSource = cardClone.querySelector("#news-source");
    const newsDesc = cardClone.querySelector("#news-desc");

    newsImg.src = article.urlToImage;
    newsTitle.innerHTML = article.title;
    newsDesc.innerHTML = article.description;

    const date = new Date(article.publishedAt).toLocaleString("en-US", {
        timeZone: "Asia/Jakarta",
    });

    newsSource.innerHTML = `${article.source.name} · ${date}`;

    // Add Check Fake button
    const button = document.createElement("button");
    button.className = "check-fake-button";
    button.textContent = "Check if Fake";
    cardClone.querySelector(".card").appendChild(button);

    // Add Prediction Result text
    const result = document.createElement("p");
    result.className = "prediction-result";
    result.style.fontWeight = "bold";
    result.style.color = "#2294ed";
    cardClone.querySelector(".card").appendChild(result);

    // Add click event to open article
    cardClone.firstElementChild.addEventListener("click", () => {
        window.open(article.url, "_blank");
    });
}


let curSelectedNav = null;
function onNavItemClick(id) {
    fetchNews(id);
    const navItem = document.getElementById(id);
    curSelectedNav?.classList.remove("active");
    curSelectedNav = navItem;
    curSelectedNav.classList.add("active");
}
window.onNavItemClick = onNavItemClick;

const searchButton = document.getElementById("search-button");
const searchText = document.getElementById("search-text");

searchButton.addEventListener("click", () => {
    const query = searchText.value;
    if (!query) return;
    fetchNews(query);
    curSelectedNav?.classList.remove("active");
    curSelectedNav = null;
});

const checkbox = document.getElementById("checkbox");
checkbox.addEventListener("change", () => {
    document.body.classList.toggle("dark");
});

// 🔥 Preferences Modal Logic
document.getElementById("preferences-form").addEventListener("submit", function (e) {
    e.preventDefault();
    const selectedPrefs = Array.from(document.querySelectorAll("input[name='interest']:checked"))
                               .map(input => input.value);
    localStorage.setItem("preferences", JSON.stringify(selectedPrefs));
    document.getElementById("preferences-modal").style.display = "none";
    fetchPersonalizedNews(selectedPrefs);
});

function fetchPersonalizedNews(prefs) {
    const query = prefs.join(" OR ");
    fetchNews(query, true);
}

function displayPersonalizedNews(articles) {
    const container = document.getElementById("cards-container");
    const section = document.createElement("div");
    const heading = document.createElement("h2");
    heading.innerText = "🧠 Recommended For You";
    section.appendChild(heading);

    articles.slice(0, 4).forEach(article => {
        if (!article.urlToImage) return;
        const card = document.getElementById("template-news-card").content.cloneNode(true);
        fillDataInCard(card, article);
        section.appendChild(card);
    });

    container.prepend(section);
}

function setupGeminiPrediction() {
    document.querySelectorAll('.check-fake-button').forEach(button => {
        button.addEventListener('click', function (event) {
            event.stopPropagation();

            const newsContent = this.closest('.card').querySelector('.news-desc').textContent;

            fetch("http://localhost:5004/predict", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ message: newsContent })
            })
            .then(response => response.json())
            .then(data => {
                const prediction = data.prediction || "No prediction";
                this.closest('.card').querySelector('.prediction-result').textContent = `Prediction: ${prediction}`;
            })
            .catch(error => {
                console.error("Error:", error);
                this.closest('.card').querySelector('.prediction-result').textContent = "Prediction failed";
            });
        });
    });
}
    