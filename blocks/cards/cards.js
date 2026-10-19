import { createOptimizedPicture } from '../../scripts/aem.js';

export default function decorate(block) {
  const ul = document.createElement('ul');

  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);

    [...li.children].forEach((cell) => {
      if (cell.children.length === 1 && cell.querySelector('picture')) {
        cell.className = 'cards-card-image';
      } else {
        cell.className = 'cards-card-body';
      }
    });
    ul.append(li);
  });

  // regenerate images at a sensible size (authored ones are tiny)
  ul.querySelectorAll('picture > img').forEach((img) => {
    img.closest('picture').replaceWith(
      createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]),
    );
  });

  block.replaceChildren(ul);
  // Cards (tiles): turn ":icon-name:" text into an icon, and make the first text line the title
  if (block.classList.contains('tiles')) {
    ul.querySelectorAll(':scope > li .cards-card-body').forEach((body) => {
      const [first, second] = body.children;

      const match = first?.textContent.trim().match(/^:([a-z0-9-]+):$/i);
      if (match) {
        const icon = document.createElement('span');
        icon.className = `icon icon-${match[1]}`;
        const img = document.createElement('img');
        img.alt = '';
        img.loading = 'lazy';
        img.src = `${window.hlx?.codeBasePath || ''}/icons/${match[1]}.svg`;
        icon.append(img);
        first.replaceWith(icon);
      }
  
      const titleEl = match ? body.children[1] : body.children[0];
      if (titleEl && !titleEl.querySelector('strong')) {
        const strong = document.createElement('strong');
        strong.append(...titleEl.childNodes);
        titleEl.append(strong);
      }
    });
  }
  // Insights variant: category pill on the image, plus prev/next arrows
  if (block.classList.contains('insights')) {
    ul.querySelectorAll(':scope > li').forEach((li) => {
      const image = li.querySelector('.cards-card-image');
      const tag = li.querySelector('.cards-card-body > p:first-child');
      if (image && tag) {
        tag.classList.add('cards-card-tag');
        image.append(tag);
      }
    });
    const nav = document.createElement('div');
    nav.className = 'cards-nav';
    ['prev', 'next'].forEach((dir) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.setAttribute('aria-label', dir);
      btn.textContent = dir === 'prev' ? '\u2039' : '\u203A';
      btn.addEventListener('click', () => {
        ul.scrollBy({ left: (dir === 'prev' ? -1 : 1) * ul.clientWidth, behavior: 'smooth' });
      });
      nav.append(btn);
    });
    block.append(nav);
  }
}
