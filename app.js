// ── State ──────────────────────────────────────────────
let participants = 20;
let profitPct = 20;
let nextFixedId = 4;
let nextVarId = 3;

let fixedCosts = [
  { id: 1, name: 'Pemandu Wisata', qty: 2, frequency: 1, price: 250000, autoJeep: false },
  { id: 2, name: 'Jeep Wisata',    qty: 1, frequency: 1, price: 300000, autoJeep: true  },
  { id: 3, name: 'Bus Transport',  qty: 1, frequency: 1, price: 2000000, autoJeep: false },
];

let variableCosts = [
  { id: 1, name: 'Makan Siang',      qty: 1, frequency: 2, price: 75000,  autoJeep: false },
  { id: 2, name: 'Tiket Masuk Jeep', qty: 1, frequency: 1, price: 150000, autoJeep: true  },
];

// ── Helpers ─────────────────────────────────────────────
const ceilDiv = (a, b) => Math.ceil(a / b);
const jeepCount = () => ceilDiv(participants, 5);
const fmt = v => new Intl.NumberFormat('id-ID', {
  style: 'currency', currency: 'IDR', minimumFractionDigits: 0
}).format(v);

function getQty(cost) {
  return cost.autoJeep ? jeepCount() : cost.qty;
}

// ── Render ───────────────────────────────────────────────
function renderAll() {
  // Jeep count display
  document.getElementById('jeepCount').textContent = jeepCount() + ' unit';

  renderList('fixed');
  renderList('variable');
  updateTotals();
}

function renderList(type) {
  const isFixed = type === 'fixed';
  const list = isFixed ? fixedCosts : variableCosts;
  const containerId = isFixed ? 'fixedCostList' : 'variableCostList';
  const container = document.getElementById(containerId);
  container.innerHTML = '';

  list.forEach(cost => {
    const qty = cost.autoJeep ? jeepCount() : cost.qty;
    const subtotal = isFixed
      ? qty * cost.frequency * cost.price
      : cost.frequency * cost.price;
    const formula = isFixed
      ? `${qty} × ${cost.frequency} × ${cost.price.toLocaleString('id-ID')}`
      : `${cost.frequency} × ${cost.price.toLocaleString('id-ID')}`;

    const qtyField = cost.autoJeep
      ? `<div class="jeep-qty-display">${qty} 🚙</div>`
      : `<input type="number" class="field-input" value="${cost.qty}" min="0"
           oninput="updateCost('${type}', ${cost.id}, 'qty', this.value)" />`;

    const gridClass = isFixed ? 'grid3' : 'grid2';
    const qtyCol = isFixed ? `
      <div>
        <label class="field-label">Qty</label>
        ${qtyField}
      </div>` : '';

    const div = document.createElement('div');
    div.className = 'cost-item' + (cost.autoJeep ? ' jeep-active' : '');
    div.innerHTML = `
      <div class="cost-item-header">
        <input type="text" class="cost-name" placeholder="Nama biaya" value="${cost.name}"
          oninput="updateCost('${type}', ${cost.id}, 'name', this.value)" />
        <button class="jeep-toggle ${cost.autoJeep ? 'active' : ''}"
          onclick="toggleJeep('${type}', ${cost.id})">🚙</button>
        <button class="delete-btn" onclick="deleteCost('${type}', ${cost.id})">🗑</button>
      </div>
      <div class="cost-fields ${gridClass}">
        ${qtyCol}
        <div>
          <label class="field-label">Frekuensi</label>
          <input type="number" class="field-input" value="${cost.frequency}" min="0"
            oninput="updateCost('${type}', ${cost.id}, 'frequency', this.value)" />
        </div>
        <div>
          <label class="field-label">Harga</label>
          <input type="number" class="field-input right" value="${cost.price}" min="0"
            oninput="updateCost('${type}', ${cost.id}, 'price', this.value)" />
        </div>
      </div>
      <div class="cost-subtotal">
        <span class="formula">${formula}</span>
        <span class="amount ${cost.autoJeep ? 'jeep' : ''}">${fmt(subtotal)}</span>
      </div>
    `;
    container.appendChild(div);
  });
}

