/*
 * Group Retirement dashboard decorator.
 * Rebuilds the authored text in a `.section.dashboard` into the designed cards.
 * Authored content stays editable in Universal Editor; this only re-renders it.
 */
const el = (tag, cls, html) => {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (html !== undefined) n.innerHTML = html;
  return n;
};

function decorateSavings(h2) {
  const label = h2.nextElementSibling; // "Your total assets"
  const total = label?.nextElementSibling; // $206,810.90
  const list = total?.nextElementSibling; // ul
  if (!list || list.tagName !== 'UL') return;
  const items = [...list.children];
  const card = el('div', 'db-card db-savings');
  card.append(
    el('p', 'db-label', label.textContent),
    el('p', 'db-total', total.textContent),
    el('div', 'db-bar', '<span></span>'),
  );
  const row = el('div', 'db-account');
  const [type, amount, ret, policy, details] = items;
  row.append(
    el('div', 'db-acct-type', type?.textContent || ''),
    el('div', 'db-acct-amount', amount?.textContent || ''),
    el('div', 'db-acct-return', `<span>1-year return</span><strong>${ret?.querySelector('strong')?.textContent || ''}</strong>`),
    el('div', 'db-acct-policy', policy?.innerHTML || ''),
    el('div', 'db-acct-details', details?.innerHTML || ''),
  );
  card.append(row);
  [label, total, list].forEach((n) => n.remove());
  h2.after(card);
}

function decorateIncome(h2) {
  const tabsP = h2.nextElementSibling;
  const h3 = tabsP?.nextElementSibling;
  const amt = h3?.nextElementSibling;
  const list = amt?.nextElementSibling;
  if (!list || list.tagName !== 'UL') return;
  const notes = [];
  let n = list.nextElementSibling;
  while (n && n.tagName === 'P') { notes.push(n); n = n.nextElementSibling; }

  const li = [...list.children];
  const max = li[0]?.textContent.trim();
  const min = li[1]?.textContent.trim();
  const parse = (s) => parseFloat(s.replace(/[^0-9.]/g, '')) || 0;
  const seg = li.slice(2).map((x) => ({
    value: x.querySelector('strong')?.textContent.trim() || '',
    label: x.textContent.replace(x.querySelector('strong')?.textContent || '', '').trim(),
  }));
  const total = seg.reduce((s, x) => s + parse(x.value), 0) || 1;

  const wrap = el('div', 'db-card db-income');
  const tabs = el('div', 'db-tabs');
  [...tabsP.querySelectorAll('a')].forEach((a, i) => {
    const b = el('button', i === 0 ? 'active' : '', a.textContent);
    b.type = 'button';
    b.addEventListener('click', () => {
      tabs.querySelectorAll('button').forEach((x) => x.classList.remove('active'));
      b.classList.add('active');
    });
    tabs.append(b);
  });
  const body = el('div', 'db-income-body');
  body.append(el('div', 'db-income-head', `<h3>${h3.textContent}</h3><p>${amt.textContent}</p>`));

  const chart = el('div', 'db-chart');
  const axis = el('div', 'db-axis', `<span>${max}</span><span>${min}</span>`);
  const bar = el('div', 'db-stack');
  seg.forEach((s, i) => {
    const part = el('div', `db-seg db-seg-${i}`);
    part.style.flexGrow = parse(s.value) / total;
    bar.append(part);
  });
  const text = el('div', 'db-chart-text');
  notes.forEach((p) => text.append(p));
  chart.append(axis, bar, text);

  const legend = el('div', 'db-legend');
  seg.forEach((s, i) => legend.append(el('div', `db-legend-item db-seg-${i}`, `<i></i><div><strong>${s.value}</strong><span>${s.label}</span></div>`)));

  body.append(chart, legend);
  wrap.append(tabs, body);
  [tabsP, h3, amt, list].forEach((x) => x.remove());
  h2.after(wrap);
}

function decorateQuickLinks(h2) {
  const list = h2.nextElementSibling;
  if (!list || list.tagName !== 'UL') return;
  const card = el('div', 'db-card db-links');
  card.append(list);
  h2.after(card);
}

function decorateActivity(h2) {
  const list = h2.nextElementSibling;
  if (!list || list.tagName !== 'OL') return;
  const btnP = list.nextElementSibling;
  const card = el('div', 'db-card db-activity');
  [...list.children].forEach((li) => {
    const [date, desc, amount] = li.textContent.split('|').map((s) => s.trim());
    card.append(el('div', 'db-txn', `<span class="db-txn-icon" aria-hidden="true">+</span><span class="db-txn-date">${date || ''}</span><span class="db-txn-desc">${desc || ''}</span><span class="db-txn-amt">${amount || ''}</span>`));
  });
  const a = btnP?.querySelector('a');
  if (a) {
    a.className = 'db-btn';
    card.append(a);
    btnP.remove();
  }
  list.remove();
  h2.after(card);
}

export default function decorateDashboard(main) {
  main.querySelectorAll('.section.dashboard').forEach((section) => {
    section.querySelectorAll('h2').forEach((h2) => {
      const t = h2.textContent.toLowerCase();
      if (t.includes('savings')) decorateSavings(h2);
      else if (t.includes('retirement income')) decorateIncome(h2);
      else if (t.includes('quick links')) decorateQuickLinks(h2);
      else if (t.includes('activity')) decorateActivity(h2);
    });
    if (!document.querySelector('.db-feedback')) {
      document.body.append(el('a', 'db-feedback', 'Feedback'));
    }
  });
}
