
// ========== Theme Toggle ==========
(function initTheme() {
  const toggle = document.querySelector("[data-theme-toggle]");
  const root = document.documentElement;
  let theme = matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
  root.setAttribute("data-theme", theme);

  if (toggle) {
    updateToggleIcon(toggle, theme);
    toggle.addEventListener("click", function () {
      theme = theme === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", theme);
      updateToggleIcon(toggle, theme);
      // Re-render charts with new theme colors
      if (activeCategory === "market-intelligence") {
        if (currentView === "detail" && currentCompany) {
          renderDetailView(currentCompany);
        } else if (currentView === "compare" && activeComparison) {
          renderComparisonChart(activeComparison);
        }
      }
    });
  }

  function updateToggleIcon(btn, t) {
    btn.setAttribute(
      "aria-label",
      "Switch to " + (t === "dark" ? "light" : "dark") + " mode"
    );
    btn.innerHTML =
      t === "dark"
        ? '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>'
        : '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
  }
})();

// ========== State ==========
let companiesData = [];
let currentView = "overview"; // 'overview' | 'detail' | 'compare' | 'iframe'
let currentCompany = null;
let activeComparison = null;
let activeSector = "all";
let chartInstances = [];
let activeCategory = "market-intelligence";
let activeSubPage = null;

const countryFlags = {
  US: "\u{1F1FA}\u{1F1F8}",
  TW: "\u{1F1F9}\u{1F1FC}",
  SA: "\u{1F1F8}\u{1F1E6}",
  KR: "\u{1F1F0}\u{1F1F7}",
  CN: "\u{1F1E8}\u{1F1F3}",
  NL: "\u{1F1F3}\u{1F1F1}",
  CH: "\u{1F1E8}\u{1F1ED}",
  GB: "\u{1F1EC}\u{1F1E7}",
  FR: "\u{1F1EB}\u{1F1F7}",
  JP: "\u{1F1EF}\u{1F1F5}",
};

const sectorColors = {
  Technology: "var(--color-accent-blue)",
  Semiconductors: "var(--color-accent-purple)",
  Finance: "var(--color-accent-teal)",
  Healthcare: "var(--color-accent-rose)",
  Energy: "var(--color-accent-orange)",
  Retail: "var(--color-accent-amber)",
  "Automotive/Energy": "var(--color-accent-orange)",
  Automotive: "var(--color-accent-orange)",
  Conglomerate: "var(--color-text-muted)",
  "Consumer Goods": "var(--color-accent-amber)",
  Luxury: "var(--color-accent-purple)",
  "Industrials/Defense": "var(--color-text-muted)",
  Industrials: "var(--color-text-muted)",
  Entertainment: "var(--color-accent-rose)",
};

