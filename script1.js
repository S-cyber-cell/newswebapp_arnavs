const API_URL = "http://localhost:8000/check_fake"; // FastAPI endpoint

window.addEventListener("load", () => fetchNews("latest"));
document.getElementById("search-button").addEventListener("click", () => {
  const query = document.getElementById("search-text").value;
  fetchNews(query);
});

function onNavItemClick(topic) {
  fetchNews(topic);
}

async function fetchNews(query) {
  const url = `https://newsapi.org/v2/everything?q=${query}&apiKey=YOUR_NEWS_API_KEY`;
  const res = await fetch(url);
  const data = await res.json();
  bindData(data.articles);
}

function bindData(articles) {
  const cardsContainer = document.getElementById("cards-container");
  const template = document.getElementById("template-news-card");

  cardsContainer.innerHTML = "";

  articles.forEach((article) => {
    if (!article.urlToImage) return;

    const cardClone = template.content.cloneNode(true);
    fillDataInCard(cardClone, article);
    cardsContainer.appendChild(cardClone);
  });
}

function fillDataInCard(cardClone, article) {
  const newsImg = cardClone.getElementById("news-img");
  const newsTitle = cardClone.getElementById("news-title");
  const newsSource = cardClone.getElementById("news-source");
  const newsDesc = cardClone.getElementById("news-desc");
  const fakeButton = cardClone.querySelector(".check-fake-button");

  newsImg.src = article.urlToImage;
  newsTitle.textContent = article.title;
  newsDesc.textContent = article.description || "No description available";

  const date = new Date(article.publishedAt).toLocaleString("en-US", {
    timeZone: "Asia/Kolkata",
  });
  newsSource.textContent = `${article.source.name} · ${date}`;

  fakeButton.addEventListener("click", () => {
    checkIfFake(article.title + " " + (article.description || ""));
  });
}

async function checkIfFake(text) {
  document.getElementById("geminiResultText").textContent = "Checking...";
  document.getElementById("geminiModal").style.display = "block";

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text }),
    });

    const result = await response.json();
    document.getElementById("geminiResultText").textContent = result.result;
  } catch (error) {
    console.error("Error checking fake news:", error);
    document.getElementById("geminiResultText").textContent =
      "Error while checking. Please try again.";
  }
}
// Add event listener for the 'Check if Fake' button
document.querySelectorAll('.check-fake-button').forEach(button => {
  button.addEventListener('click', function () {
    let newsContent = this.closest('.card').querySelector('.news-desc').textContent;

    // Send request to Flask backend
    fetch('/predict', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        'message': newsContent
      })
    })
    .then(response => response.text())
    .then(data => {
      // Parse and display the prediction in the UI
      document.getElementById('prediction-result').textContent = data;
    })
    .catch(error => console.error('Error:', error));
  });
});