function updateTotals() {
  const totalFixed = fixedCosts.reduce((s, c) =>
    s + getQty(c) * c.frequency * c.price, 0);
  const totalVarPer = variableCosts.reduce((s, c) =>
    s + getQty(c) * c.frequency * c.price, 0);
  const totalVarGroup = totalVarPer * participants;
  const totalCost = totalFixed + totalVarGroup;
  const profit = totalCost * (profitPct / 100);
  const totalWithProfit = totalCost + profit;
  const pricePerPerson = participants > 0 ? totalWithProfit / participants : 0;

  document.getElementById('totalFixed').textContent        = fmt(totalFixed);
  document.getElementById('totalVarPerPerson').textContent = fmt(totalVarPer);
  document.getElementById('totalVarGroup').textContent     = fmt(totalVarGroup);
  document.getElementById('varParticipantLabel').textContent = participants;
  document.getElementById('profitValue').textContent       = fmt(profit);
  document.getElementById('totalNoProfit').textContent     = fmt(totalCost);
  document.getElementById('pricePerPerson').textContent    = fmt(pricePerPerson);
  document.getElementById('totalWithProfit').textContent   = fmt(totalWithProfit);

  // Summary panel
  document.getElementById('sumFixed').textContent  = fmt(totalFixed);
  document.getElementById('sumVar').textContent    = fmt(totalVarGroup);
  document.getElementById('sumProfit').textContent = fmt(profit);
  document.getElementById('sumTotal').textContent  = fmt(totalCost);
  document.getElementById('sumProfitPct').textContent = profitPct;
}

// ── CRUD ─────────────────────────────────────────────────
function updateCost(type, id, field, value) {
  const list = type === 'fixed' ? fixedCosts : variableCosts;
  const cost = list.find(c => c.id === id);
  if (!cost) return;
  cost[field] = (field === 'name') ? value : (parseFloat(value) || 0);
  // Jangan rebuild DOM saat mengetik — cukup update subtotal & total
  updateSubtotal(type, id);
  updateTotals();
}

function toggleJeep(type, id) {
  const list = type === 'fixed' ? fixedCosts : variableCosts;
  const cost = list.find(c => c.id === id);
  if (!cost) return;
  cost.autoJeep = !cost.autoJeep;
  renderAll();
}

function deleteCost(type, id) {
  if (type === 'fixed') {
    fixedCosts = fixedCosts.filter(c => c.id !== id);
  } else {
    variableCosts = variableCosts.filter(c => c.id !== id);
  }
  renderAll();
}

function addCost(type) {
  if (type === 'fixed') {
    fixedCosts.push({ id: nextFixedId++, name: '', qty: 1, frequency: 1, price: 0, autoJeep: false });
  } else {
    variableCosts.push({ id: nextVarId++, name: '', qty: 1, frequency: 1, price: 0, autoJeep: false });
  }
  renderAll();
}

// ── Controls ─────────────────────────────────────────────
function setParticipants(val) {
  participants = Math.max(0, parseInt(val) || 0);
  updateTotals();
  document.getElementById('jeepCount').textContent = jeepCount() + ' unit';
  // Update semua jeep-qty-display tanpa rebuild
  document.querySelectorAll('.jeep-qty-display').forEach(el => {
    el.textContent = jeepCount() + ' 🚙';
  });
}

function changeParticipants(delta) {
  participants = Math.max(0, participants + delta);
  document.getElementById('participants').value = participants;
  setParticipants(participants);
}

function changeProfit(delta) {
  profitPct = Math.max(0, profitPct + delta);
  document.getElementById('profitPct').value = profitPct;
  updateTotals();
}

function setProfit(val) {
  profitPct = Math.max(0, parseFloat(val) || 0);
  updateTotals();
}

function toggleDetail() {
  const panel = document.getElementById('summaryDetail');
  const icon  = document.getElementById('detailIcon');
  const show  = panel.style.display === 'none';
  panel.style.display = show ? 'block' : 'none';
  icon.textContent = show ? '▼' : '▲';
}