// ========== Category Definitions ==========
var CATEGORIES = {
  "market-intelligence": {
    title: "Sectors",
    type: "filters", // special: uses sector filters + compare
    items: [
      { id: "all", label: "All Companies", icon: "grid" },
      { id: "Technology", label: "Technology", icon: "cpu" },
      { id: "Semiconductors", label: "Semiconductors", icon: "chip" },
      { id: "Finance", label: "Finance", icon: "dollar" },
      { id: "Healthcare", label: "Healthcare", icon: "heart" },
      { id: "Energy", label: "Energy", icon: "bolt" },
      { id: "Retail", label: "Retail", icon: "cart" },
      { id: "other", label: "Other", icon: "dots" },
    ],
    extra: [
      { id: "compare", label: "Compare Metrics", icon: "chart", action: "compare" },
    ],
    links: [
      { id: "sp500-universe", label: "S&P 500 Universe", url: "./SP500_Bubble_Chart/index.html", icon: "globe" },
      { id: "sp500", label: "S&P 500 Overview", url: "./sp500.html", icon: "trending" },
    ],
  },
  dividends: {
    title: "Dividend Research",
    type: "pages",
    items: [
      { id: "us-dividends", label: "US Dividend Top 50", url: "./dividend-intelligence.html", icon: "dollar", desc: "Dividend yields & growth for top US companies" },
      { id: "hk-dividends", label: "HK Dividend Top 50", url: "./hkex-dividend-intelligence.html", icon: "dollar", desc: "Hong Kong Exchange dividend intelligence" },
      { id: "premier-dividends", label: "Premier Dividend Top 50", url: "./premier-dividend-top50.html", icon: "star", desc: "Elite global dividend payers" },
    ],
  },
  "value-moats": {
    title: "Value & Moats",
    type: "pages",
    items: [
      { id: "value-compass", label: "Value Compass", url: "./value_compass.html", icon: "compass", desc: "10 Graham–Buffett Picks 2026" },
      { id: "value-compass-gemini", label: "Value Compass (Gemini)", url: "./value_Gemini.html", icon: "sparkle", desc: "AI-powered value stock screening" },
      { id: "economic-moats", label: "Economic Moats", url: "./economic-moats.html", icon: "shield", desc: "Analyzing the Tech Giants' moats" },
      { id: "moat-claude", label: "Moat Analysis (Claude)", url: "./moat-analysis.html", icon: "fortress", desc: "Fortress Profits — Global Tech Moat Analysis" },
      { id: "greenwald-framework", label: "Greenwald Neglect Framework", url: "./greenwald-neglect-framework.html", icon: "doc", desc: "Screening for structurally under-researched companies" },
    ],
  },
  "stock-analysis": {
    title: "Stock Analysis",
    type: "grouped-pages",
    groups: [
      {
        label: "China / Hong Kong",
        items: [
          { id: "tme-analysis", label: "Tencent Music (TME)", url: "./investment-analysis-tencent_music.html", icon: "doc" },
          { id: "pdd-analysis", label: "PDD Holdings", url: "./pdd-analysis.html", icon: "doc" },
          { id: "pdd-report", label: "PDD Investment Report", url: "./pdd_investment_report.html", icon: "doc" },
          { id: "ntes-analysis", label: "NetEase (NTES)", url: "./ntes-analysis.html", icon: "doc" },
          { id: "byd-fy2025", label: "BYD FY2025 Analysis", url: "./BYD_FY2025_Value_Investing_Analysis.html", icon: "doc" },
          { id: "byd-apr2026", label: "BYD Apr 2026 Update", url: "./byd_investment_analysis_updated_apr2026.html", icon: "doc" },
          { id: "fosun-fy2025", label: "Fosun Int'l FY2025", url: "./fosun_fy25_analysis.html", icon: "doc" },
          { id: "xiaomi", label: "Xiaomi (1810.HK)", url: "./xiaomi_investment_analysis.html", icon: "doc" },
          { id: "xiaomi-intrinsic", label: "Xiaomi Intrinsic Value", url: "./xiaomi-1810hk-intrinsic-value-report.html", icon: "doc" },
          { id: "popmart", label: "Pop Mart (9992.HK)", url: "./popmart-9992hk-report-202604.html", icon: "doc" },
          { id: "hsbc-analysis", label: "HSBC Holdings (0005.HK)", url: "./hsbc-analysis.html", icon: "doc" },
          { id: "dahsing-analysis", label: "Dah Sing Financial (0440.HK)", url: "./dahsing-0440-deep-analysis.html", icon: "doc" },
          { id: "kinetic-analysis", label: "Kinetic Development (1277.HK)", url: "./kinetic-1277-deep-analysis.html", icon: "doc" },
          { id: "alibaba-dashboard", label: "Alibaba (BABA / 9988.HK)", url: "./alibaba-dashboard.html", icon: "doc" },
          { id: "tencent-dashboard", label: "Tencent Holdings (0700.HK)", url: "./tencent-dashboard.html", icon: "doc" },
          { id: "pingan-dashboard", label: "Ping An Insurance (2318.HK)", url: "./pingan_dashboard.html", icon: "doc" },
          { id: "moutai-claude", label: "Kweichow Moutai (Claude)", url: "./Kweichow_Moutai_Value_Investing_Analysis_Claude.html", icon: "doc" },
          { id: "moutai-dashboard", label: "Kweichow Moutai (Dashboard)", url: "./moutai_vi_analysis_workbuddy.html", icon: "chart" },
          { id: "hk-ai-beneficiaries", label: "HK AI Beneficiaries Top 10", url: "./hk-ai-beneficiaries-top10.html", icon: "chart" },
          { id: "ck-hutchison-asset", label: "CK Hutchison & Asset", url: "./CK_Hutchison_CK_Asset_Investment_Report.html", icon: "doc" },
          { id: "jd-report", label: "JD.com (9618.HK)", url: "./report_JD_2026-04-19.html", icon: "doc" },
          { id: "tsugami-report", label: "Precision Tsugami (1651.HK)", url: "./report_1651HK_2026-04-21.html", icon: "doc" },
          { id: "hk-neglect-screen", label: "HK Neglect Screen", url: "./hk-neglect-screen-apr2026.html", icon: "doc" },
        ],
      },
      {
        label: "United States",
        items: [
          { id: "berkshire", label: "Berkshire Hathaway", url: "./berkshire_hathaway_report.html", icon: "doc" },
          { id: "pfizer", label: "Pfizer (PFE)", url: "./report_PFE_2026-04-17.html", icon: "doc" },
          { id: "cybersec-trio", label: "Cybersecurity Trio", url: "./CYBERSEC_TRIO_Dashboard.html", icon: "doc" },
          { id: "intu", label: "Intuit (INTU)", url: "./INTU_Dashboard.html", icon: "doc" },
        ],
      },
      {
        label: "India",
        items: [
          { id: "india-adr", label: "India ADR Dashboard", url: "./india-adr-dashboard.html", icon: "chart" },
          { id: "india-list", label: "India Dual-Listed", url: "./india_list.html", icon: "list" },
        ],
      },
      {
        label: "AI Infrastructure & Thematic",
        items: [
          { id: "gtc2026", label: "GTC 2026 Analysis", url: "./gtc2026_jensen_huang_analysis.html", icon: "event" },
          { id: "us-ai-beneficiaries", label: "US AI Beneficiaries Top 10", url: "./us-ai-beneficiaries-top10.html", icon: "chart" },
          { id: "copper-electricity-ai", label: "Copper & Electricity AI Infra", url: "./copper-electricity-ai-infrastructure-top10.html", icon: "bolt" },
        ],
      },
    ],
  },
  "portfolio-strategy": {
    title: "Portfolio Strategy",
    type: "pages",
    items: [
      { id: "hk-portfolio", label: "HK Value Portfolio", url: "./hk-value-portfolio-analysis.html", icon: "chart", desc: "10-Year Simulation vs S&P 500" },
      { id: "global-portfolio", label: "Global Value Portfolio", url: "./global-value-portfolio-report.html", icon: "globe", desc: "10 High-Conviction Picks" },
      { id: "portfolio-blueprint", label: "$100K Portfolio Blueprint", url: "./portfolio-blueprint.html", icon: "blueprint", desc: "20-Year Horizon Strategy" },
    ],
  },
};

