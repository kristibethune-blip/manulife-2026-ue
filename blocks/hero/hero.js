export default function decorate(block) {
  const picture = block.querySelector('picture');
  const bg = document.createElement('div');
  bg.className = 'hero-bg';

  if (picture) {
    const img = picture.querySelector('img');
    if (img) {
      img.loading = 'eager';
      img.removeAttribute('width');
      img.removeAttribute('height');
    }
    const parent = picture.parentElement;
    bg.append(picture);
    // remove the empty <p> the image was wrapped in
    if (parent && parent !== block && !parent.children.length && !parent.textContent.trim()) {
      parent.remove();
    }
  } else {
    block.classList.add('no-image');
  }

  const content = document.createElement('div');
  content.className = 'hero-content';
  const cell = block.querySelector(':scope > div > div') || block;
  content.append(...cell.childNodes);

  block.replaceChildren(bg, content);
}
