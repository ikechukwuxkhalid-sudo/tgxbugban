// DEATBUG X-BAN — Simulation Engine
// All operations are FAKE. Nothing is real. Cruise mode only.

const ACCESS_KEY = "deatbugx"; // Default key — change via owner contact
const PROTECTED_TARGETS = ["deatbugxban", "@deatbugxban", "deatbugx"];

let sessionId = null;
let logs = [];

// --- Access Gate ---
document.getElementById("unlockBtn").addEventListener("click", attemptUnlock);
document.getElementById("accessKey").addEventListener("keydown", (e) => {
    if (e.key === "Enter") attemptUnlock();
});

function attemptUnlock() {
    const key = document.getElementById("accessKey").value.trim().toLowerCase();
    const errEl = document.getElementById("errorMsg");

    if (key === ACCESS_KEY || key === "deatbug" || key === "xban") {
        errEl.textContent = "";
        sessionId = generateSessionId();
        document.getElementById("sessionId").textContent = "SESSION: " + sessionId;
        document.getElementById("accessGate").style.display = "none";
        document.getElementById("mainApp").style.display = "grid";
        addLog("sys", "Access granted. Session " + sessionId + " active.");
        termPrint("> access granted — welcome operative");
        termPrint("> all systems online — simulation mode");
    } else {
        errEl.textContent = "ACCESS DENIED // INVALID KEY";
        document.getElementById("accessKey").value = "";
        document.getElementById("accessKey").focus();
    }
}

function generateSessionId() {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let id = "";
    for (let i = 0; i < 8; i++) {
        id += chars[Math.floor(Math.random() * chars.length)];
    }
    return id;
}

// --- Navigation ---
document.querySelectorAll(".nav-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
        document.querySelectorAll(".nav-btn").forEach((b) => b.classList.remove("active"));
        document.querySelectorAll(".panel").forEach((p) => p.classList.remove("active"));
        btn.classList.add("active");
        const panel = btn.getAttribute("data-panel");
        document.getElementById(panel + "Panel").classList.add("active");
    });
});

// --- Core Ops ---
function executeOp(platform, action) {
    let target = "";
    let detail = "";

    if (platform === "wa") {
        if (action === "ban") {
            target = document.getElementById("waBanNumber").value.trim();
            detail = document.getElementById("waBanReason").value;
        } else if (action === "unban") {
            target = document.getElementById("waUnbanNumber").value.trim();
            detail = document.getElementById("waUnbanMethod").value;
        } else if (action === "bug") {
            target = document.getElementById("waBugNumber").value.trim();
            detail = document.getElementById("waBugType").value;
        }
    } else if (platform === "tg") {
        if (action === "ban") {
            target = document.getElementById("tgBanTarget").value.trim();
            detail = document.getElementById("tgBanType").value;
        } else if (action === "unban") {
            target = document.getElementById("tgUnbanTarget").value.trim();
            detail = document.getElementById("tgUnbanMethod").value;
        }
    }

    if (!target) {
        showModal("ERROR", "No target specified.\nEnter a valid number or username.");
        addLog("err", "Operation aborted — empty target.");
        return;
    }

    // Owner protection
    const clean = target.toLowerCase().replace(/^@/, "");
    if (PROTECTED_TARGETS.some((p) => clean.includes(p.replace("@", "")))) {
        showModal("BLOCKED", "TARGET PROTECTED\n\n@deatbugxban is immune.\nOverride denied.\nOperation terminated.");
        addLog("err", "Blocked attempt on protected node: " + target);
        termPrint("> WARNING: protected target detected — abort");
        return;
    }

    // Fake execution sequence
    runSimulation(platform, action, target, detail);
}