// ========== Icon Helper ==========
function getIcon(name, size) {
  size = size || 16;
  var icons = {
    grid: '<path d="M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z"/>',
    cpu: '<rect x="4" y="4" width="16" height="16" rx="2"/><path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 14h3M1 9h3M1 14h3"/>',
    chip: '<rect x="5" y="5" width="14" height="14" rx="2"/><path d="M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M19 9h3M2 15h3M19 15h3"/>',
    dollar: '<path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>',
    heart: '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>',
    bolt: '<path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>',
    cart: '<circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>',
    dots: '<circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>',
    chart: '<path d="M18 20V10M12 20V4M6 20v-6"/>',
    globe: '<circle cx="12" cy="12" r="10"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/><path d="M2 12h20"/>',
    trending: '<polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>',
    star: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
    compass: '<circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>',
    sparkle: '<path d="M12 3L14.5 9.5L21 12L14.5 14.5L12 21L9.5 14.5L3 12L9.5 9.5L12 3Z"/>',
    shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
    fortress: '<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>',
    doc: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>',
    list: '<line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>',
    event: '<rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>',
    blueprint: '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>',
  };
  var d = icons[name] || icons["doc"];
  return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + d + '</svg>';
}

// ========== Load Data ==========
async function loadData() {
  if (typeof COMPANIES_DATA !== 'undefined') {
    companiesData = COMPANIES_DATA;
    init();
    return;
  }

  try {
    const res = await fetch("./data.json");
    companiesData = await res.json();
    init();
  } catch (err) {
    document.getElementById("companiesGrid").innerHTML =
      '<p style="color:var(--color-error);">Failed to load data.</p>';
  }
}

function init() {
  renderOverview();
  setupSearch();
  setupNavigation();
  setupSidebar();
  setupTopTabs();
  renderSidebarForCategory("market-intelligence");
}

// ========== Top Tab Navigation ==========
function setupTopTabs() {
  var tabs = document.querySelectorAll(".top-tab");
  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      var category = tab.getAttribute("data-category");
      switchCategory(category);
    });
  });
}

function switchCategory(category) {
  activeCategory = category;

  // Update tab active state
  document.querySelectorAll(".top-tab").forEach(function (t) {
    t.classList.toggle("active", t.getAttribute("data-category") === category);
  });

  // Render sidebar for this category
  renderSidebarForCategory(category);

  // Show appropriate main content
  if (category === "market-intelligence") {
    hideIframe();
    showView("overview");
    activeSector = "all";
    renderOverview();
  } else {
    var catDef = CATEGORIES[category];
    if (catDef.type === "pages" && catDef.items.length > 0) {
      loadSubPage(catDef.items[0].id, catDef.items[0].url);
    } else if (catDef.type === "grouped-pages" && catDef.groups.length > 0 && catDef.groups[0].items.length > 0) {
      loadSubPage(catDef.groups[0].items[0].id, catDef.groups[0].items[0].url);
    }
  }

  // Expand sidebar if collapsed
  var sidebar = document.getElementById("appSidebar");
  if (sidebar.classList.contains("collapsed")) {
    sidebar.classList.remove("collapsed");
  }
}

