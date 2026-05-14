// ─── STATE ───────────────────────────────────────────────────────────────────
let fixedCosts = [
  { id: 1, name: 'Pemandu Wisata',  qty: 2, frequency: 1, price: 250000, autoJeep: false },
  { id: 2, name: 'Jeep Wisata',     qty: 1, frequency: 1, price: 300000, autoJeep: true  },
  { id: 3, name: 'Bus Transport',   qty: 1, frequency: 1, price: 2000000, autoJeep: false },
];
let variableCosts = [
  { id: 1, name: 'Makan Siang',      qty: 1, frequency: 2, price: 75000,  autoJeep: false },
  { id: 2, name: 'Tiket Masuk Jeep', qty: 1, frequency: 1, price: 150000, autoJeep: true  },
];
let nextFixedId    = 4;
let nextVariableId = 3;
let summaryOpen    = false;

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const fmt = v => new Intl.NumberFormat('id-ID', {
  style: 'currency', currency: 'IDR', minimumFractionDigits: 0
}).format(v);

const ceilDiv = (p, n) => Math.ceil(p / n);

function getParticipants() {
  return Math.max(0, parseInt(document.getElementById('participants').value) || 0);
}
function getProfitPct() {
  return Math.max(0, parseFloat(document.getElementById('profitPct').value) || 0);
}
function getJeepCount() {
  return ceilDiv(getParticipants(), 5);
}
function resolveQty(cost) {
  return cost.autoJeep ? getJeepCount() : cost.qty;
}

// ─── RENDER COST CARD ─────────────────────────────────────────────────────────
function renderCostCard(cost, type) {
  const isVariable  = type === 'variable';
  const jeepActive  = cost.autoJeep;
  const jeepCount   = getJeepCount();
  const qty         = resolveQty(cost);
  const subtotal    = isVariable
    ? cost.frequency * cost.price
    : qty * cost.frequency * cost.price;
  const formula     = isVariable
    ? `${cost.frequency} × ${cost.price.toLocaleString('id-ID')}`
    : `${qty} × ${cost.frequency} × ${cost.price.toLocaleString('id-ID')}`;

  const qtyField = jeepActive
    ? `<div class="jeep-qty-box">${jeepCount} 🚙</div>`
    : `<input type="number" class="field-input" min="0" value="${cost.qty}"
         oninput="updateCostField('${type}',${cost.id},'qty',this.value)" />`;

  return `
    <div class="cost-card ${jeepActive ? 'jeep-active' : ''}" id="card-${type}-${cost.id}">
      <div class="cost-card-top">
        <input type="text" placeholder="Nama biaya" value="${cost.name}"
          oninput="updateCostField('${type}',${cost.id},'name',this.value)" />
        <button class="jeep-toggle ${jeepActive ? 'active' : ''}"
          onclick="toggleJeep('${type}',${cost.id})">🚙</button>
        <button class="delete-btn" onclick="deleteCost('${type}',${cost.id})">🗑</button>
      </div>
      <div class="cost-fields ${isVariable ? 'cols-2' : 'cols-3'}">
        ${!isVariable ? `<div>
          <div class="field-label">Qty</div>
          ${qtyField}
        </div>` : ''}
        <div>
          <div class="field-label">Frekuensi</div>
          <input type="number" class="field-input" min="0" value="${cost.frequency}"
            oninput="updateCostField('${type}',${cost.id},'frequency',this.value)" />
        </div>
        <div>
          <div class="field-label">Harga</div>
          <input type="number" class="field-input right" min="0" value="${cost.price}"
            oninput="updateCostField('${type}',${cost.id},'price',this.value)" />
        </div>
      </div>
      <div class="cost-subtotal">
        <span class="cost-formula">${formula}</span>
        <span class="cost-amount ${jeepActive ? 'amber' : ''}">${fmt(subtotal)}</span>
      </div>
    </div>`;
}

// ─── RENDER ALL LISTS ─────────────────────────────────────────────────────────
function renderLists() {
  document.getElementById('fixedCosts').innerHTML =
    fixedCosts.map(c => renderCostCard(c, 'fixed')).join('');
  document.getElementById('variableCosts').innerHTML =
    variableCosts.map(c => renderCostCard(c, 'variable')).join('');
}

// ─── CALCULATE & UPDATE UI ───────────────────────────────────────────────────
function updateAll() {
  const p         = getParticipants();
  const jeepCount = getJeepCount();
  const profitPct = getProfitPct();

  // Jeep count info
  document.getElementById('jeepCount').textContent = `${jeepCount} unit`;
  document.querySelector('.jeep-formula').textContent = `(⌈${p} ÷ 5⌉)`;

  // Totals
  const totalFixed = fixedCosts.reduce((s, c) => s + resolveQty(c) * c.frequency * c.price, 0);
  const totalVarPerPerson = variableCosts.reduce((s, c) => s + resolveQty(c) * c.frequency * c.price, 0);
  const totalVarGroup     = totalVarPerPerson * p;
  const totalCost         = totalFixed + totalVarGroup;
  const profit            = totalCost * (profitPct / 100);
  const totalWithProfit   = totalCost + profit;
  const pricePerPerson    = p > 0 ? totalWithProfit / p : 0;

  // Fixed section
  document.getElementById('totalFixed').textContent = fmt(totalFixed);

  // Variable section
  document.getElementById('totalVarPerPerson').textContent = fmt(totalVarPerPerson);
  document.getElementById('totalVarLabel').textContent     = `Total (${p} orang)`;
  document.getElementById('totalVar').textContent          = fmt(totalVarGroup);

  // Profit section
  document.getElementById('profitValue').textContent = fmt(profit);
  document.getElementById('totalCost').textContent   = fmt(totalCost);

  // Sticky bottom
  document.getElementById('pricePerPerson').textContent  = fmt(pricePerPerson);
  document.getElementById('totalWithProfit').textContent = fmt(totalWithProfit);

  // Summary detail
  document.getElementById('sumFixed').textContent      = fmt(totalFixed);
  document.getElementById('sumVar').textContent        = fmt(totalVarGroup);
  document.getElementById('sumProfitLabel').textContent = `Profit (${profitPct}%)`;
  document.getElementById('sumProfit').textContent     = fmt(profit);
  document.getElementById('sumTotal').textContent      = fmt(totalCost);

  // Re-render cost cards (for jeep qty update)
  renderLists();
}

