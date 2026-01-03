// ========= Helpers =========
const $ = (id) => document.getElementById(id);

// ========= Assistant FIRST (so nothing calls it before it exists) =========
const assistantEl = $("assistant");
const assistantBodyEl = $("assistantBody");
const assistantNameEl = $("assistantName");
const assistantMoodEl = $("assistantMood");
const assistantMsgEl = $("assistantMsg");

const cosmoBtn = $("cosmoBtn");
const astraBtn = $("astraBtn");
const assistantToggleBtn = $("assistantToggleBtn");

const assistantTipBtn = $("assistantTipBtn");
const assistantPlanBtn = $("assistantPlanBtn");

let assistant = localStorage.getItem("assistant") || "Cosmo";
let minimized = localStorage.getItem("assistantMin") === "1";

const COSMO_TIPS = [
  "Pick one task. Make it tiny. Start 2 minutes. Momentum does the rest.",
  "Close tabs. Your brain isn’t a RAM upgrade.",
  "Overwhelmed? Write 3 bullets. That’s the plan.",
  "Consistency beats intensity. Every time."
];

const ASTRA_TIPS = [
  "No negotiating with distractions. Start the timer.",
  "Hardest task first. That’s how you buy peace.",
  "Perfect is a delay tactic. Ship it.",
  "You don’t need motivation. You need a decision."
];

function assistantSay(text) {
  assistantMsgEl.textContent = text;
}

function applyAssistant(name) {
  assistant = name;
  localStorage.setItem("assistant", assistant);

  assistantNameEl.textContent = name;
  assistantMoodEl.textContent = name === "Cosmo" ? "calm mode" : "boss mode";

  assistantEl.classList.remove("cosmo", "astra");
  assistantEl.classList.add(name === "Cosmo" ? "cosmo" : "astra");

  cosmoBtn.classList.toggle("active", name === "Cosmo");
  astraBtn.classList.toggle("active", name === "Astra");

  assistantSay(name === "Cosmo"
    ? "Cosmo here. Soft focus, sharp results. What are we doing first?"
    : "Astra here. We execute. Pick one task. Start now.");
}

function setMinimized(isMin) {
  minimized = isMin;
  localStorage.setItem("assistantMin", minimized ? "1" : "0");
  assistantEl.classList.toggle("minimized", minimized);
  assistantToggleBtn.textContent = minimized ? "+" : "—";
}

cosmoBtn.addEventListener("click", () => applyAssistant("Cosmo"));
astraBtn.addEventListener("click", () => applyAssistant("Astra"));

assistantToggleBtn.addEventListener("click", () => setMinimized(!minimized));

assistantTipBtn.addEventListener("click", () => {
  const pool = assistant === "Cosmo" ? COSMO_TIPS : ASTRA_TIPS;
  assistantSay(pool[Math.floor(Math.random() * pool.length)]);
});

// ========= Name + Greeting =========
const greetingEl = $("greeting");
const nameInput = $("nameInput");
const saveNameBtn = $("saveNameBtn");
const clearNameBtn = $("clearNameBtn");

function getSavedName() {
  return localStorage.getItem("userName") || "";
}

function titleCaseName(name) {
  return name
    .split(" ")
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function setGreeting() {
  const now = new Date();
  const hour = now.getHours();
  let greeting = "Hi";

  if (hour < 12) greeting = "Good morning";
  else if (hour < 18) greeting = "Good afternoon";
  else greeting = "Good evening";

  const savedName = getSavedName();
  greetingEl.textContent = savedName ? `${greeting}, ${savedName} 👋` : `${greeting} 👋`;
}

function saveName() {
  const raw = nameInput.value.trim();
  if (!raw) return;

  const pretty = titleCaseName(raw);
  localStorage.setItem("userName", pretty);
  nameInput.value = pretty;
  setGreeting();
  assistantSay("Nice. Personalized ✅");
}

saveNameBtn.addEventListener("click", saveName);

nameInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") saveName();
});

clearNameBtn.addEventListener("click", () => {
  localStorage.removeItem("userName");
  nameInput.value = "";
  setGreeting();
  assistantSay("Name cleared. Save a nickname anytime.");
});

// ========= Pomodoro =========
const timerEl = $("timer");
const timerLabelEl = $("timerLabel");
const startPauseBtn = $("startPauseBtn");
const resetTimerBtn = $("resetTimerBtn");
const pomodoroModeBtn = $("pomodoroModeBtn");
const breakModeBtn = $("breakModeBtn");

const focusSessionsEl = $("focusSessions");

let mode = "pomodoro";
let secondsLeft = 25 * 60;
let intervalId = null;
let running = false;

let focusSessions = Number(localStorage.getItem("focusSessions") || 0);
focusSessionsEl.textContent = focusSessions;

function formatTime(totalSeconds) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function renderTimer() {
  timerEl.textContent = formatTime(secondsLeft);
  timerLabelEl.textContent = mode === "pomodoro" ? "Study time." : "Break time.";
}

function stopTimer() {
  running = false;
  startPauseBtn.textContent = "Start";
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
}

function setMode(newMode) {
  mode = newMode;

  pomodoroModeBtn.classList.toggle("active", mode === "pomodoro");
  breakModeBtn.classList.toggle("active", mode === "break");

  secondsLeft = mode === "pomodoro" ? 25 * 60 : 5 * 60;
  stopTimer();
  renderTimer();

  assistantSay(mode === "pomodoro"
    ? "Focus mode. Pick ONE task and start."
    : "Break mode. Water + breathe. Don’t scroll.");
}

