import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

function closeAll(nav) {
  nav.querySelectorAll('.nav-drop[aria-expanded="true"]')
    .forEach((li) => li.setAttribute('aria-expanded', 'false'));
}

function toggleDrop(nav, li) {
  const open = li.getAttribute('aria-expanded') === 'true';
  closeAll(nav);
  li.setAttribute('aria-expanded', open ? 'false' : 'true');
}

function row(className, ...children) {
  const outer = document.createElement('div');
  outer.className = className;
  const inner = document.createElement('div');
  inner.className = 'nav-inner';
  inner.append(...children);
  outer.append(inner);
  return outer;
}

export default async function decorate(block) {
  const meta = getMetadata('nav');
  const navPath = meta ? new URL(meta, window.location).pathname : '/nav';
  const fragment = await loadFragment(navPath);

  block.textContent = '';
  const nav = document.createElement('nav');
  nav.id = 'nav';
  nav.setAttribute('aria-expanded', 'false');
  while (fragment.firstElementChild) nav.append(fragment.firstElementChild);

  const names = ['utility-left', 'utility-right', 'brand', 'tools', 'sections'];
  names.forEach((name, i) => {
    if (nav.children[i]) nav.children[i].classList.add(`nav-${name}`);
  });
  const [left, right, brand, tools, sections] = names
    .map((n) => nav.querySelector(`.nav-${n}`));

  // utility bar: region, language, audience tabs
  left?.querySelectorAll('li').forEach((li, i) => {
    if (i === 0) li.classList.add('nav-region');
    if (i === 1) li.classList.add('nav-lang');
    const strong = li.querySelector('strong');
    if (strong) {
      li.classList.add('active');
      strong.replaceWith(...strong.childNodes);
    }
  });

  // sign in: make sure the bold link is styled as a button
  tools?.querySelectorAll('strong a').forEach((a) => a.classList.add('button'));

  // main nav dropdowns
  sections?.querySelectorAll(':scope > .default-content-wrapper > ul > li').forEach((li) => {
    if (!li.querySelector(':scope > ul')) return;
    li.classList.add('nav-drop');
    li.setAttribute('aria-expanded', 'false');
    const first = li.firstChild;
    if (first && first.nodeType === Node.TEXT_NODE) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'nav-drop-btn';
      const label = document.createElement('span');
      label.textContent = first.textContent.trim();
      btn.append(label);
      first.remove();
      li.prepend(btn);
      btn.addEventListener('click', () => toggleDrop(nav, li));
    } else if (first) {
      first.addEventListener('click', (e) => {
        if (!window.matchMedia('(width >= 900px)').matches) {
          e.preventDefault();
          toggleDrop(nav, li);
        }
      });
    }
  });

  // hamburger (mobile only, hidden by CSS on desktop)
  const hamburger = document.createElement('button');
  hamburger.type = 'button';
  hamburger.className = 'nav-hamburger';
  hamburger.setAttribute('aria-label', 'Open menu');
  hamburger.addEventListener('click', () => {
    const open = nav.getAttribute('aria-expanded') === 'true';
    nav.setAttribute('aria-expanded', open ? 'false' : 'true');
    hamburger.setAttribute('aria-label', open ? 'Open menu' : 'Close menu');
  });

  const utilityRow = row('nav-utility', ...[left, right].filter(Boolean));
  const brandRow = row('nav-main', ...[brand, tools].filter(Boolean), hamburger);
  const barRow = row('nav-bar', ...[sections].filter(Boolean));
  nav.replaceChildren(utilityRow, brandRow, barRow);

  document.addEventListener('click', (e) => { if (!nav.contains(e.target)) closeAll(nav); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeAll(nav); });

  block.append(nav);
}
