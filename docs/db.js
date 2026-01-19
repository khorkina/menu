// docs/db.js
const DB_NAME = "menu_master";
const DB_VERSION = 1;

function openDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);

    req.onupgradeneeded = () => {
      const db = req.result;

      const dishes = db.createObjectStore("dishes", { keyPath: "id", autoIncrement: true });
      dishes.createIndex("category", "category", { unique: false });

      const weeks = db.createObjectStore("weeks", { keyPath: "id", autoIncrement: true });
      weeks.createIndex("isActive", "isActive", { unique: false });

      const plan = db.createObjectStore("planEntries", { keyPath: "id", autoIncrement: true });
      plan.createIndex("weekId", "weekId", { unique: false });
      plan.createIndex("weekId_date", ["weekId", "date"], { unique: false });

      const shop = db.createObjectStore("shoppingItems", { keyPath: "id", autoIncrement: true });
      shop.createIndex("weekId", "weekId", { unique: false });

      db.createObjectStore("kv", { keyPath: "key" });
    };

    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function tx(db, storeName, mode = "readonly") {
  return db.transaction(storeName, mode).objectStore(storeName);
}

function reqToPromise(req) {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

// --- KV ---
async function kvGet(key) {
  const db = await openDb();
  return reqToPromise(tx(db, "kv").get(key));
}

async function kvSet(key, value) {
  const db = await openDb();
  return reqToPromise(tx(db, "kv", "readwrite").put({ key, value }));
}

// --- Dishes ---
async function dishesCount() {
  const db = await openDb();
  return reqToPromise(tx(db, "dishes").count());
}

async function dishesBulkAdd(list) {
  const db = await openDb();

  return new Promise((resolve, reject) => {
    const tr = db.transaction("dishes", "readwrite");
    const store = tr.objectStore("dishes");

    for (const item of list) store.add(item);

    tr.oncomplete = () => resolve(true);
    tr.onerror = () => reject(tr.error);
    tr.onabort = () => reject(tr.error);
  });
}


async function listDishesByCategory(category) {
  const db = await openDb();
  const index = tx(db, "dishes").index("category");
  return reqToPromise(index.getAll(category));
}

async function getDish(id) {
  const db = await openDb();
  return reqToPromise(tx(db, "dishes").get(id));
}

// --- Weeks ---
async function getCurrentWeek() {
  const db = await openDb();
  const store = tx(db, "weeks");
  const all = await reqToPromise(store.getAll());
  return all.find(w => w.isActive === true || w.isActive === "true") || null;
}


async function createWeek(startDate) {
  const db = await openDb();
  const store = tx(db, "weeks", "readwrite");
  const id = await reqToPromise(store.add({
    startDate,
    isActive: true,
    isArchived: false,
    createdAt: new Date().toISOString()
  }));
  return { id, startDate, isActive: true, isArchived: false };
}

async function archiveCurrentWeek() {
  const db = await openDb();

  return new Promise((resolve, reject) => {
    const tr = db.transaction("weeks", "readwrite");
    const store = tr.objectStore("weeks");
    const idx = store.index("isActive");

    // не используем getAll(true) — берём все и фильтруем (надёжнее)
    const req = store.getAll();

    req.onsuccess = () => {
      const all = req.result || [];
      const cur = all.find(w => w.isActive === true || w.isActive === "true");
      if (!cur) return resolve(null);

      cur.isActive = false;
      cur.isArchived = true;

      const putReq = store.put(cur);
      putReq.onsuccess = () => resolve(cur);
      putReq.onerror = () => reject(putReq.error);
    };

    req.onerror = () => reject(req.error);
    tr.onerror = () => reject(tr.error);
    tr.onabort = () => reject(tr.error);
  });
}


// --- Plan ---
async function listPlan(weekId) {
  const db = await openDb();
  const index = tx(db, "planEntries").index("weekId");
  return reqToPromise(index.getAll(weekId));
}

async function addPlanEntry({ weekId, date, slot, dishId }) {
  const db = await openDb();

  return new Promise((resolve, reject) => {
    const tr = db.transaction("planEntries", "readwrite");
    const store = tr.objectStore("planEntries");
    const idx = store.index("weekId");

    let resultObj = null;

    const getReq = idx.getAll(weekId);

    getReq.onsuccess = () => {
      const existing = getReq.result || [];
      const same = existing.find(e => e.date === date && e.slot === slot);

      if (same) store.delete(same.id);

      const addReq = store.add({ weekId, date, slot, dishId });

      addReq.onsuccess = () => {
        resultObj = { id: addReq.result, weekId, date, slot, dishId };
        // НЕ resolve здесь
      };
      addReq.onerror = () => reject(addReq.error);
    };

    getReq.onerror = () => reject(getReq.error);

    tr.oncomplete = () => resolve(resultObj);
    tr.onerror = () => reject(tr.error);
    tr.onabort = () => reject(tr.error);
  });
}



async function removePlanEntry(id) {
  const db = await openDb();
  return reqToPromise(tx(db, "planEntries", "readwrite").delete(id));
}

// --- Shopping ---
async function listShopping(weekId) {
  const db = await openDb();
  const index = tx(db, "shoppingItems").index("weekId");
  return reqToPromise(index.getAll(weekId));
}

async function upsertShoppingItem({ weekId, name, isChecked }) {
  const db = await openDb();

  return new Promise((resolve, reject) => {
    const tr = db.transaction("shoppingItems", "readwrite");
    const store = tr.objectStore("shoppingItems");
    const idx = store.index("weekId");

    const req = idx.getAll(weekId);

    req.onsuccess = () => {
      const items = req.result || [];
      const found = items.find(i => i.name === name);

      if (found) {
        found.isChecked = (isChecked ?? found.isChecked);
        const putReq = store.put(found);
        putReq.onsuccess = () => resolve(found);
        putReq.onerror = () => reject(putReq.error);
      } else {
        const addReq = store.add({ weekId, name, isChecked: !!isChecked });
        addReq.onsuccess = () => resolve({ id: addReq.result, weekId, name, isChecked: !!isChecked });
        addReq.onerror = () => reject(addReq.error);
      }
    };

    req.onerror = () => reject(req.error);
    tr.onerror = () => reject(tr.error);
    tr.onabort = () => reject(tr.error);
  });
}


async function toggleShoppingItem(id, isChecked) {
  const db = await openDb();
  const store = tx(db, "shoppingItems", "readwrite");
  const item = await reqToPromise(store.get(id));
  item.isChecked = !!isChecked;
  await reqToPromise(store.put(item));
  return item;
}

async function clearShoppingForWeek(weekId) {
  const db = await openDb();
  const items = await listShopping(weekId);
  
  return new Promise((resolve, reject) => {
    const tr = db.transaction("shoppingItems", "readwrite");
    const store = tr.objectStore("shoppingItems");
    for (const it of items) store.delete(it.id);
    tr.oncomplete = () => resolve(true);
    tr.onerror = () => reject(tr.error);
  });
}

// Global scope for use in app.js
window.MM_DB = {
  kvGet, kvSet,
  dishesCount, dishesBulkAdd, listDishesByCategory, getDish,
  getCurrentWeek, createWeek, archiveCurrentWeek,
  listPlan, addPlanEntry, removePlanEntry,
  listShopping, upsertShoppingItem, toggleShoppingItem, clearShoppingForWeek
};