function tick() {
  secondsLeft--;

  if (secondsLeft <= 0) {
    stopTimer();
    secondsLeft = 0;
    renderTimer();

    if (mode === "pomodoro") {
      focusSessions++;
      localStorage.setItem("focusSessions", String(focusSessions));
      focusSessionsEl.textContent = focusSessions;
      assistantSay("Session complete ✅ That was a real rep.");
    } else {
      assistantSay("Break complete. Back to focus.");
    }

    setMode(mode === "pomodoro" ? "break" : "pomodoro");
    return;
  }

  renderTimer();
}

function startTimer() {
  if (running) return;
  running = true;
  startPauseBtn.textContent = "Pause";
  intervalId = setInterval(tick, 1000);
  assistantSay("Timer started. Lock in.");
}

startPauseBtn.addEventListener("click", () => {
  if (!running) startTimer();
  else {
    stopTimer();
    assistantSay("Paused. We continue when you’re ready.");
  }
});

resetTimerBtn.addEventListener("click", () => {
  secondsLeft = mode === "pomodoro" ? 25 * 60 : 5 * 60;
  stopTimer();
  renderTimer();
  assistantSay("Timer reset. Fresh start.");
});

pomodoroModeBtn.addEventListener("click", () => setMode("pomodoro"));
breakModeBtn.addEventListener("click", () => setMode("break"));

renderTimer();

// ========= Tasks =========
const taskInput = $("taskInput");
const addTaskBtn = $("addTaskBtn");
const taskList = $("taskList");
const clearTasksBtn = $("clearTasksBtn");
const completedCountEl = $("completedCount");

let tasks = JSON.parse(localStorage.getItem("tasks") || "[]");

function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function updateCompletedCount() {
  completedCountEl.textContent = tasks.filter(t => t.done).length;
}

function renderTasks() {
  taskList.innerHTML = "";

  tasks.forEach((task) => {
    const li = document.createElement("li");
    li.className = "task" + (task.done ? " done" : "");

    const left = document.createElement("div");
    left.className = "taskLeft";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.done;

    const text = document.createElement("span");
    text.className = "taskText";
    text.textContent = task.text;

    checkbox.addEventListener("change", () => {
      task.done = checkbox.checked;
      saveTasks();
      renderTasks();
      updateCompletedCount();
      assistantSay(task.done ? "Nice ✅ One down." : "Okay—back on the list.");
    });

    left.appendChild(checkbox);
    left.appendChild(text);

    const delBtn = document.createElement("button");
    delBtn.className = "ghost";
    delBtn.textContent = "Delete";
    delBtn.addEventListener("click", () => {
      tasks = tasks.filter(t => t.id !== task.id);
      saveTasks();
      renderTasks();
      updateCompletedCount();
      assistantSay("Deleted. Keep it clean.");
    });

    li.appendChild(left);
    li.appendChild(delBtn);

    taskList.appendChild(li);
  });

  updateCompletedCount();
}

function addTask() {
  const value = taskInput.value.trim();
  if (!value) return;

  tasks.unshift({
    id: crypto.randomUUID(),
    text: value,
    done: false,
  });

  taskInput.value = "";
  saveTasks();
  renderTasks();
  assistantSay("Task added. Want me to plan your next 25?");
}

addTaskBtn.addEventListener("click", addTask);

taskInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") addTask();
});

clearTasksBtn.addEventListener("click", () => {
  tasks = [];
  saveTasks();
  renderTasks();
  assistantSay("Tasks cleared. Start small: 3 tasks max.");
});

renderTasks();

// Make the assistant’s “Plan my next 25” use your tasks
assistantPlanBtn.addEventListener("click", () => {
  const pending = tasks.filter(t => !t.done).slice(0, 3).map(t => t.text);

  if (pending.length === 0) {
    assistantSay("Add 1–3 tasks first, then I’ll plan your next 25.");
    return;
  }

  const [first, second, third] = pending;

  let plan = `Next 25: “${first}” for 15 min.`;
  if (second) plan += ` Then “${second}” for 7 min.`;
  if (third) plan += ` Then “${third}” for 3 min.`;

  assistantSay(plan);
});

// ========= Quote of the Day (silent fallback: Dawson) =========
const quoteTextEl = $("quoteText");
const quoteAuthorEl = $("quoteAuthor");
const newQuoteBtn = $("newQuoteBtn");

function setFallbackQuote() {
  quoteTextEl.textContent =
    "“Those who simply wait for information to find them, spend a lot of time sitting by the phone. Those who go out and find it themselves, have something to say when it rings.”";
  quoteAuthorEl.textContent = "— Dawson";
}

async function loadQuote() {
  try {
    const res = await fetch("https://api.quotable.io/random", { cache: "no-store" });
    if (!res.ok) throw new Error("Quote request failed");
    const data = await res.json();
    quoteTextEl.textContent = `“${data.content}”`;
    quoteAuthorEl.textContent = `— ${data.author || "Unknown"}`;
  } catch {
    setFallbackQuote();
  }
}

newQuoteBtn.addEventListener("click", loadQuote);
loadQuote();

// ========= Reset All =========
const resetAllBtn = $("resetAllBtn");

resetAllBtn.addEventListener("click", () => {
  localStorage.removeItem("tasks");
  localStorage.removeItem("focusSessions");

  tasks = [];
  focusSessions = 0;
  focusSessionsEl.textContent = "0";

  renderTasks();
  setMode("pomodoro");
  loadQuote();

  assistantSay("Reset complete. Clean slate.");
});

// ========= Final init =========
//applyAssistant(assistant);
//setMinimized(minimized);
//nameInput.value = getSavedName();
//setGreeting();