import "./style.css";

const btnRecord = document.getElementById("btn_record");
const uListChat = document.getElementById("ulist_chat");

/** @param {number} t  */
async function sleep(t = 2000) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve();
    }, t);
  });
}

function ensureBrowserHasSpeechAPI() {
  if (
    !("webkitSpeechRecognition" in window) &&
    !("SpeechRecognition" in window)
  ) {
    btnRecord.style.display = "none";

    return alert(
      "This browser does not have the features required for this demo. Use Google Chrome >= v33"
    );
  }

  start();
}

function toggleRecording(config, listener) {
  if (config.isListening) {
    config.isListening = false;
    btnRecord.innerText = "Start recording";
    return listener.stop();
  }

  config.isListening = true;
  btnRecord.innerText = "Stop recording";
  return listener.start();
}

/** @param {string} transcript  */
function appendTranscriptToChatList(transcript) {
  const li = document.createElement("li");
  li.innerText = transcript;
  li.classList.add("transcript");
  uListChat.appendChild(li);
}

function setUpSpeechRecognition() {
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  const listener = new SpeechRecognition();
  listener.continuous = true; // listen for long speech
  listener.maxAlternatives = 2;
  let transcript = "";

  // automatic: onstart -> onaudiostart -> onsoundstart -> onspeechstart
  // automatic: onspeechend -> onsoundend -> onaudioend -> onresult -> onend
  // click button: onaudioend -> onresult -> onend

  listener.onend = async function () {
    if (!transcript || !transcript.trim()) return;

    appendTranscriptToChatList(transcript);
    btnRecord.disabled = true;
    await sleep(2000);
    btnRecord.disabled = false;
    transcript = "";
  };

  listener.onerror = function (err) {
    logError(err);
    alert("Error occurred while capturing speech");
  };

  listener.onresult = function (event) {
    for (const alternatives of event.results) {
      const [bestAlternative] = Array.from(alternatives).toSorted(
        (altA, altB) => altB.confidence - altA.confidence
      );

      transcript += bestAlternative.transcript;
    }
  };

  return listener;
}

async function start() {
  const config = {
    isListening: false,
  };

  const listener = setUpSpeechRecognition();

  btnRecord.addEventListener("click", function () {
    toggleRecording(config, listener);
  });
}

ensureBrowserHasSpeechAPI();

function logError(...str) {
  for (const s of str) {
    console.error("error:", s);
  }
}