// ========== Sidebar Rendering ==========
function renderSidebarForCategory(category) {
  var catDef = CATEGORIES[category];
  var nav = document.getElementById("sidebarNav");
  var title = document.getElementById("sidebarTitle");
  title.textContent = catDef.title;

  var html = "";

  if (catDef.type === "filters") {
    // Market Intelligence: sector filters
    catDef.items.forEach(function (item) {
      var isActive = activeSector === item.id;
      html += '<button class="sidebar-filter' + (isActive ? ' active' : '') + '" data-filter="' + item.id + '">' +
        getIcon(item.icon) +
        '<span class="sidebar-filter-text">' + item.label + '</span>' +
        '</button>';
    });

    // Divider
    html += '<div class="sidebar-divider"></div>';

    // Extra actions (Compare)
    if (catDef.extra) {
      catDef.extra.forEach(function (item) {
        html += '<button class="sidebar-link" data-action="' + item.action + '">' +
          getIcon(item.icon) +
          '<span class="sidebar-link-text">' + item.label + '</span>' +
          '</button>';
      });
    }

    // Links (S&P 500 etc)
    if (catDef.links) {
      html += '<div class="sidebar-divider"></div>';
      html += '<div class="sidebar-group-label">Explore</div>';
      catDef.links.forEach(function (item) {
        html += '<button class="sidebar-link" data-subpage="' + item.id + '" data-url="' + item.url + '">' +
          getIcon(item.icon) +
          '<span class="sidebar-link-text">' + item.label + '</span>' +
          '</button>';
      });
    }
  } else if (catDef.type === "pages") {
    // Simple list of pages
    catDef.items.forEach(function (item, idx) {
      var isActive = activeSubPage === item.id || (activeSubPage === null && idx === 0);
      html += '<button class="sidebar-link' + (isActive ? ' active' : '') + '" data-subpage="' + item.id + '" data-url="' + item.url + '">' +
        getIcon(item.icon) +
        '<span class="sidebar-link-text">' + item.label + '</span>' +
        '</button>';
    });
  } else if (catDef.type === "grouped-pages") {
    // Grouped pages with labels
    catDef.groups.forEach(function (group, gi) {
      if (gi > 0) html += '<div class="sidebar-divider"></div>';
      html += '<div class="sidebar-group-label">' + group.label + '</div>';
      group.items.forEach(function (item) {
        var isActive = activeSubPage === item.id;
        html += '<button class="sidebar-link' + (isActive ? ' active' : '') + '" data-subpage="' + item.id + '" data-url="' + item.url + '">' +
          getIcon(item.icon) +
          '<span class="sidebar-link-text">' + item.label + '</span>' +
          '</button>';
      });
    });
  }

  nav.innerHTML = html;

  // Attach event listeners
  if (catDef.type === "filters") {
    nav.querySelectorAll(".sidebar-filter").forEach(function (btn) {
      btn.addEventListener("click", function () {
        nav.querySelectorAll(".sidebar-filter").forEach(function (b) { b.classList.remove("active"); });
        btn.classList.add("active");
        activeSector = btn.getAttribute("data-filter");
        hideIframe();
        showView("overview");
        renderOverview();

        // De-activate sub-page links
        nav.querySelectorAll(".sidebar-link").forEach(function (l) { l.classList.remove("active"); });
      });
    });

    nav.querySelectorAll("[data-action]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var action = btn.getAttribute("data-action");
        if (action === "compare") {
          hideIframe();
          showView("compare");
          renderCompareView();
        }
      });
    });
  }

  // Sub-page links (works for all types)
  nav.querySelectorAll("[data-subpage]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var pageId = btn.getAttribute("data-subpage");
      var url = btn.getAttribute("data-url");
      loadSubPage(pageId, url);

      // Update active state
      nav.querySelectorAll(".sidebar-link").forEach(function (l) { l.classList.remove("active"); });
      nav.querySelectorAll(".sidebar-filter").forEach(function (f) { f.classList.remove("active"); });
      btn.classList.add("active");
    });
  });
}

// ========== Iframe Sub-Page Loading ==========
function loadSubPage(pageId, url) {
  activeSubPage = pageId;
  destroyCharts();

  // Show iframe view
  showView("iframe");

  var frame = document.getElementById("contentFrame");
  var loading = document.getElementById("iframeLoading");

  frame.classList.add("loading");
  loading.classList.add("visible");

  frame.onload = function () {
    frame.classList.remove("loading");
    loading.classList.remove("visible");
  };
  frame.src = url;
}

function hideIframe() {
  var frame = document.getElementById("contentFrame");
  var loading = document.getElementById("iframeLoading");
  frame.src = "about:blank";
  frame.classList.remove("loading");
  loading.classList.remove("visible");
  activeSubPage = null;
}

// ========== Sidebar ==========
function setupSidebar() {
  var toggleBtn = document.getElementById("sidebarToggleBtn");
  var sidebar = document.getElementById("appSidebar");
  if (toggleBtn && sidebar) {
    toggleBtn.addEventListener("click", function () {
      sidebar.classList.toggle("collapsed");
    });
  }
}

// ========== Navigation ==========
function setupNavigation() {
  document.getElementById("backBtn").addEventListener("click", function () {
    if (activeCategory === "market-intelligence") {
      hideIframe();
      showView("overview");
      // Re-render sidebar to reflect filter state
      renderSidebarForCategory("market-intelligence");
    } else {
      // Go back to first sub-page of current category
      switchCategory(activeCategory);
    }
  });
  document.getElementById("logoBtn").addEventListener("click", function () {
    switchCategory("market-intelligence");
  });
}

function showView(view) {
  destroyCharts();
  currentView = view;

  document.querySelectorAll(".view").forEach(function (v) {
    v.classList.remove("active");
  });

  if (view === "iframe") {
    document.getElementById("iframeView").classList.add("active");
  } else {
    document.getElementById(view + "View").classList.add("active");
  }

  var backBtn = document.getElementById("backBtn");
  backBtn.style.display = (view === "overview" || view === "iframe") ? "none" : "flex";
}

