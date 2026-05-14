// ── State ──────────────────────────────────────────────────────────────────
let fixedCosts = [
{ id: 1, name: ‘Pemandu Wisata’,  qty: 2, frequency: 1, price: 250000, autoJeep: false },
{ id: 2, name: ‘Jeep Wisata’,     qty: 1, frequency: 1, price: 300000, autoJeep: true  },
{ id: 3, name: ‘Bus Transport’,   qty: 1, frequency: 1, price: 2000000, autoJeep: false },
];
let variableCosts = [
{ id: 1, name: ‘Makan Siang’,      qty: 1, frequency: 2, price: 75000,  autoJeep: false },
{ id: 2, name: ‘Tiket Masuk Jeep’, qty: 1, frequency: 1, price: 150000, autoJeep: true  },
];
let nextFixedId    = 4;
let nextVariableId = 3;
let summaryOpen    = false;

// ── Helpers ────────────────────────────────────────────────────────────────
const ceilDiv = (p, n) => Math.ceil(p / n);
const fmt = v => new Intl.NumberFormat(‘id-ID’, {
style: ‘currency’, currency: ‘IDR’, minimumFractionDigits: 0
}).format(v);

function getParticipants() {
return Math.max(0, parseInt(document.getElementById(‘participants’).value) || 0);
}
function getProfitPct() {
return Math.max(0, parseFloat(document.getElementById(‘profitPct’).value) || 0);
}
function getJeepCount() { return ceilDiv(getParticipants(), 5); }
function getQty(cost)   { return cost.autoJeep ? getJeepCount() : cost.qty; }

// ── Render cost list ───────────────────────────────────────────────────────
function renderCosts(list, containerId, isVariable) {
const container = document.getElementById(containerId);
const p = getParticipants();
const jeep = getJeepCount();
container.innerHTML = ‘’;

list.forEach(cost => {
const qty = cost.autoJeep ? jeep : cost.qty;
const subtotal = isVariable
? cost.frequency * cost.price
: qty * cost.frequency * cost.price;
const formula = isVariable
? `${cost.frequency} × ${cost.price.toLocaleString('id-ID')}`
: `${qty} × ${cost.frequency} × ${cost.price.toLocaleString('id-ID')}`;

```
const div = document.createElement('div');
div.className = 'cost-card' + (cost.autoJeep ? ' jeep-active' : '');
div.innerHTML = `
  <div class="cost-card-top">
    <input type="text" placeholder="Nama biaya" value="${cost.name}"
      oninput="updateField('${isVariable ? 'var' : 'fix'}',${cost.id},'name',this.value)" />
    <button class="jeep-toggle ${cost.autoJeep ? 'active' : ''}"
      onclick="toggleJeep('${isVariable ? 'var' : 'fix'}',${cost.id})">🚙</button>
    <button class="delete-btn"
      onclick="deleteCost('${isVariable ? 'var' : 'fix'}',${cost.id})">🗑</button>
  </div>
  <div class="cost-fields ${isVariable ? 'no-qty' : 'has-qty'}">
    ${!isVariable ? `
    <div class="field">
      <label>Qty</label>
      ${cost.autoJeep
        ? `<div class="jeep-qty-display">${jeep} 🚙</div>`
        : `<input type="number" value="${cost.qty}" min="0"
            oninput="updateField('fix',${cost.id},'qty',this.value)" />`}
    </div>` : ''}
    <div class="field">
      <label>Frekuensi</label>
      <input type="number" value="${cost.frequency}" min="0"
        oninput="updateField('${isVariable ? 'var' : 'fix'}',${cost.id},'frequency',this.value)" />
    </div>
    <div class="field">
      <label>Harga</label>
      <input type="number" value="${cost.price}" min="0"
        oninput="updateField('${isVariable ? 'var' : 'fix'}',${cost.id},'price',this.value)" />
    </div>
  </div>
  <div class="subtotal-row">
    <span class="formula">${formula}</span>
    <span class="amount ${cost.autoJeep ? 'jeep' : ''}">${fmt(subtotal)}</span>
  </div>
`;
container.appendChild(div);
```

});
}

