// docs/app.js
(function() {
  const MM_DB = window.MM_DB;
  const SEED_DATA = window.SEED_DISHES;

  const CATEGORIES = [
    { id: "soups",     ru: "Супы",      de: "Suppen" },
    { id: "salads",    ru: "Салаты",    de: "Salate" },
    { id: "mains",     ru: "Основное",  de: "Hauptgerichte" },
    { id: "meat",      ru: "Мясо",      de: "Fleisch" },
    { id: "breakfast", ru: "Завтрак",   de: "Frühstück" },
    { id: "bread",     ru: "Хлеб",      de: "Brot" },
    { id: "desserts",  ru: "Десерты",   de: "Desserts" },
  ];

  const SLOTS = [
    { id: "breakfast", ru: "Завтрак", de: "Frühstück" },
    { id: "lunch",     ru: "Обед",    de: "Mittag" },
    { id: "dinner",    ru: "Ужин",    de: "Abend" },
    { id: "dessert",   ru: "Десерт",  de: "Dessert" },
  ];

  let state = {
    lang: "ru",
    theme: "dark",
    category: "soups",
    view: "browse", // browse | plan
    dishCache: new Map(),
    week: null,
    dishes: [],
    selectedDish: null,
    plan: [],
    shopping: []
  };

  const $ = (id) => document.getElementById(id);

  function isoDate(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }

  function lastSundayISO() {
    const d = new Date();
    const day = d.getDay(); // 0 sunday
    d.setHours(0,0,0,0);
    d.setDate(d.getDate() - day);
    return isoDate(d);
  }

  function addDaysISO(startISO, offset) {
    const [y,m,d] = startISO.split("-").map(Number);
    const dt = new Date(y, m-1, d);
    dt.setDate(dt.getDate() + offset);
    return isoDate(dt);
  }

  async function ensureSeeded() {
    const seeded = await MM_DB.kvGet("seeded");
    if (seeded?.value) return;

    const count = await MM_DB.dishesCount();
    if (count === 0) await MM_DB.dishesBulkAdd(SEED_DATA);

    await MM_DB.kvSet("seeded", true);
  }

  async function ensureWeek() {
    let w = await MM_DB.getCurrentWeek();
    if (!w) w = await MM_DB.createWeek(lastSundayISO());
    state.week = w;
  }

  async function loadPrefs() {
    const lang = await MM_DB.kvGet("lang");
    state.lang = lang?.value === "de" ? "de" : "ru";
    
    const theme = await MM_DB.kvGet("theme");
    state.theme = theme?.value === "light" ? "light" : "dark";
    applyTheme();
  }

  function applyTheme() {
    document.documentElement.setAttribute("data-theme", state.theme);
    const themeIcon = $("themeBtn").querySelector("img");
    if (themeIcon) {
      themeIcon.src = state.theme === "dark" ? "./assets/moon.png" : "./assets/sun.png";
    }
  }

  async function toggleTheme() {
    state.theme = state.theme === "dark" ? "light" : "dark";
    await MM_DB.kvSet("theme", state.theme);
    applyTheme();
  }

  async function saveLang(next) {
    state.lang = next;
    await MM_DB.kvSet("lang", next);
    document.documentElement.lang = next === "de" ? "de" : "ru";
  }

  function t(obj) {
    return state.lang === "de" ? obj.de : obj.ru;
  }

  function renderCategories() {
    const root = $("categories");
    if (!root) return;
    root.innerHTML = "";
    for (const c of CATEGORIES) {
      const b = document.createElement("button");
      b.className = "cat" + (state.category === c.id ? " active" : "");
      b.textContent = t(c);
      b.onclick = async () => {
        state.category = c.id;
        state.view = "browse";
        await loadDishes();
        renderAll();
      };
      root.appendChild(b);
    }
  }

  async function loadDishes() {
    state.dishes = await MM_DB.listDishesByCategory(state.category);
  }

  function dishTitle(dish) {
    return state.lang === "de" ? dish.titleDe : dish.titleRu;
  }

  function renderGrid() {
    const grid = $("grid");
    if (!grid) return;
    grid.innerHTML = "";
    for (const d of state.dishes) {
      const card = document.createElement("div");
      card.className = "card";
      card.innerHTML = `
        <img src="${d.imageUrl}" alt="">
        <div class="p">
          <div><strong>${dishTitle(d)}</strong></div>
          <div class="meta">
            <span>${d.kcal} kcal</span>
            <span>${d.weight} g</span>
          </div>
        </div>
      `;
      card.onclick = async () => {
        state.selectedDish = d;
        await loadPlanAndShopping();
        openModal();
      };
      grid.appendChild(card);
    }
  }

  async function warmDishCache() {
    const ids = new Set();
    for (const p of state.plan) ids.add(p.dishId);
    if (state.selectedDish?.id) ids.add(state.selectedDish.id);
    const missing = [...ids].filter(id => !state.dishCache.has(id));
    if (missing.length === 0) return;
    const dishes = await Promise.all(missing.map(id => MM_DB.getDish(id)));
    for (const d of dishes) if (d) state.dishCache.set(d.id, d);
  }

  async function loadPlanAndShopping() {
    state.plan = await MM_DB.listPlan(state.week.id);
    state.shopping = await MM_DB.listShopping(state.week.id);
    await warmDishCache();
  }

  function openModal() {
    $("modalTitle").textContent = dishTitle(state.selectedDish);
    $("modal").classList.remove("hidden");
    renderPlanner();
  }

  function closeModal() {
    $("modal").classList.add("hidden");
    state.selectedDish = null;
  }

  function planLookup(dateISO, slotId) {
    return state.plan.find(p => p.date === dateISO && p.slot === slotId) || null;
  }

  async function rebuildShoppingFromPlan() {
    const checkedMap = new Map(state.shopping.map(i => [i.name, i.isChecked]));
    await MM_DB.clearShoppingForWeek(state.week.id);
    const uniqueDishIds = [...new Set(state.plan.map(p => p.dishId))];
    const missingIds = uniqueDishIds.filter(id => !state.dishCache.has(id));
    if (missingIds.length > 0) {
      const fetchedDishes = await Promise.all(missingIds.map(id => MM_DB.getDish(id)));
      fetchedDishes.forEach(d => { if (d) state.dishCache.set(d.id, d); });
    }
    const names = new Set();
    for (const dishId of uniqueDishIds) {
      const dish = state.dishCache.get(dishId);
      if (!dish) continue;
      const ingredients = state.lang === "de" ? dish.ingredientsDe : dish.ingredientsRu;
      for (const ing of ingredients) {
        names.add(ing.toLowerCase().trim());
      }
    }
    const upsertPromises = Array.from(names).map(name => MM_DB.upsertShoppingItem({
      weekId: state.week.id,
      name,
      isChecked: checkedMap.get(name) ?? false
    }));
    await Promise.all(upsertPromises);
    state.shopping = await MM_DB.listShopping(state.week.id);
  }

  function renderPlanner() {
    const root = $("planner");
    if (!root) return;
    root.innerHTML = "";
    const start = state.week.startDate;
    for (let i = 0; i < 7; i++) {
      const dateISO = addDaysISO(start, i);
      const col = document.createElement("div");
      col.className = "day";
      col.innerHTML = `<div class="dtitle">${dateISO}</div>`;
      for (const s of SLOTS) {
        const existing = planLookup(dateISO, s.id);
        const btn = document.createElement("button");
        btn.className = "btn secondary";
        if (existing) {
          const dish = state.dishCache.get(existing.dishId);
          const title = dish ? dishTitle(dish) : `#${existing.dishId}`;
          btn.textContent = `${t(s)}: ${title}`;
        } else {
          btn.textContent = `${t(s)}: —`;
        }
        btn.onclick = async () => {
          const dishId = state.selectedDish.id;
          const tempId = Date.now();
          const optimisticEntry = { id: tempId, weekId: state.week.id, date: dateISO, slot: s.id, dishId };
          const oldIndex = state.plan.findIndex(p => p.date === dateISO && p.slot === s.id);
          if (oldIndex !== -1) {
            state.plan[oldIndex] = optimisticEntry;
          } else {
            state.plan.push(optimisticEntry);
          }
          if (!state.dishCache.has(dishId)) state.dishCache.set(dishId, state.selectedDish);
          renderPlanner();
          await MM_DB.addPlanEntry({
            weekId: state.week.id,
            date: dateISO,
            slot: s.id,
            dishId: dishId
          });
          state.plan = await MM_DB.listPlan(state.week.id);
          await rebuildShoppingFromPlan();
          renderPlanner();
          renderShopping();
        };
        const wrap = document.createElement("div");
        wrap.className = "slot";
        const label = document.createElement("label");
        label.textContent = t(s);
        wrap.appendChild(label);
        wrap.appendChild(btn);
        col.appendChild(wrap);
      }
      root.appendChild(col);
    }
  }

  function renderPlanView() {
    const root = $("fullPlan");
    if (!root) return;
    root.innerHTML = "";
    const start = state.week.startDate;
    for (let i = 0; i < 7; i++) {
      const dateISO = addDaysISO(start, i);
      const daySection = document.createElement("div");
      daySection.className = "plan-day";
      daySection.innerHTML = `<h3 class="dtitle">${dateISO}</h3>`;
      const slotsGrid = document.createElement("div");
      slotsGrid.className = "slots-grid";
      for (const s of SLOTS) {
        const entry = planLookup(dateISO, s.id);
        const slotDiv = document.createElement("div");
        slotDiv.className = "plan-slot";
        if (entry) {
          const dish = state.dishCache.get(entry.dishId);
          if (dish) {
            slotDiv.innerHTML = `
              <div class="slot-label">${t(s)}</div>
              <div class="slot-dish">
                <img src="${dish.imageUrl}" alt="">
                <span>${dishTitle(dish)}</span>
              </div>
            `;
          } else {
            slotDiv.innerHTML = `<div class="slot-label">${t(s)}</div><div class="empty">—</div>`;
          }
        } else {
          slotDiv.innerHTML = `<div class="slot-label">${t(s)}</div><div class="empty">—</div>`;
        }
        slotsGrid.appendChild(slotDiv);
      }
      daySection.appendChild(slotsGrid);
      root.appendChild(daySection);
    }
  }

  function renderShopping() {
    const root = $("shopping");
    if (!root) return;
    root.innerHTML = "";
    for (const item of state.shopping.sort((a,b) => a.name.localeCompare(b.name))) {
      const row = document.createElement("div");
      row.className = "item";
      row.innerHTML = `
        <input type="checkbox" ${item.isChecked ? "checked" : ""} />
        <div style="flex:1; opacity:${item.isChecked ? 0.55 : 1}">${item.name}</div>
      `;
      const cb = row.querySelector("input");
      cb.onchange = async () => {
        await MM_DB.toggleShoppingItem(item.id, cb.checked);
        state.shopping = await MM_DB.listShopping(state.week.id);
        renderShopping();
      };
      root.appendChild(row);
    }
  }

  function wireUI() {
    $("closeModal").onclick = closeModal;
    $("themeBtn").onclick = toggleTheme;
    $("langBtn").onclick = async () => {
      await saveLang(state.lang === "ru" ? "de" : "ru");
      await loadDishes();
      await loadPlanAndShopping();
      renderAll();
    };
    $("resetWeekBtn").onclick = async () => {
      await MM_DB.archiveCurrentWeek();
      state.week = await MM_DB.createWeek(lastSundayISO());
      state.plan = [];
      state.shopping = [];
      renderAll();
    };
    $("planNavBtn").onclick = () => {
      state.view = state.view === "plan" ? "browse" : "plan";
      renderAll();
    };
  }

  function renderAll() {
    renderCategories();
    if (state.view === "plan") {
      $("grid").classList.add("hidden");
      $("fullPlan").classList.remove("hidden");
      renderPlanView();
    } else {
      $("grid").classList.remove("hidden");
      $("fullPlan").classList.add("hidden");
      renderGrid();
    }
    renderShopping();
  }

  async function main() {
    wireUI();
    await loadPrefs();
    await ensureSeeded();
    await ensureWeek();
    await loadDishes();
    await loadPlanAndShopping();
    document.documentElement.lang = state.lang === "de" ? "de" : "ru";
    renderAll();
  }

  main();
})();