// ========== Search ==========
function setupSearch() {
  var input = document.getElementById("searchInput");
  var results = document.getElementById("searchResults");

  input.addEventListener("input", function () {
    var q = input.value.toLowerCase().trim();
    if (q.length < 1) {
      results.classList.remove("active");
      return;
    }

    var matches = companiesData.filter(function (c) {
      return (
        c.company.toLowerCase().includes(q) ||
        (c.ticker && c.ticker.toLowerCase().includes(q)) ||
        (c.sector && c.sector.toLowerCase().includes(q))
      );
    });

    if (matches.length === 0) {
      results.classList.remove("active");
      return;
    }

    results.innerHTML = matches
      .slice(0, 8)
      .map(function (c) {
        return (
          '<div class="search-result-item" data-company="' +
          c.company +
          '">' +
          '<span class="search-result-rank">#' +
          c.rank +
          "</span>" +
          '<span class="search-result-name">' +
          c.company +
          "</span>" +
          '<span class="search-result-ticker">' +
          (c.ticker || "") +
          "</span>" +
          "</div>"
        );
      })
      .join("");

    results.classList.add("active");

    results.querySelectorAll(".search-result-item").forEach(function (item) {
      item.addEventListener("click", function () {
        var name = item.getAttribute("data-company");
        var company = companiesData.find(function (c) {
          return c.company === name;
        });
        if (company) {
          // Switch to Market Intelligence if not already there
          if (activeCategory !== "market-intelligence") {
            activeCategory = "market-intelligence";
            document.querySelectorAll(".top-tab").forEach(function (t) {
              t.classList.toggle("active", t.getAttribute("data-category") === "market-intelligence");
            });
            renderSidebarForCategory("market-intelligence");
          }
          hideIframe();
          currentCompany = company;
          showView("detail");
          renderDetailView(company);
        }
        results.classList.remove("active");
        input.value = "";
      });
    });
  });

  document.addEventListener("click", function (e) {
    if (!document.getElementById("searchWrapper").contains(e.target)) {
      results.classList.remove("active");
    }
  });
}

// ========== Overview Rendering ==========
function renderOverview() {
  var grid = document.getElementById("companiesGrid");
  var filtered = companiesData;

  var mainSectors = [
    "Technology",
    "Semiconductors",
    "Finance",
    "Healthcare",
    "Energy",
    "Retail",
  ];

  if (activeSector !== "all") {
    if (activeSector === "other") {
      filtered = companiesData.filter(function (c) {
        return !mainSectors.includes(c.sector);
      });
    } else {
      filtered = companiesData.filter(function (c) {
        return c.sector === activeSector;
      });
    }
  }

  grid.innerHTML = filtered
    .map(function (c) {
      var metricsPreview = c.metrics
        .slice(0, 3)
        .map(function (m) {
          var latest =
            m.data.length > 0 ? m.data[m.data.length - 1].value : null;
          var formatted = latest !== null ? formatValue(latest, m.unit) : "N/A";
          return (
            '<div class="card-metric-row">' +
            '<span class="card-metric-name" title="' +
            escapeHtml(m.name) +
            '">' +
            truncate(m.name, 30) +
            "</span>" +
            '<span class="card-metric-value">' +
            formatted +
            "</span>" +
            "</div>"
          );
        })
        .join("");

      var extraCount =
        c.metrics.length > 3 ? c.metrics.length - 3 + " more metrics" : "";

      return (
        '<div class="company-card" data-company="' +
        c.company +
        '">' +
        '<div class="card-top">' +
        '<span class="card-rank">#' +
        c.rank +
        "</span>" +
        '<span class="card-sector">' +
        (c.sector || "") +
        "</span>" +
        "</div>" +
        '<div class="card-company">' +
        (countryFlags[c.country] || "") +
        " " +
        c.company +
        "</div>" +
        '<div class="card-ticker">' +
        (c.ticker || "") +
        "</div>" +
        '<div class="card-mcap">' +
        '<span class="card-mcap-value">' +
        (c.marketCap || "") +
        "</span>" +
        '<span class="card-mcap-label">Market Cap</span>' +
        "</div>" +
        '<div class="card-metrics">' +
        metricsPreview +
        (extraCount
          ? '<div class="card-metric-count">' + extraCount + "</div>"
          : "") +
        "</div>" +
        "</div>"
      );
    })
    .join("");

  grid.querySelectorAll(".company-card").forEach(function (card) {
    card.addEventListener("click", function () {
      var name = card.getAttribute("data-company");
      var company = companiesData.find(function (c) {
        return c.company === name;
      });
      if (company) {
        currentCompany = company;
        showView("detail");
        renderDetailView(company);
      }
    });
  });
}