function runSimulation(platform, action, target, detail) {
    const platLabel = platform === "wa" ? "WHATSAPP" : "TELEGRAM";
    const actionLabel = action.toUpperCase();

    showModal("EXECUTING", "");
    const output = document.getElementById("modalOutput");
    const fill = document.getElementById("progressFill");
    output.textContent = "";
    fill.style.width = "0%";

    const steps = [
        { pct: 10, msg: `[INIT] Connecting to ${platLabel} node cluster...` },
        { pct: 25, msg: `[AUTH] Session ${sessionId} authenticated.` },
        { pct: 40, msg: `[SCAN] Resolving target: ${target}` },
        { pct: 55, msg: `[LOAD] Payload type: ${detail}` },
        { pct: 70, msg: `[INJECT] Deploying ${actionLabel} sequence...` },
        { pct: 85, msg: `[PROC] Processing response packets...` },
        { pct: 100, msg: `[DONE] Simulation complete.` },
    ];

    let i = 0;
    const interval = setInterval(() => {
        if (i >= steps.length) {
            clearInterval(interval);
            finishOp(platform, action, target, detail);
            return;
        }
        fill.style.width = steps[i].pct + "%";
        output.textContent += steps[i].msg + "\n";
        termPrint("> " + steps[i].msg.toLowerCase());
        i++;
    }, 400);
}

function finishOp(platform, action, target, detail) {
    const results = {
        ban: [
            `TARGET: ${target}`,
            `ACTION: BAN`,
            `METHOD: ${detail}`,
            `STATUS: SIMULATED SUCCESS`,
            `NOTE: This is a cruise simulation.`,
            `No real account was affected.`,
            `Timestamp: ${new Date().toISOString()}`,
        ],
        unban: [
            `TARGET: ${target}`,
            `ACTION: UNBAN`,
            `METHOD: ${detail}`,
            `STATUS: SIMULATED RESTORE`,
            `NOTE: This is a cruise simulation.`,
            `No real account was affected.`,
            `Timestamp: ${new Date().toISOString()}`,
        ],
        bug: [
            `TARGET: ${target}`,
            `ACTION: BUG / GLITCH`,
            `TYPE: ${detail}`,
            `STATUS: SIMULATED DEPLOY`,
            `NOTE: This is a cruise simulation.`,
            `No real device was affected.`,
            `Timestamp: ${new Date().toISOString()}`,
        ],
    };

    const lines = results[action] || ["Unknown operation."];
    document.getElementById("modalTitle").textContent = "OPERATION COMPLETE";
    document.getElementById("modalOutput").textContent = lines.join("\n");

    addLog(action, `${action.toUpperCase()} simulated on ${target} [${detail}]`);
    termPrint(`> ${action} simulation finished — target ${target}`);
}

// --- Modal ---
function showModal(title, body) {
    document.getElementById("modalTitle").textContent = title;
    document.getElementById("modalOutput").textContent = body;
    document.getElementById("progressFill").style.width = "0%";
    document.getElementById("resultModal").classList.add("active");
}

function closeModal() {
    document.getElementById("resultModal").classList.remove("active");
}

// --- Logs ---
function addLog(type, msg) {
    const now = new Date();
    const time = now.toTimeString().slice(0, 8);
    logs.unshift({ time, type, msg });
    renderLogs();
}

function renderLogs() {
    const container = document.getElementById("logsContainer");
    container.innerHTML = logs
        .map(
            (l) =>
                `<div class="log-entry">
                    <span class="log-time">[${l.time}]</span>
                    <span class="log-type ${l.type}">${l.type.toUpperCase()}</span>
                    <span class="log-msg">${escapeHtml(l.msg)}</span>
                </div>`
        )
        .join("");
}

function clearLogs() {
    logs = [];
    renderLogs();
    addLog("sys", "Logs cleared.");
}

function escapeHtml(str) {
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

// --- Terminal ---
function termPrint(msg) {
    const feed = document.getElementById("terminalFeed");
    const line = document.createElement("div");
    line.className = "term-line";
    line.textContent = msg;
    feed.appendChild(line);
    feed.scrollTop = feed.scrollHeight;

    // Keep terminal from growing forever
    while (feed.children.length > 50) {
        feed.removeChild(feed.firstChild);
    }
}

// Boot message
console.log("%c DEATBUG X-BAN ", "background:#00f0ff;color:#000;font-weight:bold;padding:4px 8px;");
console.log("%c Simulation mode. Nothing is real. ", "color:#05ffa1;");
