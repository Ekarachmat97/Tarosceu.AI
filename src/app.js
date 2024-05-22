// Fungsi untuk memuat konfigurasi dari config.json
async function loadConfig() {
  const response = await fetch("config.json");
  if (!response.ok) {
    throw new Error("Failed to load config");
  }
  const config = await response.json();
  return config;
}

async function sendMessage() {
  var userInput = document.getElementById("userInput").value.trim();

  if (userInput === "") {
    return;
  }

  var chatbox = document.getElementById("chatbox");

  // Tambahkan pesan pengguna ke chatbox
  var userMessage = document.createElement("p");
  userMessage.textContent = "Saya: " + userInput;
  userMessage.classList.add("user-message");
  chatbox.appendChild(userMessage);

  try {
    // Panggil API Deefinfra untuk mendapatkan balasan
    var response = await callDeepInfra(userInput);

    if (response && response.choices && response.choices[0].message) {
      var botMessage = document.createElement("div");
      botMessage.classList.add("bot-message");
      botMessage.innerHTML = renderMessage(response.choices[0].message.content);

      // ikon salin
      var copyIcon = document.createElement("i");
      copyIcon.classList.add("fas", "fa-copy", "copy-icon");
      copyIcon.title = "Copy";
      copyIcon.onclick = function () {
        copyToClipboard(response.choices[0].message.content);
      };

      botMessage.appendChild(copyIcon);
      chatbox.appendChild(botMessage);

      // Render code syntax highlighting
      document.querySelectorAll("pre code").forEach((block) => {
        hljs.highlightBlock(block);
      });

      // Render LaTeX
      renderMathInElement(botMessage, {
        delimiters: [
          { left: "$$", right: "$$", display: true },
          { left: "$", right: "$", display: false },
        ],
      });
    } else {
      throw new Error("Invalid response from API.");
    }
  } catch (error) {
    console.error("Error:", error.message);

    // pesan error ke chatbox
    var errorMessage = document.createElement("p");
    errorMessage.textContent = "Error: Failed to connect to the API.";
    chatbox.appendChild(errorMessage);
  }

  document.getElementById("userInput").value = "";
}

// Fungsi untuk memanggil API Deefinfra
async function callDeepInfra(userInput) {
  const config = await loadConfig();
  const apiKey = config.apiKey;
  const apiUrl = "https://api.deepinfra.com/v1/openai/chat/completions";

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "meta-llama/Meta-Llama-3-70B-Instruct",
      messages: [{ role: "user", content: userInput }],
    }),
  });

  if (!response.ok) {
    throw new Error("Network response was not ok");
  }

  const data = await response.json();
  return data;
}

// Fungsi untuk merender pesan
function renderMessage(content) {
  if (content.includes("```")) {
    // Format konten dengan code block
    const codeContent = content.split("```")[1];
    return `<pre><code>${codeContent}</code></pre>`;
  } else if (content.includes("$")) {
    // Format konten dengan LaTeX
    return `<div>${content}</div>`;
  } else {
    // Format biasa
    return `<p>${content}</p>`;
  }
}

// Fungsi untuk menyalin teks ke clipboard
function copyToClipboard(text) {
  navigator.clipboard
    .writeText(text)
    .then(() => {
      alert("Text copied to clipboard");
    })
    .catch((err) => {
      console.error("Error copying text: ", err);
    });
}

// Event listener untuk mengirim pesan dengan menekan Enter
document
  .getElementById("userInput")
  .addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
      sendMessage();
    }
  });
