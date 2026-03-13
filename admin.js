// admin.js (frontend)
(() => {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  if (window.Chart && window.ChartDataLabels) {
    Chart.register(ChartDataLabels);
  } else {
    console.warn("ChartDataLabels plugin not found. Pie labels will be disabled.");
  }

const AUTH_KEY = "kiosk_auth";

function getAuthSession() {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function isAuthValid(session) {
  if (!session) return false;
  if (!session.expiresAt) return false;
  return Date.now() < session.expiresAt;
}

function requireAuth() {
  return true;
}

  function clamp(n, min, max) { return Math.max(min, Math.min(max, n)); }

  function formatDateLong(d) {
    return d.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  function formatTimeLong(d) {
    return d.toLocaleTimeString("en-US");
  }

  function formatDateShort(d) {
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }

  function formatTimeShort(d) {
    return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  }

  function fmtMoneyPHP(n) {
    return `₱${n.toLocaleString("en-PH", { maximumFractionDigits: 0 })}`;
  }

  function fmtInt(n) {
    return n.toLocaleString("en-US");
  }

  function formatFileSize(bytes) {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  }

  function escapeHtml(str = "") {
    return String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  // Custom inline SVG icon for Failed Transactions (matches the uploaded "failed" document+X style)
  const FAILED_TX_ICON_SVG = `
  <svg xmlns="http://www.w3.org/2000/svg"
     viewBox="0 0 24 24"
     width="16" height="16"
     fill="none"
     stroke="currentColor"
     stroke-width="2"
     stroke-linecap="round"
     stroke-linejoin="round"
     aria-hidden="true">
  <!-- Document -->
  <path d="M14 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h7"/>
  <path d="M14 2v4a2 2 0 0 0 2 2h4"/>
  <path d="M14 2l6 6"/>

  <!-- Lines -->
  <path d="M8 10h6"/>
  <path d="M8 14h5"/>

  <!-- Fail badge -->
  <circle cx="17" cy="17" r="4"/>
  <path d="M15.6 15.6l2.8 2.8"/>
  <path d="M18.4 15.6l-2.8 2.8"/>
</svg>
`.trim();


  // -----------------------------
  // Toasts (sonner replacement)
  // -----------------------------
  function toast(type, title, description = "") {
    const wrap = $("#toasts");
    const tpl = $("#tplToast");
    const node = tpl.content.firstElementChild.cloneNode(true);

    $(".toast-title", node).textContent = title;
    $(".toast-desc", node).textContent = description;

    // subtle type accent (no extra CSS needed)
    if (type === "error") node.style.borderColor = "rgba(239,68,68,0.35)";
    if (type === "success") node.style.borderColor = "rgba(34,197,94,0.35)";
    if (type === "info") node.style.borderColor = "rgba(59,130,246,0.35)";

    wrap.appendChild(node);
    setTimeout(() => {
      node.style.opacity = "0";
      node.style.transform = "translateY(-4px)";
      node.style.transition = "opacity 180ms ease, transform 180ms ease";
      setTimeout(() => node.remove(), 220);
    }, 3200);
  }

  // -----------------------------
  // Mock data (same logic as DashboardPage.tsx)
  // -----------------------------

  function generateLogs() {
    const errors = [
      "Coin not accepted - Invalid denomination",
      "Transaction failed - Insufficient funds",
      "Paper jam detected in tray 2",
      "Network connection timeout",
      "Printer offline - Check connection",
      "Low ink warning - Cyan cartridge",
      "Payment processing error - Card declined",
      "Document upload failed - File too large",
      "Authentication error - Session expired",
      "Coin slot blocked - Maintenance required",
    ];

    const warnings = [
      "Low paper warning - Tray 1",
      "Toner level below 20%",
      "Scheduled maintenance due in 2 days",
      "High temperature detected",
    ];

    const infos = [
      "System backup completed successfully",
      "Daily report generated",
      "Firmware update available",
    ];

    const logs = [];
    const now = new Date();

    for (let i = 0; i < 15; i++) {
      const timestamp = new Date(now.getTime() - i * 30 * 60 * 1000);
      const rand = Math.random();

      if (rand < 0.6) {
        logs.push({
          id: `log-${i}`,
          timestamp,
          type: "error",
          message: errors[Math.floor(Math.random() * errors.length)],
          details: `Error code: ERR${Math.floor(1000 + Math.random() * 9000)}`,
        });
      } else if (rand < 0.85) {
        logs.push({
          id: `log-${i}`,
          timestamp,
          type: "warning",
          message: warnings[Math.floor(Math.random() * warnings.length)],
        });
      } else {
        logs.push({
          id: `log-${i}`,
          timestamp,
          type: "info",
          message: infos[Math.floor(Math.random() * infos.length)],
        });
      }
    }

    logs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    return logs;
  }

  function generateDailyData() {
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      data.push({
        date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        successful: Math.floor(Math.random() * 50) + 100,
        failed: Math.floor(Math.random() * 15) + 5,
      });
    }
    return data;
  }

  function generateWeeklyData() {
    const data = [];
    for (let i = 11; i >= 0; i--) {
      data.push({
        date: `Week ${12 - i}`,
        successful: Math.floor(Math.random() * 300) + 600,
        failed: Math.floor(Math.random() * 50) + 20,
      });
    }
    return data;
  }

  function generateMonthlyData() {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const data = [];
    for (let i = 11; i >= 0; i--) {
      const monthIndex = (new Date().getMonth() - i + 12) % 12;
      data.push({
        date: months[monthIndex],
        successful: Math.floor(Math.random() * 1000) + 2000,
        failed: Math.floor(Math.random() * 150) + 50,
      });
    }
    return data;
  }

  function generateYearlyData() {
    const data = [];
    const currentYear = new Date().getFullYear();
    for (let i = 4; i >= 0; i--) {
      data.push({
        date: String(currentYear - i),
        successful: Math.floor(Math.random() * 10000) + 20000,
        failed: Math.floor(Math.random() * 1000) + 500,
      });
    }
    return data;
  }

  function eachDayOfInterval(from, to) {
    const days = [];
    const start = new Date(from);
    const end = new Date(to);
    start.setHours(0,0,0,0);
    end.setHours(0,0,0,0);

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      days.push(new Date(d));
    }
    return days;
  }

  function formatMMMdd(d) {
    return d.toLocaleDateString("en-US", { month: "short", day: "2-digit" });
  }

  function generateCustomDateData(from, to) {
    const dateArray = eachDayOfInterval(from, to);
    return dateArray.map((date) => ({
      date: formatMMMdd(date),
      successful: Math.floor(Math.random() * 50) + 100,
      failed: Math.floor(Math.random() * 15) + 5,
    }));
  }


  const PRICING_KEY = "kiosk_pricing";

function getDefaultPricing() {
  return {
    coloredPaper: {
      grayscale: 3,
      coloredTier1: 3,
      coloredTier2: 7,
      coloredTier3: 10,
    },
    sizeSurcharge: {
      A4: 1,
      legal: 2,
    },
  };
}

function getPricing() {
  try {
    const raw = localStorage.getItem(PRICING_KEY);
    if (!raw) return getDefaultPricing();
    return { ...getDefaultPricing(), ...JSON.parse(raw) };
  } catch {
    return getDefaultPricing();
  }
}

function savePricing(pricing) {
  localStorage.setItem(PRICING_KEY, JSON.stringify(pricing));
}


  // -----------------------------
  // State
  // -----------------------------
  const state = {
    route: "/",

    timeRange: "daily", // daily | weekly | monthly
    customDateRange: {
      from: new Date(new Date().setDate(new Date().getDate() - 7)),
      to: new Date(),
    },

    logs: generateLogs(),
    pricing: getPricing(),

    // Upload page
    uploadedFiles: [],
    selectedFileId: null,
    isDragging: false,

    // Chart instances
    txChart: null,
    pieChart: null,

    // QR instance
    qr: null,
  };

  // -----------------------------
  // Router (React Router replacement)
  // -----------------------------
  function getHashRoute() {
    const raw = (location.hash || "#/" ).slice(1);
    return raw.startsWith("/") ? raw : `/${raw}`;
  }

  function setRoute(route) {
    state.route = route;

    const isUpload = route === "/upload";

    $("#pageDashboard").hidden = isUpload;
    $("#pageUpload").hidden = !isUpload;

    $("#headerSubtitle").textContent = isUpload ? "Upload Files for Printing" : "Administrator Dashboard";

    // (Re)render page-specific content (kept lightweight)
    if (isUpload) {
      renderUploadPage();
    } else {
      renderDashboardPage();
    }

    // refresh icons
    lucide.createIcons();
  }

  window.addEventListener("hashchange", () => setRoute(getHashRoute()));

  // -----------------------------
  // Component render helpers
  // -----------------------------
  function createCard(title) {
    const tpl = $("#tplCard");
    const node = tpl.content.firstElementChild.cloneNode(true);
    $(".card-title", node).textContent = title;
    return { node, body: $(".card-body", node) };
  }

  function createStatsCard({ title, value, icon, iconSvg, trend, subtitle }) {
  const tpl = $("#tplStatsCard");
  const node = tpl.content.firstElementChild.cloneNode(true);

  $(".eyebrow", node).textContent = title;

  const iconEl = $("[data-icon]", node);

  // ✅ Support custom inline SVG (no Lucide)
  if (iconSvg) {
    iconEl.removeAttribute("data-lucide");
    iconEl.innerHTML = iconSvg;
    iconEl.classList.add("icon-svg");
  } else {
    // Default Lucide behavior
    iconEl.setAttribute("data-lucide", icon);
  }

  $(".stat-value", node).textContent = value;

  if (trend) {
    const t = $(".stat-trend", node);
    t.hidden = false;
    t.textContent = `${trend.positive ? "↑" : "↓"} ${trend.value}`;
    t.style.color = trend.positive ? "#16a34a" : "#dc2626";
  }

  if (subtitle) {
    const s = $(".stat-sub", node);
    s.hidden = false;
    s.textContent = subtitle;
  }

  return node;
}


  function createLogItem(log) {
    const tpl = $("#tplLogItem");
    const node = tpl.content.firstElementChild.cloneNode(true);

    const iconEl = $("[data-icon]", node);
    const badge = $("[data-badge]", node);

    if (log.type === "error") {
      iconEl.setAttribute("data-lucide", "x-circle");
      iconEl.style.color = "var(--red)";
      badge.classList.add("badge", "badge-sm", "badge-destructive");
    } else if (log.type === "warning") {
      iconEl.setAttribute("data-lucide", "alert-triangle");
      iconEl.style.color = "var(--yellow)";
      badge.classList.add("badge", "badge-sm", "badge-secondary");
    } else {
      iconEl.setAttribute("data-lucide", "info");
      iconEl.style.color = "var(--blue)";
      badge.classList.add("badge", "badge-sm", "badge-secondary");
    }

    badge.textContent = log.type.toUpperCase();

    $(".log-time", node).textContent = `${formatDateShort(log.timestamp)} at ${formatTimeShort(log.timestamp)}`;
    $(".log-msg", node).textContent = log.message;

    if (log.details) {
      const d = $(".log-details", node);
      d.hidden = false;
      d.textContent = log.details;
    }

    return node;
  }

  // Upload components
  const ALLOWED_TYPES = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "application/msword",
    "application/vnd.ms-excel",
    "application/vnd.ms-powerpoint",
  ];
  const ALLOWED_EXTENSIONS = [".pdf", ".docx", ".xlsx", ".pptx", ".doc", ".xls", ".ppt"]; 

  function getFileEmoji(type, name) {
    const ext = (name.split(".").pop() || "").toLowerCase();
    if (type.includes("pdf") || ext === "pdf") return "📄";
    if (type.includes("word") || ext === "doc" || ext === "docx") return "📝";
    if (type.includes("sheet") || type.includes("excel") || ext === "xls" || ext === "xlsx") return "📊";
    if (type.includes("presentation") || type.includes("powerpoint") || ext === "ppt" || ext === "pptx") return "📽️";
    return "📄";
  }

  function generateQRCodeData(fileId) {
    return `https://kiosk-print.example.com/print/${fileId}`;
  }

  function createUploadedFileRow(file, isSelected) {
    const tpl = $("#tplUploadedFile");
    const node = tpl.content.firstElementChild.cloneNode(true);

    if (isSelected) node.classList.add("selected");

    $(".file-emoji", node).textContent = getFileEmoji(file.type, file.name);
    $(".file-name", node).textContent = file.name;

    const meta = `${formatFileSize(file.size)} • ${file.uploadDate.toLocaleDateString()} at ${file.uploadDate.toLocaleTimeString()}`;
    $(".file-meta", node).textContent = meta;

    $(".badge", node).textContent = file.id;

    node.addEventListener("click", () => {
      state.selectedFileId = file.id;
      renderUploadPage();
    });

    $(".file-remove", node).addEventListener("click", (e) => {
      e.stopPropagation();
      removeFile(file.id);
    });

    return node;
  }

  function removeFile(id) {
    state.uploadedFiles = state.uploadedFiles.filter(f => f.id !== id);
    if (state.selectedFileId === id) state.selectedFileId = state.uploadedFiles[0]?.id ?? null;
    toast("info", "File removed");
    renderUploadPage();
  }

  // -----------------------------
  // Dashboard rendering
  // -----------------------------
async function fetchAnalytics(range) {
  const session = getAuthSession();
  const token = session?.token;

  if (!token) throw new Error("Missing auth token");

  const r = await fetch(`/api/analytics?range=${range}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!r.ok) {
    const body = await r.text().catch(() => "");
    throw new Error(`Analytics failed: ${r.status} ${body}`);
  }
  return await r.json();
}

  function getChartTitle() {
    const from = state.customDateRange.from;
    const to = state.customDateRange.to;
    switch (state.timeRange) {
      case "daily": return "Transaction Summary - Last 7 Days";
      case "weekly": return "Transaction Summary - Last 12 Weeks";
      case "monthly": return "Transaction Summary - Last 12 Months";
      default: return "Transaction Summary";
    }
  }

  function calcStats(chartData) {
    const successful = chartData.reduce((sum, item) => sum + item.successful, 0);
    const failed = chartData.reduce((sum, item) => sum + item.failed, 0);
    const totalTransactions = successful + failed;
    const totalPages = Math.floor(totalTransactions * 3.5);
    const colorPages = Math.floor(totalPages * 0.35);
    const bwPages = totalPages - colorPages;

    return {
      totalTransactions,
      successful,
      failed,
      totalPages,
      colorPages,
      bwPages,
      revenue: successful * 2.5,
    };
  }

function getChartData() {
  if (state.timeRange === "daily") return generateDailyData();
  if (state.timeRange === "weekly") return generateWeeklyData();
  if (state.timeRange === "monthly") return generateMonthlyData();
  return generateDailyData();
}

function renderPricingSection() {
  const pricingSlot = $("#pricingCard");
  if (!pricingSlot) return;

  pricingSlot.innerHTML = "";

  let editing = false;
  let dirty = false;

  const pricingCard = createCard("");
  pricingCard.node.classList.add("pricing-card", "is-locked");

  const headWrap = document.createElement("div");
  headWrap.style.display = "flex";
  headWrap.style.flexDirection = "column";
  headWrap.style.gap = "6px";

  const headRow = document.createElement("div");
  headRow.className = "row between";

  const titleWrap = document.createElement("div");
  titleWrap.className = "pricing-header-title";

  const lockIconWrap = document.createElement("span");
  lockIconWrap.className = "pricing-lock";
  lockIconWrap.innerHTML = `<i data-lucide="lock" class="icon"></i>`;

  const title = document.createElement("span");
  title.textContent = "Printing Price Settings";

  titleWrap.append(lockIconWrap, title);

  const editBtn = document.createElement("button");
  editBtn.className = "btn btn-outline btn-sm";
  editBtn.id = "editPricingBtn";
  editBtn.type = "button";
  editBtn.textContent = "Edit";

  headRow.append(titleWrap, editBtn);

  const statusText = document.createElement("div");
  statusText.className = "pricing-status";
  statusText.textContent = "Locked. Click Edit to modify prices.";

  headWrap.append(headRow, statusText);
  $(".card-title", pricingCard.node).appendChild(headWrap);

  const wrap = document.createElement("div");
  wrap.className = "pricing-grid";

  wrap.innerHTML = `
    <div class="pricing-group">
      <h3>Colored Paper</h3>
      <div class="pricing-fields">
        <div class="pricing-field">
          <label for="priceGrayscale">Grayscale per page</label>
          <input id="priceGrayscale" class="input pricing-input" type="number" disabled min="0" step="0.01" value="${state.pricing.coloredPaper.grayscale}">
          <small>Base grayscale page price</small>
        </div>

        <div class="pricing-field">
          <label for="priceTier1">Colored Tier 1</label>
          <input id="priceTier1" class="input pricing-input" type="number" disabled min="0" step="0.01" value="${state.pricing.coloredPaper.coloredTier1}">
          <small>0% - 10% color coverage</small>
        </div>

        <div class="pricing-field">
          <label for="priceTier2">Colored Tier 2</label>
          <input id="priceTier2" class="input pricing-input" type="number" disabled min="0" step="0.01" value="${state.pricing.coloredPaper.coloredTier2}">
          <small>More than 10% up to 25% color coverage</small>
        </div>

        <div class="pricing-field">
          <label for="priceTier3">Colored Tier 3</label>
          <input id="priceTier3" class="input pricing-input" type="number" disabled min="0" step="0.01" value="${state.pricing.coloredPaper.coloredTier3}">
          <small>More than 25% up to 100% color coverage</small>
        </div>
      </div>
    </div>

    <div class="pricing-group">
      <h3>Size Surcharge Per Page</h3>
      <div class="pricing-fields">
        <div class="pricing-field">
          <label for="priceA4">A4</label>
          <input id="priceA4" class="input pricing-input" type="number" disabled min="0" step="0.01" value="${state.pricing.sizeSurcharge.A4}">
          <small>Additional charge per A4 page</small>
        </div>

        <div class="pricing-field">
          <label for="priceLegal">Legal</label>
          <input id="priceLegal" class="input pricing-input" type="number" disabled min="0" step="0.01" value="${state.pricing.sizeSurcharge.legal}">
          <small>Additional charge per legal-size page</small>
        </div>
      </div>
    </div>
  `;

  const actions = document.createElement("div");
  actions.className = "pricing-actions";
  actions.innerHTML = `
    <button type="button" class="btn btn-outline" id="resetPricingBtn" disabled>Reset Default</button>
    <button type="button" class="btn" id="savePricingBtn" disabled>Save Pricing</button>
  `;

  pricingCard.body.append(wrap, actions);
  pricingSlot.appendChild(pricingCard.node);

  const inputs = $$(".pricing-input", pricingCard.node);
  const saveBtn = $("#savePricingBtn", pricingCard.node);
  const resetBtn = $("#resetPricingBtn", pricingCard.node);
  const editBtnEl = $("#editPricingBtn", pricingCard.node);
  const statusEl = $(".pricing-status", pricingCard.node);
  const lockIconEl = $(".pricing-lock", pricingCard.node);

  const initialValues = () => ({
    coloredPaper: {
      grayscale: Number($("#priceGrayscale", pricingCard.node).value) || 0,
      coloredTier1: Number($("#priceTier1", pricingCard.node).value) || 0,
      coloredTier2: Number($("#priceTier2", pricingCard.node).value) || 0,
      coloredTier3: Number($("#priceTier3", pricingCard.node).value) || 0,
    },
    sizeSurcharge: {
      A4: Number($("#priceA4", pricingCard.node).value) || 0,
      legal: Number($("#priceLegal", pricingCard.node).value) || 0,
    },
  });

  let originalPricing = initialValues();

  function pricingEquals(a, b) {
    return JSON.stringify(a) === JSON.stringify(b);
  }

  function currentPricingFromInputs() {
    return {
      coloredPaper: {
        grayscale: Number($("#priceGrayscale", pricingCard.node).value) || 0,
        coloredTier1: Number($("#priceTier1", pricingCard.node).value) || 0,
        coloredTier2: Number($("#priceTier2", pricingCard.node).value) || 0,
        coloredTier3: Number($("#priceTier3", pricingCard.node).value) || 0,
      },
      sizeSurcharge: {
        A4: Number($("#priceA4", pricingCard.node).value) || 0,
        legal: Number($("#priceLegal", pricingCard.node).value) || 0,
      },
    };
  }

  function updateDirtyState() {
    const current = currentPricingFromInputs();
    dirty = !pricingEquals(current, originalPricing);

    statusEl.classList.toggle("is-dirty", dirty);

    if (!editing) {
      statusEl.textContent = "Locked. Click Edit to modify prices.";
      return;
    }

    if (dirty) {
      statusEl.textContent = "You have unsaved changes.";
    } else {
      statusEl.textContent = "Editing enabled. No unsaved changes.";
    }

    saveBtn.disabled = !dirty;
  }

  function setEditingMode(isEditing) {
    editing = isEditing;

    pricingCard.node.classList.toggle("is-editing", editing);
    pricingCard.node.classList.toggle("is-locked", !editing);

    inputs.forEach((input) => {
      input.disabled = !editing;
    });

    resetBtn.disabled = !editing;
    saveBtn.disabled = !editing || !dirty;

    editBtnEl.textContent = editing ? "Cancel" : "Edit";

    lockIconEl.innerHTML = editing
      ? `<i data-lucide="lock-open" class="icon"></i>`
      : `<i data-lucide="lock" class="icon"></i>`;

    if (!editing) {
      statusEl.classList.remove("is-dirty");
      statusEl.textContent = "Locked. Click Edit to modify prices.";
    } else if (dirty) {
      statusEl.classList.add("is-dirty");
      statusEl.textContent = "You have unsaved changes.";
    } else {
      statusEl.classList.remove("is-dirty");
      statusEl.textContent = "Editing enabled. No unsaved changes.";
    }

    lucide.createIcons();
  }

  editBtnEl.onclick = () => {

  if (!editing) {
    setEditingMode(true);
  } else {
    renderPricingSection();
  }

};

  inputs.forEach((input) => {
    input.addEventListener("input", updateDirtyState);
  });

  editBtnEl.onclick = () => {
    if (editing && dirty) {
      const discard = window.confirm("You have unsaved changes. Discard them?");
      if (!discard) return;
      renderPricingSection();
      return;
    }

    if (editing) {
      renderPricingSection();
      return;
    }

    originalPricing = initialValues();
    dirty = false;
    setEditingMode(true);
  };

  saveBtn.onclick = () => {
    const newPricing = currentPricingFromInputs();

    state.pricing = newPricing;
    savePricing(newPricing);
    originalPricing = JSON.parse(JSON.stringify(newPricing));
    dirty = false;

    setEditingMode(false);
    toast("success", "Pricing updated", "New printing prices have been saved.");
  };

  resetBtn.onclick = () => {
    const confirmed = window.confirm("Reset all printing prices to default values?");
    if (!confirmed) return;

    const defaults = getDefaultPricing();
    state.pricing = defaults;
    savePricing(defaults);
    renderPricingSection();
    toast("info", "Pricing reset", "Default pricing has been restored.");
  };

  setEditingMode(false);
}

function renderDashboardPage() {
  (async () => {
    let chartData = [];
    let stats = null;

    try {
      const data = await fetchAnalytics(state.timeRange);

      chartData = (data?.timeline || []).map((item) => ({
        date: new Date(item.period).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        successful: Number(item.successful || 0),
        failed: Number(item.failed || 0),
      }));

      const totalTransactions = Number(data?.totals?.total_transactions || 0);
      const failed = Number(data?.totals?.failed || 0);
      const successful = Math.max(0, totalTransactions - failed);

      stats = {
        totalTransactions,
        successful,
        failed,
        totalPages: Number(data?.totals?.total_pages || 0),
        colorPages: Number(data?.totals?.color_pages || 0),
        bwPages: Number(data?.totals?.bw_pages || 0),
        revenue: Number.isFinite(Number(data?.totals?.revenue))
          ? Number(data.totals.revenue)
          : successful * 2.5,
      };

      if (!chartData.length) {
        chartData = [];
        stats = {
          totalTransactions: 0,
          successful: 0,
          failed: 0,
          totalPages: 0,
          colorPages: 0,
          bwPages: 0,
          revenue: 0
        };
      }
    } catch (err) {
      console.warn("Analytics fetch failed:", err?.message || err);

      chartData = [];
      stats = {
        totalTransactions: 0,
        successful: 0,
        failed: 0,
        totalPages: 0,
        colorPages: 0,
        bwPages: 0,
        revenue: 0
      };

      toast("error", "Analytics unavailable", "No transaction data yet.");
    }

    const statsGrid = $("#statsGrid");
    statsGrid.innerHTML = "";
    statsGrid.append(
      createStatsCard({
        title: "Total Transactions",
        value: fmtInt(stats.totalTransactions),
        icon: "trending-up",
        trend: { value: "12.5% from last period", positive: true },
      }),
      createStatsCard({
        title: "Total Pages Printed",
        value: fmtInt(stats.totalPages),
        icon: "file-text",
        subtitle: `${fmtInt(stats.successful)} successful`,
      }),
      createStatsCard({
        title: "Income Generated",
        value: fmtMoneyPHP(stats.revenue),
        icon: "philippine-peso",
        trend: { value: "8.2% from last period", positive: true },
      }),
      createStatsCard({
        title: "Failed Transactions",
        value: fmtInt(stats.failed),
        iconSvg: FAILED_TX_ICON_SVG,
        trend: { value: "3.1% from last period", positive: false },
      })
    );

    renderPricingSection();


    const btns = $$("[data-range]");
    btns.forEach((b) => {
      const r = b.getAttribute("data-range");
      const active = r === state.timeRange;

      b.classList.toggle("btn-outline", !active);
      b.classList.toggle("btn", true);

      b.onclick = () => {
        state.timeRange = r;
        renderDashboardPage();
      };
    });

    const chartSlot = $("#transactionChartCard");
    chartSlot.innerHTML = "";

    const txCard = createCard(getChartTitle());

    const chartWrap = document.createElement("div");
    chartWrap.className = "chart-wrap";

    const canvas = document.createElement("canvas");
    canvas.id = "txChart";

    chartWrap.appendChild(canvas);
    txCard.body.appendChild(chartWrap);
    chartSlot.appendChild(txCard.node);

    renderTxChart(canvas, chartData);

    const logsSlot = $("#logsCard");
    logsSlot.innerHTML = "";

    const logsCard = createCard("System Logs");

    const logsTitleRow = document.createElement("div");
    logsTitleRow.className = "row gap-8";

    const logsIcon = document.createElement("i");
    logsIcon.setAttribute("data-lucide", "alert-circle");
    logsIcon.className = "icon";

    logsTitleRow.append(logsIcon, document.createTextNode("System Logs"));
    $(".card-title", logsCard.node).textContent = "";
    $(".card-title", logsCard.node).appendChild(logsTitleRow);

    const scroll = document.createElement("div");
    scroll.className = "scroll";

    const list = document.createElement("div");
    list.style.display = "flex";
    list.style.flexDirection = "column";
    list.style.gap = "12px";

    state.logs.forEach((log) => list.appendChild(createLogItem(log)));
    scroll.appendChild(list);
    logsCard.body.appendChild(scroll);
    logsSlot.appendChild(logsCard.node);

    const printSlot = $("#printingStatsCard");
    printSlot.innerHTML = "";

    const printCard = createCard("Print Type Distribution");

    const pieWrap = document.createElement("div");
    pieWrap.className = "chart-wrap pie";

    const pieCanvas = document.createElement("canvas");
    pieCanvas.id = "pieChart";
    pieWrap.appendChild(pieCanvas);

    const grid = document.createElement("div");
    grid.className = "print-grid";
    grid.innerHTML = `
      <div class="print-tile">
        <p class="print-num" style="color: var(--blue);">${fmtInt(stats.colorPages)}</p>
        <p class="print-label">Color Pages</p>
      </div>
      <div class="print-tile">
        <p class="print-num" style="color: var(--slate);">${fmtInt(stats.bwPages)}</p>
        <p class="print-label">B&W Pages</p>
      </div>
    `;

    printCard.body.append(pieWrap, grid);
    printSlot.appendChild(printCard.node);

    renderPieChart(pieCanvas, stats.colorPages, stats.bwPages);

    lucide.createIcons();
  })().catch((e) => {
    console.error("renderDashboardPage fatal:", e);
    toast("error", "Dashboard error", e?.message || "Unknown error");
  });
}

  function renderTxChart(canvas, data) {
    const labels = data.map(d => d.date);
    const successful = data.map(d => d.successful);
    const failed = data.map(d => d.failed);

    if (state.txChart) {
      state.txChart.destroy();
      state.txChart = null;
    }

    const ctx = canvas.getContext("2d");

    // Stacked area approximation of Recharts AreaChart
    state.txChart = new Chart(ctx, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: "Successful",
            data: successful,
            borderColor: getCssVar("--green"),
            backgroundColor: withAlpha(getCssVar("--green"), 0.6),
            fill: true,
            tension: 0.35,
            pointRadius: 0,
            stack: "stack1",
          },
          {
            label: "Failed",
            data: failed,
            borderColor: getCssVar("--red"),
            backgroundColor: withAlpha(getCssVar("--red"), 0.6),
            fill: true,
            tension: 0.35,
            pointRadius: 0,
            stack: "stack1",
          },
        ],
      },
      options: {
        maintainAspectRatio: false,
        responsive: true,
        interaction: { mode: "index", intersect: false },
        plugins: {
          legend: { display: true },
          tooltip: { enabled: true },
        },
        scales: {
          x: { grid: { display: true, borderDash: [3, 3] } },
          y: { beginAtZero: true, stacked: true, grid: { display: true, borderDash: [3, 3] } },
        },
      },
    });
  }

function renderPieChart(canvas, colorPages, bwPages) {
  if (state.pieChart) {
    state.pieChart.destroy();
    state.pieChart = null;
  }
  const ctx = canvas.getContext("2d");
  const c = Number(colorPages) || 0;
  const b = Number(bwPages) || 0;

  const hasDL = typeof ChartDataLabels !== "undefined";
  if (hasDL) Chart.register(ChartDataLabels);

  state.pieChart = new Chart(ctx, {
    type: "pie",
    data: {
      labels: ["Color", "Black & White"],
      datasets: [{
        data: [c, b],
        backgroundColor: [getCssVar("--blue"), getCssVar("--slate")],
        borderWidth: 0,
      }],
    },
    options: {
      maintainAspectRatio: false,
      responsive: true,
      plugins: {
        tooltip: { enabled: true },
        legend: {
          display: true,
          position: "bottom",
          labels: { boxWidth: 10, boxHeight: 10, padding: 12, usePointStyle: false }
        },
        ...(hasDL ? {
          datalabels: {
            display: true,
            formatter: (value, ctx) => {
              const data = ctx.chart.data.datasets[0].data.map(Number);
              const total = data.reduce((a, b) => a + b, 0);
              const pct = total ? (Number(value) / total) * 100 : 0;
              const label = ctx.chart.data.labels[ctx.dataIndex] || "";
              return `${label}: ${pct.toFixed(0)}%`;
            },
            color: "rgba(255,255,255,0.85)",
            font: { weight: "400", size: 12 },
          }
        } : {})
      }
    }
  });
}

  function getCssVar(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  }

  function withAlpha(hex, alpha) {
    // supports #RRGGBB only
    const h = hex.replace("#", "");
    if (h.length !== 6) return hex;
    const r = parseInt(h.slice(0, 2), 16);
    const g = parseInt(h.slice(2, 4), 16);
    const b = parseInt(h.slice(4, 6), 16);
    return `rgba(${r},${g},${b},${alpha})`;
  }

  // -----------------------------
  // Date range selector behavior
  // -----------------------------
  function renderDateRangeLabel() {
    const from = state.customDateRange.from;
    const to = state.customDateRange.to;
    const label = `${from.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })} - ${to.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })}`;
    $("#dateRangeLabel").textContent = label;
  }

  function wireDatePopover() {
    const btn = $("#dateRangeBtn");
    const pop = $("#datePopover");
    const fromInput = $("#fromDate");
    const toInput = $("#toDate");
    const err = $("#dateError");

    // Initialize inputs
    const toYMD = (d) => {
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      return `${yyyy}-${mm}-${dd}`;
    };

    fromInput.value = toYMD(state.customDateRange.from);
    toInput.value = toYMD(state.customDateRange.to);

    // toggle
    btn.onclick = () => {
      pop.hidden = !pop.hidden;
      err.textContent = "";
    };

    // click outside closes
    document.addEventListener("click", (e) => {
      if (state.timeRange !== "custom") return;
      const inside = pop.contains(e.target) || btn.contains(e.target);
      if (!inside) pop.hidden = true;
    }, { capture: true });

    // constraints (no future dates; to >= from)
    const today = new Date();
    const todayYMD = toYMD(today);
    fromInput.max = todayYMD;
    toInput.max = todayYMD;

    $("#applyRange").onclick = () => {
      const f = new Date(fromInput.value);
      const t = new Date(toInput.value);

      if (!fromInput.value || !toInput.value || Number.isNaN(f.getTime()) || Number.isNaN(t.getTime())) {
        err.textContent = "Please select both dates.";
        return;
      }
      if (t < f) {
        err.textContent = "To Date cannot be before From Date.";
        return;
      }
      if (t > today || f > today) {
        err.textContent = "Dates cannot be in the future.";
        return;
      }

      state.customDateRange = { from: f, to: t };
      pop.hidden = true;
      renderDashboardPage();
    };

    $("#cancelRange").onclick = () => {
      fromInput.value = toYMD(state.customDateRange.from);
      toInput.value = toYMD(state.customDateRange.to);
      err.textContent = "";
      pop.hidden = true;
      renderDateRangeLabel();
    };
  }

  // -----------------------------
  // Upload page rendering + behavior
  // -----------------------------
  function renderUploadPage() {
    // Upload card
    const uploadSlot = $("#uploadCard");
    uploadSlot.innerHTML = "";

    const uploadCard = createCard("Upload Document");

    const drop = document.createElement("div");
    drop.className = "upload-drop hover";
    drop.id = "dropzone";
    drop.innerHTML = `
      <i data-lucide="upload" class="icon" style="width:48px;height:48px;opacity:0.55;"></i>
      <h3>Drag and drop your file here</h3>
      <p>or click to browse</p>
      <input type="file" id="fileInput" hidden accept=".pdf,.docx,.xlsx,.pptx,.doc,.xls,.ppt" />
      <button class="btn" type="button" id="selectFileBtn">Select File</button>
      <div class="file-types">
        <span class="badge badge-secondary">PDF</span>
        <span class="badge badge-secondary">DOCX</span>
        <span class="badge badge-secondary">XLSX</span>
        <span class="badge badge-secondary">PPTX</span>
      </div>
    `;

    uploadCard.body.appendChild(drop);
    uploadSlot.appendChild(uploadCard.node);

    // Wire dropzone
    const fileInput = $("#fileInput");
    const selectBtn = $("#selectFileBtn");

    selectBtn.onclick = () => fileInput.click();

    fileInput.onchange = (e) => {
      const files = e.target.files;
      handleFileUpload(files);
      fileInput.value = "";
    };

    drop.addEventListener("dragover", (e) => {
      e.preventDefault();
      drop.classList.add("dragging");
    });
    drop.addEventListener("dragleave", (e) => {
      e.preventDefault();
      drop.classList.remove("dragging");
    });
    drop.addEventListener("drop", (e) => {
      e.preventDefault();
      drop.classList.remove("dragging");
      handleFileUpload(e.dataTransfer.files);
    });

    drop.addEventListener("click", (e) => {
      if (e.target && (e.target.id === "selectFileBtn" || e.target.closest("#selectFileBtn"))) return;
      fileInput.click();
    });

    const listSlot = $("#uploadedListCard");
    listSlot.innerHTML = "";

    const listCard = createCard(`Uploaded Files (${state.uploadedFiles.length})`);

    if (state.uploadedFiles.length === 0) {
      const empty = document.createElement("div");
      empty.className = "center";
      empty.style.padding = "28px 0";
      empty.innerHTML = `
        <i data-lucide="file-text" class="icon" style="width:48px;height:48px;opacity:0.55;"></i>
        <p class="muted" style="margin:10px 0 0;font-size:13px;">No files uploaded yet</p>
      `;
      listCard.body.appendChild(empty);
    } else {
      const wrap = document.createElement("div");
      wrap.style.display = "flex";
      wrap.style.flexDirection = "column";
      wrap.style.gap = "12px";

      state.uploadedFiles.forEach((file) => {
        wrap.appendChild(createUploadedFileRow(file, file.id === state.selectedFileId));
      });
      listCard.body.appendChild(wrap);
    }

    listSlot.appendChild(listCard.node);

    const qrSlot = $("#qrCard");
    qrSlot.innerHTML = "";

    const qrCard = createCard("QR Code");

    const selected = state.uploadedFiles.find(f => f.id === state.selectedFileId) || null;

    if (!selected) {
      const empty = document.createElement("div");
      empty.className = "center";
      empty.style.padding = "18px 0";
      empty.innerHTML = `
        <div class="qr-placeholder" style="margin-bottom:14px;">
          <i data-lucide="file-text" class="icon" style="width:64px;height:64px;opacity:0.55;"></i>
        </div>
        <p class="muted" style="margin:0;font-size:13px;">Select a file to view its QR code</p>
      `;
      qrCard.body.appendChild(empty);
    } else {
      const wrap = document.createElement("div");
      wrap.style.display = "flex";
      wrap.style.flexDirection = "column";
      wrap.style.gap = "14px";

      const qrBox = document.createElement("div");
      qrBox.className = "qr-box";
      const qrDiv = document.createElement("div");
      qrDiv.id = "qrCanvasMount";
      qrDiv.style.width = "100%";
      qrDiv.style.display = "grid";
      qrDiv.style.placeItems = "center";
      qrBox.appendChild(qrDiv);

      const fileInfo = document.createElement("div");
      fileInfo.className = "row gap-8";
      fileInfo.style.alignItems = "flex-start";
      fileInfo.innerHTML = `
        <i data-lucide="check-circle-2" class="icon" style="color:#16a34a;margin-top:2px;"></i>
        <div>
          <p style="margin:0;font-weight:800;font-size:13px;">${escapeHtml(selected.name)}</p>
          <p class="muted" style="margin:4px 0 0;font-size:12px;">File ID: ${escapeHtml(selected.id)}</p>
        </div>
      `;

      const dlBtn = document.createElement("button");
      dlBtn.className = "btn btn-outline";
      dlBtn.style.width = "100%";
      dlBtn.type = "button";
      dlBtn.innerHTML = `<i data-lucide="download" class="icon"></i> Download QR Code`;
      dlBtn.onclick = () => downloadQR(selected);

      const info = document.createElement("div");
      info.className = "info-box";
      info.innerHTML = `<strong>Instructions:</strong> Scan this QR code at the kiosk to access and print your document.`;

      wrap.append(qrBox, fileInfo, dlBtn, info);
      qrCard.body.appendChild(wrap);

      renderQR(selected.qrCodeData);
    }

    qrSlot.appendChild(qrCard.node);

    lucide.createIcons();
  }

  function handleFileUpload(fileList) {
    if (!fileList || !fileList.length) return;

    const file = fileList[0];
    const dot = file.name.lastIndexOf(".");
    const ext = dot >= 0 ? file.name.slice(dot).toLowerCase() : "";

    if (!ALLOWED_TYPES.includes(file.type) && !ALLOWED_EXTENSIONS.includes(ext)) {
      toast("error", "Invalid file type", "Only PDF, DOCX, XLSX, and PPTX files are allowed.");
      return;
    }

    const fileId = `FILE-${Date.now()}-${Math.random().toString(36).slice(2, 11).toUpperCase()}`;
    const newFile = {
      id: fileId,
      name: file.name,
      size: file.size,
      type: file.type || ext,
      uploadDate: new Date(),
      qrCodeData: generateQRCodeData(fileId),
    };

    state.uploadedFiles = [newFile, ...state.uploadedFiles];
    state.selectedFileId = newFile.id;

    toast("success", "File uploaded successfully!", `${file.name} is ready for printing.`);
    renderUploadPage();
  }

  function renderQR(value) {
    const mount = $("#qrCanvasMount");
    if (!mount) return;
    mount.innerHTML = "";

    state.qr = new QRCode(mount, {
      text: value,
      width: 256,
      height: 256,
      correctLevel: QRCode.CorrectLevel.H,
    });

    const canvas = mount.querySelector("canvas");
    if (canvas) {
      canvas.style.width = "100%";
      canvas.style.height = "auto";
      canvas.style.maxWidth = "256px";
    }
  }

  function downloadQR(file) {
    const mount = $("#qrCanvasMount");
    const canvas = mount ? mount.querySelector("canvas") : null;
    if (!canvas) return;

    const a = document.createElement("a");
    a.download = `QR-${file.name}.png`;
    a.href = canvas.toDataURL("image/png");
    a.click();
  }

  // -----------------------------
  // Header clock
  // -----------------------------
  function tickHeaderClock() {
    const now = new Date();
    $("#headerDate").textContent = formatDateLong(now);
    $("#headerTime").textContent = formatTimeLong(now);
  }

  // -----------------------------
  // Boot
  // -----------------------------
  document.addEventListener("DOMContentLoaded", () => {
    tickHeaderClock();
    setInterval(tickHeaderClock, 1000);

if (!requireAuth()) return;

setRoute(getHashRoute());

if (state.route === "/upload") {
  renderUploadPage();
} else {
  renderDashboardPage();
}
    
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
      logoutBtn.onclick = () => {
        localStorage.removeItem("kiosk_auth");
        window.location.href = "./login.html";
      };
    }

  });
})();