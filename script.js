const startBtn = document.getElementById("start-btn");
const stopBtn = document.getElementById("stop-btn");
const outputText = document.getElementById("output-text");
const statusText = document.getElementById("status-text");
const actions = document.getElementById("actions");
const saveBtn = document.getElementById("save-btn");
const deleteBtn = document.getElementById("delete-btn");
const copyBtn = document.getElementById("copy-btn");
const languageSelect = document.getElementById("language");

let recognition;

if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US"; // Default language for speech input

    recognition.onstart = () => {
        document.body.classList.add("recording");
        document.body.classList.remove("stopped");
        startBtn.disabled = true;
        stopBtn.disabled = false;
        statusText.innerHTML = "Listening...";
        outputText.innerHTML = "";
        actions.classList.add("hidden");
    };

    recognition.onresult = async (event) => {
        let transcript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript;
        }
        
        // Translate if necessary
        const selectedLanguage = languageSelect.value;
        if (selectedLanguage !== "en") {
            transcript = await translateText(transcript, selectedLanguage);
        }
        
        outputText.innerHTML = transcript;
    };

    recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
    };

    recognition.onend = () => {
        document.body.classList.remove("recording");
        document.body.classList.add("stopped");
        startBtn.disabled = false;
        stopBtn.disabled = true;
        statusText.innerHTML = "Stopped.";
        if (outputText.innerHTML.trim() !== "") {
            actions.classList.remove("hidden");
        }
    };

} else {
    alert("Speech recognition is not supported in your browser.");
}

startBtn.addEventListener("click", () => {
    recognition.start();
});

stopBtn.addEventListener("click", () => {
    recognition.stop();
});

// Save function (Downloads text as a file)
saveBtn.addEventListener("click", () => {
    const blob = new Blob([outputText.innerHTML], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "transcription.txt";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
});

// Delete function (Clears the text)
deleteBtn.addEventListener("click", () => {
    outputText.innerHTML = "Your transcribed text will appear here...";
    actions.classList.add("hidden");
});

// Copy function (Copies text to clipboard)
copyBtn.addEventListener("click", () => {
    navigator.clipboard.writeText(outputText.innerHTML).then(() => {
        alert("Text copied to clipboard!");
    }).catch(err => {
        console.error("Failed to copy text: ", err);
    });
});

// Translation function using Google Translate API
async function translateText(text, targetLanguage) {
    const apiKey = "YOUR_GOOGLE_TRANSLATE_API_KEY"; // Replace with your API key
    const url = `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`;

    const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            q: text,
            target: targetLanguage
        })
    });

    const data = await response.json();
    return data.data.translations[0].translatedText;
}