// ========== Detail View ==========
function renderDetailView(company) {
  destroyCharts();
  var header = document.getElementById("detailHeader");
  var grid = document.getElementById("chartsGrid");

  header.innerHTML =
    '<div class="detail-company-info">' +
    "<h1>" +
    (countryFlags[company.country] || "") +
    " " +
    company.company +
    "</h1>" +
    '<div class="detail-meta">' +
    metaItem("Ticker", company.ticker || "N/A") +
    metaItem("Market Cap", company.marketCap || "N/A") +
    metaItem("Sector", company.sector || "N/A") +
    metaItem("Rank", "#" + company.rank) +
    "</div>" +
    "</div>";

  if (company.metrics.length === 0) {
    grid.innerHTML =
      '<div class="compare-empty"><p>No charted metrics available for this company.</p></div>';
    return;
  }

  grid.innerHTML = company.metrics
    .map(function (m, i) {
      var growth = calcGrowth(m.data);
      var growthClass = growth >= 0 ? "positive" : "negative";
      var growthStr =
        growth !== null
          ? (growth >= 0 ? "+" : "") + growth.toFixed(1) + "% total"
          : "";

      return (
        '<div class="chart-card">' +
        '<div class="chart-title">' +
        escapeHtml(m.name) +
        "</div>" +
        '<div class="chart-unit">' +
        escapeHtml(m.unit) +
        "</div>" +
        '<div class="chart-container"><canvas id="chart-' +
        i +
        '"></canvas></div>' +
        '<div class="chart-footer">' +
        '<span class="chart-growth ' +
        growthClass +
        '">' +
        growthStr +
        "</span>" +
        '<button class="chart-compare-btn" data-metric="' +
        escapeHtml(m.name) +
        '">Compare across companies</button>' +
        "</div>" +
        "</div>"
      );
    })
    .join("");

  // Render charts
  var style = getComputedStyle(document.documentElement);
  company.metrics.forEach(function (m, i) {
    var canvas = document.getElementById("chart-" + i);
    if (!canvas || m.data.length === 0) return;

    var labels = m.data.map(function (d) {
      return d.year;
    });
    var values = m.data.map(function (d) {
      return d.value;
    });

    var chartColor = style.getPropertyValue("--chart-1").trim();
    var textColor = style.getPropertyValue("--color-text").trim();
    var mutedColor = style.getPropertyValue("--color-text-muted").trim();
    var dividerColor = style.getPropertyValue("--color-divider").trim();

    var chart = new Chart(canvas, {
      type: values.length <= 3 ? "bar" : "line",
      data: {
        labels: labels,
        datasets: [
          {
            label: m.name,
            data: values,
            borderColor: chartColor,
            backgroundColor:
              values.length <= 3 ? chartColor + "cc" : chartColor + "18",
            borderWidth: 2.5,
            fill: values.length > 3,
            tension: 0.35,
            pointRadius: 4,
            pointHoverRadius: 7,
            pointBackgroundColor: chartColor,
            pointBorderColor:
              style.getPropertyValue("--color-surface").trim(),
            pointBorderWidth: 2,
            barPercentage: 0.6,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { intersect: false, mode: "index" },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor:
              style.getPropertyValue("--color-surface").trim(),
            titleColor: textColor,
            bodyColor: textColor,
            borderColor: dividerColor,
            borderWidth: 1,
            padding: 12,
            titleFont: { family: "Inter", weight: "600" },
            bodyFont: { family: "JetBrains Mono" },
            callbacks: {
              label: function (ctx) {
                return formatValue(ctx.parsed.y, m.unit);
              },
            },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: mutedColor, font: { family: "JetBrains Mono", size: 11 } },
            border: { color: dividerColor },
          },
          y: {
            grid: { color: dividerColor + "60" },
            ticks: {
              color: mutedColor,
              font: { family: "JetBrains Mono", size: 11 },
              callback: function (v) {
                return formatCompact(v);
              },
            },
            border: { display: false },
            beginAtZero: shouldBeginAtZero(values),
          },
        },
        animation: { duration: 700, easing: "easeOutQuart" },
      },
    });
    chartInstances.push(chart);
  });

  // Compare buttons
  grid.querySelectorAll(".chart-compare-btn").forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      var metricName = btn.getAttribute("data-metric");
      showView("compare");
      renderCompareView();
      selectComparison(metricName);
    });
  });
}

function metaItem(label, value) {
  return (
    '<div class="detail-meta-item">' +
    '<span class="detail-meta-label">' +
    label +
    "</span>" +
    '<span class="detail-meta-value">' +
    value +
    "</span>" +
    "</div>"
  );
}

// ========== Compare View ==========
function renderCompareView() {
  var sidebar = document.getElementById("compareSidebar");

  var metricMap = {};
  companiesData.forEach(function (c) {
    c.metrics.forEach(function (m) {
      var normalized = normalizeMetricName(m.name);
      if (!metricMap[normalized]) {
        metricMap[normalized] = { name: m.name, unit: m.unit, companies: [] };
      }
      metricMap[normalized].companies.push({
        company: c.company,
        ticker: c.ticker,
        data: m.data,
      });
    });
  });

  var compareGroups = buildCompareGroups(metricMap);

  sidebar.innerHTML = compareGroups
    .map(function (g) {
      return (
        '<button class="compare-category" data-group="' +
        escapeHtml(g.id) +
        '">' +
        escapeHtml(g.label) +
        '<span class="compare-category-count">' +
        g.count +
        " cos</span>" +
        "</button>"
      );
    })
    .join("");

  sidebar.querySelectorAll(".compare-category").forEach(function (btn) {
    btn.addEventListener("click", function () {
      sidebar.querySelectorAll(".compare-category").forEach(function (b) {
        b.classList.remove("active");
      });
      btn.classList.add("active");
      var groupId = btn.getAttribute("data-group");
      var group = compareGroups.find(function (g) {
        return g.id === groupId;
      });
      if (group) {
        activeComparison = group;
        renderComparisonChart(group);
      }
    });
  });

  if (activeComparison) {
    var target = sidebar.querySelector(
      '[data-group="' + activeComparison.id + '"]'
    );
    if (target) {
      target.click();
    }
  }
}