// ── Export PDF ───────────────────────────────────────────
function exportPDF() {
  const totalFixed    = fixedCosts.reduce((s, c) => s + getQty(c) * c.frequency * c.price, 0);
  const totalVarPer   = variableCosts.reduce((s, c) => s + getQty(c) * c.frequency * c.price, 0);
  const totalVarGroup = totalVarPer * participants;
  const totalCost     = totalFixed + totalVarGroup;
  const profit        = totalCost * (profitPct / 100);
  const totalWithProfit  = totalCost + profit;
  const pricePerPerson   = participants > 0 ? totalWithProfit / participants : 0;
  const now = new Date().toLocaleDateString('id-ID', { weekday:'long', year:'numeric', month:'long', day:'numeric' });

  // Fill header
  document.getElementById('pdf-date').textContent = 'Dicetak: ' + now;
  document.getElementById('pdf-participants').textContent = participants + ' orang';
  document.getElementById('pdf-jeep').textContent = jeepCount() + ' unit';

  // Fixed costs table
  const fixedBody = document.getElementById('pdf-fixed');
  fixedBody.innerHTML = '';
  fixedCosts.forEach(c => {
    const q = getQty(c);
    const sub = q * c.frequency * c.price;
    fixedBody.innerHTML += `<tr>
      <td>${c.name || '-'} ${c.autoJeep ? '🚙' : ''}</td>
      <td>${q}</td><td>${c.frequency}</td>
      <td>${fmt(c.price)}</td><td>${fmt(sub)}</td>
    </tr>`;
  });
  document.getElementById('pdf-total-fixed').textContent = fmt(totalFixed);

  // Variable costs table
  const varBody = document.getElementById('pdf-variable');
  varBody.innerHTML = '';
  variableCosts.forEach(c => {
    const sub = getQty(c) * c.frequency * c.price;
    varBody.innerHTML += `<tr>
      <td>${c.name || '-'} ${c.autoJeep ? '🚙' : ''}</td>
      <td>${c.frequency}</td>
      <td>${fmt(c.price)}</td><td>${fmt(sub)}</td>
    </tr>`;
  });
  document.getElementById('pdf-var-per').textContent = fmt(totalVarPer);
  document.getElementById('pdf-var-group-label').textContent = `Total (${participants} orang)`;
  document.getElementById('pdf-var-group').textContent = fmt(totalVarGroup);

  // Summary
  document.getElementById('pdf-sum-fixed').textContent  = fmt(totalFixed);
  document.getElementById('pdf-sum-var').textContent    = fmt(totalVarGroup);
  document.getElementById('pdf-sum-total').textContent  = fmt(totalCost);
  document.getElementById('pdf-profit-label').textContent = `Profit (${profitPct}%)`;
  document.getElementById('pdf-sum-profit').textContent = fmt(profit);

  // Result
  document.getElementById('pdf-grand-total').textContent     = fmt(totalWithProfit);
  document.getElementById('pdf-price-per-person').textContent = fmt(pricePerPerson);

  // Show and print
  document.getElementById('pdfPreview').style.display = 'block';
  window.print();
  document.getElementById('pdfPreview').style.display = 'none';
}

// ── Update subtotal satu item tanpa rebuild DOM ───────────
function updateSubtotal(type, id) {
  const isFixed = type === 'fixed';
  const list = isFixed ? fixedCosts : variableCosts;
  const cost = list.find(c => c.id === id);
  if (!cost) return;
  const qty = getQty(cost);
  const subtotal = isFixed
    ? qty * cost.frequency * cost.price
    : getQty(cost) * cost.frequency * cost.price;
  const formula = isFixed
    ? `${qty} × ${cost.frequency} × ${cost.price.toLocaleString('id-ID')}`
    : `${cost.frequency} × ${cost.price.toLocaleString('id-ID')}`;

  const container = document.getElementById(isFixed ? 'fixedCostList' : 'variableCostList');
  const items = container.querySelectorAll('.cost-item');
  const listArr = Array.from(isFixed ? fixedCosts : variableCosts);
  const idx = listArr.findIndex(c => c.id === id);
  if (idx < 0 || !items[idx]) return;
  const item = items[idx];
  const formulaEl = item.querySelector('.formula');
  const amountEl  = item.querySelector('.amount');
  if (formulaEl) formulaEl.textContent = formula;
  if (amountEl)  amountEl.textContent  = fmt(subtotal);
}

// ── Init ──────────────────────────────────────────────────
renderAll();
