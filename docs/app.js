// docs/app.js
import { SEED_DISHES } from "./seed.js";
import {
  kvGet, kvSet,
  dishesCount, dishesBulkAdd, listDishesByCategory, getDish,
  getCurrentWeek, createWeek, archiveCurrentWeek,
  listPlan, addPlanEntry,
  listShopping, upsertShoppingItem, toggleShoppingItem, clearShoppingForWeek
} from "./db.js";

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
  category: "soups",
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
  const seeded = await kvGet("seeded");
  if (seeded?.value) return;

  const count = await dishesCount();
  if (count === 0) await dishesBulkAdd(SEED_DISHES);

  await kvSet("seeded", true);
}

async function ensureWeek() {
  let w = await getCurrentWeek();
  if (!w) w = await createWeek(lastSundayISO());
  state.week = w;
}

async function loadPrefs() {
  const v = await kvGet("lang");
  state.lang = v?.value === "de" ? "de" : "ru";
}

async function saveLang(next) {
  state.lang = next;
  await kvSet("lang", next);
  document.documentElement.lang = next === "de" ? "de" : "ru";
}

function t(obj) {
  return state.lang === "de" ? obj.de : obj.ru;
}

function renderCategories() {
  const root = $("categories");
  root.innerHTML = "";
  for (const c of CATEGORIES) {
    const b = document.createElement("button");
    b.className = "cat" + (state.category === c.id ? " active" : "");
    b.textContent = t(c);
    b.onclick = async () => {
      state.category = c.id;
      await loadDishes();
      renderAll();
    };
    root.appendChild(b);
  }
}

async function loadDishes() {
  state.dishes = await listDishesByCategory(state.category);
}

function dishTitle(dish) {
  return state.lang === "de" ? dish.titleDe : dish.titleRu;
}

function dishIngredients(dish) {
  return state.lang === "de" ? dish.ingredientsDe : dish.ingredientsRu;
}

function renderGrid() {
  const grid = $("grid");
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

  const dishes = await Promise.all(missing.map(id => getDish(id)));
  for (const d of dishes) if (d) state.dishCache.set(d.id, d);
}


async function loadPlanAndShopping() {
  state.plan = await listPlan(state.week.id);
  state.shopping = await listShopping(state.week.id);
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
  // политика: список покупок = уникальные ингредиенты всех блюд в плане, чекбоксы сохраняем
  const checkedMap = new Map(state.shopping.map(i => [i.name, i.isChecked]));
  await clearShoppingForWeek(state.week.id);

  const names = new Set();
  for (const entry of state.plan) {
    const dish = await getDish(entry.dishId);
    for (const ing of dish.ingredientsRu) names.add(ing.toLowerCase().trim());
  }

  for (const name of names) {
    await upsertShoppingItem({
      weekId: state.week.id,
      name,
      isChecked: checkedMap.get(name) ?? false
    });
  }

  state.shopping = await listShopping(state.week.id);
}

function renderPlanner() {
  const root = $("planner");
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
        await addPlanEntry({
          weekId: state.week.id,
          date: dateISO,
          slot: s.id,
          dishId: state.selectedDish.id
        });
        state.plan = await listPlan(state.week.id);
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

function renderShopping() {
  const root = $("shopping");
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
      await toggleShoppingItem(item.id, cb.checked);
      state.shopping = await listShopping(state.week.id);
      renderShopping();
    };
    root.appendChild(row);
  }
}

function wireUI() {
  $("closeModal").onclick = closeModal;

  $("langBtn").onclick = async () => {
    await saveLang(state.lang === "ru" ? "de" : "ru");
    await loadDishes();
    await loadPlanAndShopping();
    renderAll();
  };

  $("resetWeekBtn").onclick = async () => {
    await archiveCurrentWeek();
    state.week = await createWeek(lastSundayISO());
    state.plan = [];
    state.shopping = [];
    renderAll();
  };
}

function renderAll() {
  renderCategories();
  renderGrid();
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