function selectComparison(metricName) {
  var sidebar = document.getElementById("compareSidebar");
  var normalized = normalizeMetricName(metricName);

  var btn = Array.from(sidebar.querySelectorAll(".compare-category")).find(
    function (b) {
      return (
        normalizeMetricName(b.getAttribute("data-group")).indexOf(
          normalized.substring(0, 15)
        ) >= 0
      );
    }
  );

  if (btn) {
    btn.click();
  }
}

function buildCompareGroups(metricMap) {
  var groups = [];
  var categories = [
    { id: "daily_users_dau", label: "Daily Active Users", keywords: ["daily active", "dau"] },
    { id: "monthly_users_mau", label: "Monthly Active Users", keywords: ["monthly active", "mau", "wechat"] },
    { id: "subscribers", label: "Subscribers / Members", keywords: ["subscriber", "members", "membership", "paid household", "game pass", "prime member"] },
    { id: "data_center_regions", label: "Data Center Regions/Zones", keywords: ["data center", "availability zone", "cloud region", "oci region"] },
    { id: "revenue_datacenter", label: "Data Center / Cloud Revenue", keywords: ["data center revenue", "cloud revenue", "aws", "azure"] },
    { id: "ai_revenue", label: "AI Revenue", keywords: ["ai revenue", "ai semiconductor", "ai chip", "ai accelerator"] },
    { id: "market_share_memory", label: "Memory Market Share (DRAM/NAND)", keywords: ["dram market share", "nand market share", "memory market share"] },
    { id: "oil_production", label: "Oil & Gas Production", keywords: ["production", "daily oil", "crude oil", "barrels", "mmboe", "permian"] },
    { id: "ev_deliveries", label: "Vehicle Deliveries", keywords: ["deliveries", "vehicles sold", "shipments", "units sold", "smartphone ship"] },
    { id: "energy_storage", label: "Energy Storage / Renewable", keywords: ["energy storage", "gwh", "supercharger", "renewable", "carbon capture"] },
    { id: "rd_spending", label: "R&D Spending", keywords: ["r&d", "research and development"] },
    { id: "drug_revenue", label: "Key Drug / Product Revenue", keywords: ["keytruda", "humira", "skyrizi", "oncology", "pharmaceutical"] },
    { id: "transactions", label: "Payment Transactions Processed", keywords: ["transactions processed", "payment volume", "gross dollar volume", "switched transaction"] },
    { id: "stores_branches", label: "Stores / Branches / Warehouses", keywords: ["store count", "warehouse", "branch", "fulfillment center"] },
    { id: "backlog", label: "Order Backlog", keywords: ["backlog", "order book"] },
    { id: "total_assets", label: "Total Assets (Banks)", keywords: ["total asset"] },
    { id: "digital_users", label: "Digital / Online Users", keywords: ["digital active", "digital user", "online", "github", "linkedin", "developer"] },
    { id: "installed_base", label: "Installed Base / Active Devices", keywords: ["installed base", "active device", "alexa", "connected machine"] },
    { id: "capex", label: "Capital Expenditure", keywords: ["capex", "capital expenditure"] },
    { id: "euv_systems", label: "EUV / Semiconductor Equipment", keywords: ["euv", "wafer", "advanced node", "foundry"] },
  ];

  categories.forEach(function (cat) {
    var matchedCompanies = [];
    var seenCompanies = {};

    companiesData.forEach(function (c) {
      c.metrics.forEach(function (m) {
        var mLower = m.name.toLowerCase();
        var isMatch = cat.keywords.some(function (kw) {
          return mLower.includes(kw);
        });
        if (isMatch && !seenCompanies[c.company] && m.data.length >= 2) {
          seenCompanies[c.company] = true;
          matchedCompanies.push({
            company: c.company,
            ticker: c.ticker,
            metricName: m.name,
            unit: m.unit,
            data: m.data,
          });
        }
      });
    });

    if (matchedCompanies.length >= 2) {
      groups.push({
        id: cat.id,
        label: cat.label,
        count: matchedCompanies.length,
        companies: matchedCompanies,
      });
    }
  });

  groups.sort(function (a, b) {
    return b.count - a.count;
  });

  return groups;
}