// ── Mutations ──────────────────────────────────────────────────────────────
function updateField(type, id, field, value) {
const list = type === ‘fix’ ? fixedCosts : variableCosts;
const item = list.find(c => c.id === id);
if (!item) return;
item[field] = (field === ‘name’) ? value : (parseFloat(value) || 0);
recalculate();
}

function toggleJeep(type, id) {
const list = type === ‘fix’ ? fixedCosts : variableCosts;
const item = list.find(c => c.id === id);
if (item) { item.autoJeep = !item.autoJeep; recalculate(); }
}

function deleteCost(type, id) {
if (type === ‘fix’) fixedCosts    = fixedCosts.filter(c => c.id !== id);
else                variableCosts = variableCosts.filter(c => c.id !== id);
recalculate();
}

function addCost(type) {
if (type === ‘fixed’) {
fixedCosts.push({ id: nextFixedId++, name: ‘’, qty: 1, frequency: 1, price: 0, autoJeep: false });
} else {
variableCosts.push({ id: nextVariableId++, name: ‘’, qty: 1, frequency: 1, price: 0, autoJeep: false });
}
recalculate();
}

function changeParticipants(delta) {
const el = document.getElementById(‘participants’);
el.value = Math.max(0, (parseInt(el.value) || 0) + delta);
recalculate();
}

function changeProfit(delta) {
const el = document.getElementById(‘profitPct’);
el.value = Math.max(0, (parseFloat(el.value) || 0) + delta);
recalculate();
}

function toggleSummary() {
summaryOpen = !summaryOpen;
document.getElementById(‘summaryDetail’).classList.toggle(‘hidden’, !summaryOpen);
document.getElementById(‘detailArrow’).textContent = summaryOpen ? ‘▼’ : ‘▲’;
}

// ── Main calculate + render ────────────────────────────────────────────────
function recalculate() {
const p    = getParticipants();
const jeep = getJeepCount();
const pct  = getProfitPct();

// Jeep info
document.getElementById(‘jeepInfo’).innerHTML =
`🚙 Jumlah Jeep: <strong>${jeep} unit</strong> ⌈${p} ÷ 5⌉`;

// Render cards
renderCosts(fixedCosts,    ‘fixedList’,    false);
renderCosts(variableCosts, ‘variableList’, true);

// Totals
const totalFixed = fixedCosts.reduce((s, c) => s + getQty(c) * c.frequency * c.price, 0);
const totalVarPP = variableCosts.reduce((s, c) => s + getQty(c) * c.frequency * c.price, 0);
const totalVar   = totalVarPP * p;
const totalCost  = totalFixed + totalVar;
const profit     = totalCost * (pct / 100);
const totalWP    = totalCost + profit;
const perPerson  = p > 0 ? totalWP / p : 0;

// Update DOM
document.getElementById(‘totalFixed’).textContent    = fmt(totalFixed);
document.getElementById(‘totalVarPerson’).textContent = fmt(totalVarPP);
document.getElementById(‘totalVar’).textContent      = fmt(totalVar);
document.getElementById(‘totalVarLabel’).textContent = `Total (${p} orang)`;
document.getElementById(‘profitValue’).textContent   = fmt(profit);
document.getElementById(‘totalBase’).textContent     = fmt(totalCost);

document.getElementById(‘pricePerPerson’).textContent  = fmt(perPerson);
document.getElementById(‘totalWithProfit’).textContent = fmt(totalWP);

// Summary panel
document.getElementById(‘sFixed’).textContent  = fmt(totalFixed);
document.getElementById(‘sVar’).textContent    = fmt(totalVar);
document.getElementById(‘sProfit’).textContent = fmt(profit);
document.getElementById(‘sTotal’).textContent  = fmt(totalCost);
document.getElementById(‘sPct’).textContent    = pct;
}

// ── Init ───────────────────────────────────────────────────────────────────
recalculate();