// ─── COUNTER CONTROLS ────────────────────────────────────────────────────────
function changeParticipants(delta) {
  const el = document.getElementById('participants');
  el.value = Math.max(0, (parseInt(el.value) || 0) + delta);
  updateAll();
}
function changeProfit(delta) {
  const el = document.getElementById('profitPct');
  el.value = Math.max(0, (parseFloat(el.value) || 0) + delta);
  updateAll();
}

// ─── COST MUTATIONS ───────────────────────────────────────────────────────────
function addCost(type) {
  if (type === 'fixed') {
    fixedCosts.push({ id: nextFixedId++, name: '', qty: 1, frequency: 1, price: 0, autoJeep: false });
  } else {
    variableCosts.push({ id: nextVariableId++, name: '', qty: 1, frequency: 1, price: 0, autoJeep: false });
  }
  updateAll();
}

function deleteCost(type, id) {
  if (type === 'fixed') {
    fixedCosts = fixedCosts.filter(c => c.id !== id);
  } else {
    variableCosts = variableCosts.filter(c => c.id !== id);
  }
  updateAll();
}

function toggleJeep(type, id) {
  const list = type === 'fixed' ? fixedCosts : variableCosts;
  const cost = list.find(c => c.id === id);
  if (cost) cost.autoJeep = !cost.autoJeep;
  updateAll();
}

function updateCostField(type, id, field, value) {
  const list = type === 'fixed' ? fixedCosts : variableCosts;
  const cost = list.find(c => c.id === id);
  if (!cost) return;
  cost[field] = field === 'name' ? value : (parseFloat(value) || 0);
  // Only recalc totals, don't re-render cards (avoid losing focus)
  calcOnly();
}

// Recalculate & update totals WITHOUT re-rendering cards
function calcOnly() {
  const p         = getParticipants();
  const jeepCount = getJeepCount();
  const profitPct = getProfitPct();

  document.getElementById('jeepCount').textContent    = `${jeepCount} unit`;
  document.querySelector('.jeep-formula').textContent = `(⌈${p} ÷ 5⌉)`;

  const totalFixed        = fixedCosts.reduce((s, c) => s + resolveQty(c) * c.frequency * c.price, 0);
  const totalVarPerPerson = variableCosts.reduce((s, c) => s + resolveQty(c) * c.frequency * c.price, 0);
  const totalVarGroup     = totalVarPerPerson * p;
  const totalCost         = totalFixed + totalVarGroup;
  const profit            = totalCost * (profitPct / 100);
  const totalWithProfit   = totalCost + profit;
  const pricePerPerson    = p > 0 ? totalWithProfit / p : 0;

  document.getElementById('totalFixed').textContent         = fmt(totalFixed);
  document.getElementById('totalVarPerPerson').textContent  = fmt(totalVarPerPerson);
  document.getElementById('totalVarLabel').textContent      = `Total (${p} orang)`;
  document.getElementById('totalVar').textContent           = fmt(totalVarGroup);
  document.getElementById('profitValue').textContent        = fmt(profit);
  document.getElementById('totalCost').textContent          = fmt(totalCost);
  document.getElementById('pricePerPerson').textContent     = fmt(pricePerPerson);
  document.getElementById('totalWithProfit').textContent    = fmt(totalWithProfit);
  document.getElementById('sumFixed').textContent           = fmt(totalFixed);
  document.getElementById('sumVar').textContent             = fmt(totalVarGroup);
  document.getElementById('sumProfitLabel').textContent     = `Profit (${profitPct}%)`;
  document.getElementById('sumProfit').textContent          = fmt(profit);
  document.getElementById('sumTotal').textContent           = fmt(totalCost);

  // Update subtotal in each card without full re-render
  [...fixedCosts, ...variableCosts].forEach(cost => {
    const isVar    = variableCosts.includes(cost);
    const type     = isVar ? 'variable' : 'fixed';
    const el       = document.getElementById(`card-${type}-${cost.id}`);
    if (!el) return;
    const qty      = resolveQty(cost);
    const subtotal = isVar ? cost.frequency * cost.price : qty * cost.frequency * cost.price;
    const formula  = isVar
      ? `${cost.frequency} × ${cost.price.toLocaleString('id-ID')}`
      : `${qty} × ${cost.frequency} × ${cost.price.toLocaleString('id-ID')}`;
    const amtEl = el.querySelector('.cost-amount');
    const fmlEl = el.querySelector('.cost-formula');
    if (amtEl) amtEl.textContent = fmt(subtotal);
    if (fmlEl) fmlEl.textContent = formula;
  });
}

// ─── SUMMARY TOGGLE ──────────────────────────────────────────────────────────
function toggleSummary() {
  summaryOpen = !summaryOpen;
  document.getElementById('summaryDetail').classList.toggle('hidden', !summaryOpen);
  document.getElementById('detailBtn').textContent = summaryOpen ? '▼ Detail' : '▲ Detail';
}

// ─── INIT ────────────────────────────────────────────────────────────────────
updateAll();