function renderComparisonChart(group) {
  destroyCharts();
  var main = document.getElementById("compareMain");

  main.innerHTML =
    '<div class="compare-chart-title">' +
    escapeHtml(group.label) +
    "</div>" +
    '<div class="compare-chart-subtitle">' +
    group.count +
    " companies compared</div>" +
    '<div class="compare-chart-wrapper"><canvas id="compareChart"></canvas></div>';

  var canvas = document.getElementById("compareChart");
  var style = getComputedStyle(document.documentElement);
  var textColor = style.getPropertyValue("--color-text").trim();
  var mutedColor = style.getPropertyValue("--color-text-muted").trim();
  var dividerColor = style.getPropertyValue("--color-divider").trim();

  var chartColors = [
    style.getPropertyValue("--chart-1").trim(),
    style.getPropertyValue("--chart-2").trim(),
    style.getPropertyValue("--chart-3").trim(),
    style.getPropertyValue("--chart-4").trim(),
    style.getPropertyValue("--chart-5").trim(),
    style.getPropertyValue("--chart-6").trim(),
    style.getPropertyValue("--chart-7").trim(),
    style.getPropertyValue("--chart-8").trim(),
  ];

  var allYears = {};
  group.companies.forEach(function (c) {
    c.data.forEach(function (d) {
      allYears[d.year] = true;
    });
  });
  var years = Object.keys(allYears)
    .map(Number)
    .sort(function (a, b) {
      return a - b;
    });

  var datasets = group.companies.map(function (c, i) {
    var color = chartColors[i % chartColors.length];
    var dataMap = {};
    c.data.forEach(function (d) {
      dataMap[d.year] = d.value;
    });

    return {
      label: c.company + (c.ticker ? " (" + c.ticker + ")" : ""),
      data: years.map(function (y) {
        return dataMap[y] !== undefined ? dataMap[y] : null;
      }),
      borderColor: color,
      backgroundColor: color + "20",
      borderWidth: 2.5,
      tension: 0.3,
      pointRadius: 4,
      pointHoverRadius: 7,
      pointBackgroundColor: color,
      pointBorderColor: style.getPropertyValue("--color-surface").trim(),
      pointBorderWidth: 2,
      spanGaps: true,
    };
  });

  var unit = group.companies[0] ? group.companies[0].unit : "";

  var chart = new Chart(canvas, {
    type: "line",
    data: { labels: years, datasets: datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { intersect: false, mode: "index" },
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            color: textColor,
            padding: 16,
            usePointStyle: true,
            pointStyle: "circle",
            font: { family: "Inter", size: 12 },
          },
        },
        tooltip: {
          backgroundColor:
            style.getPropertyValue("--color-surface").trim(),
          titleColor: textColor,
          bodyColor: textColor,
          borderColor: dividerColor,
          borderWidth: 1,
          padding: 12,
          titleFont: { family: "Inter", weight: "600" },
          bodyFont: { family: "JetBrains Mono", size: 12 },
          callbacks: {
            label: function (ctx) {
              if (ctx.parsed.y === null) return null;
              return (
                " " + ctx.dataset.label + ": " + formatValue(ctx.parsed.y, unit)
              );
            },
          },
        },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: mutedColor, font: { family: "JetBrains Mono", size: 11 } },
          border: { color: dividerColor },
        },
        y: {
          grid: { color: dividerColor + "60" },
          ticks: {
            color: mutedColor,
            font: { family: "JetBrains Mono", size: 11 },
            callback: function (v) {
              return formatCompact(v);
            },
          },
          border: { display: false },
        },
      },
      animation: { duration: 800, easing: "easeOutQuart" },
    },
  });
  chartInstances.push(chart);
}

// ========== Utility Functions ==========
function destroyCharts() {
  chartInstances.forEach(function (c) {
    c.destroy();
  });
  chartInstances = [];
}

function formatValue(val, unit) {
  if (val === null || val === undefined) return "N/A";
  var u = (unit || "").toLowerCase();

  if (u.includes("%") || u.includes("percent") || u.includes("share") || u.includes("rate") || u.includes("growth")) {
    return val.toFixed(1) + "%";
  }
  if (u.includes("trillion")) {
    return "$" + val.toFixed(2) + "T";
  }
  if (u.includes("billion") || u.includes("usd b") || u.includes("$ b")) {
    if (val >= 1000) return "$" + (val / 1000).toFixed(2) + "T";
    return "$" + val.toFixed(1) + "B";
  }
  if (u.includes("million") || u.includes("usd m")) {
    if (val >= 1000) return "$" + (val / 1000).toFixed(1) + "B";
    return "$" + val.toFixed(0) + "M";
  }

  if (val >= 1000000) return (val / 1000000).toFixed(1) + "M";
  if (val >= 1000) return (val / 1000).toFixed(1) + "K";
  if (val >= 100) return val.toFixed(0);
  if (val >= 10) return val.toFixed(1);
  return val.toFixed(2);
}

function formatCompact(val) {
  if (val >= 1000000000) return (val / 1000000000).toFixed(1) + "B";
  if (val >= 1000000) {
    var mVal = val / 1000000;
    return (mVal >= 10 ? mVal.toFixed(0) : mVal.toFixed(1)) + "M";
  }
  if (val >= 1000) {
    var kVal = val / 1000;
    return (kVal >= 10 ? kVal.toFixed(0) : kVal.toFixed(1)) + "K";
  }
  if (val >= 100) return val.toFixed(0);
  if (val >= 1) return val.toFixed(1);
  return val.toFixed(2);
}

function calcGrowth(data) {
  if (!data || data.length < 2) return null;
  var first = data[0].value;
  var last = data[data.length - 1].value;
  if (first === 0) return null;
  return ((last - first) / Math.abs(first)) * 100;
}

function shouldBeginAtZero(values) {
  var min = Math.min.apply(null, values);
  var max = Math.max.apply(null, values);
  if (max === 0) return true;
  return min / max > 0.3;
}

function normalizeMetricName(name) {
  return (name || "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function escapeHtml(str) {
  var div = document.createElement("div");
  div.appendChild(document.createTextNode(str || ""));
  return div.innerHTML;
}

function truncate(str, len) {
  if (!str) return "";
  return str.length > len ? str.substring(0, len) + "\u2026" : str;
}

// ========== Start ==========
loadData();
