/* ---------- SHARED CONFIG ---------- */
const POSTIT_COLORS = ['#FFFF99', '#FFB3D9', '#B3FFB3', '#B3D9FF', '#D9B3FF'];
const IS_DESKTOP = window.matchMedia('(min-width: 1101px)').matches;
let currentPreviewColor = POSTIT_COLORS[0];

/* ---------- POSTIT PERSISTENCE (page-specific) ---------- */
function savePostits() {
  const postits = Array.from(document.querySelectorAll('.user-postit')).map(el => ({
    text: el.textContent,
    left: el.style.left,
    top: el.style.top,
    background: el.style.background,
    transform: el.style.transform
  }));
  localStorage.setItem('userPostits_' + location.pathname, JSON.stringify(postits));
}

function loadSavedPostits() {
  if (!IS_DESKTOP) return;
  const saved = JSON.parse(localStorage.getItem('userPostits_' + location.pathname));
  if (saved) {
    saved.forEach(data => {
      const postit = document.createElement('div');
      postit.className = 'user-postit';
      postit.textContent = data.text;
      postit.style.left = data.left;
      postit.style.top = data.top;
      postit.style.background = data.background;
      postit.style.transform = data.transform;
      document.body.appendChild(postit);
      makeDraggable(postit);
    });
  }
}

/* ---------- DRAGGABLE ---------- */
function makeDraggable(el) {
  let startX, startY, origX, origY, dragging = false;
  const onDown = (e) => {
    if (e.target.tagName === 'A') return;
    if (el.isContentEditable && document.activeElement === el) return;
    dragging = true;
    el.classList.add('dragging');
    const pt = e.touches ? e.touches[0] : e;
    startX = pt.clientX;
    startY = pt.clientY;
    if (el.style.left && el.style.top) {
      origX = parseFloat(el.style.left);
      origY = parseFloat(el.style.top);
    } else {
      const rect = el.getBoundingClientRect();
      const parentRect = el.offsetParent.getBoundingClientRect();
      origX = rect.left - parentRect.left;
      origY = rect.top - parentRect.top;
      el.style.left = origX + 'px';
      el.style.top = origY + 'px';
      el.style.right = 'auto';
      el.style.bottom = 'auto';
    }
    e.preventDefault();
  };
  const onMove = (e) => {
    if (!dragging) return;
    const pt = e.touches ? e.touches[0] : e;
    el.style.left = (origX + pt.clientX - startX) + 'px';
    el.style.top = (origY + pt.clientY - startY) + 'px';
    savePostits();
  };
  const onUp = () => {
    if (!dragging) return;
    dragging = false;
    el.classList.remove('dragging');
    const rect = el.getBoundingClientRect();
    if (rect.right < 0 || rect.left > window.innerWidth || rect.bottom < 0 || rect.top > window.innerHeight) {
      el.remove();
      savePostits();
    }
  };
  el.addEventListener('mousedown', onDown);
  el.addEventListener('touchstart', onDown, { passive: false });
  document.addEventListener('mousemove', onMove);
  document.addEventListener('touchmove', onMove, { passive: false });
  document.addEventListener('mouseup', onUp);
  document.addEventListener('touchend', onUp);
}

/* ---------- CURSOR DOT ---------- */
if (IS_DESKTOP) {
  document.addEventListener('DOMContentLoaded', () => {
    const cursorDot = document.getElementById('cursor-dot');
    if (!cursorDot) return;
    let wasInteractive = true;

    document.addEventListener('mousemove', (e) => {
      cursorDot.style.left = e.clientX + 'px';
      cursorDot.style.top = e.clientY + 'px';

      const isInteractive = e.target.closest('a, .photo-postit, .user-postit, .gutter-postit, button, input, textarea');
      cursorDot.style.opacity = isInteractive ? '0' : '1';

      if (!isInteractive && wasInteractive) {
        currentPreviewColor = POSTIT_COLORS[Math.floor(Math.random() * POSTIT_COLORS.length)];
        cursorDot.style.background = currentPreviewColor;
      }
      wasInteractive = isInteractive;
    });
  });
}

/* ---------- CREATE NEW POSTIT ---------- */
document.addEventListener('dblclick', (e) => {
  if (!IS_DESKTOP) return;
  if (e.target.closest('.photo-postit, .user-postit, .gutter-postit, a, button, input, textarea')) return;
  const postit = document.createElement('div');
  postit.className = 'user-postit';
  postit.contentEditable = 'true';
  postit.style.background = currentPreviewColor;
  postit.style.left = (e.pageX - 60) + 'px';
  postit.style.top = (e.pageY - 60) + 'px';
  if (Math.random() < 0.2) {
    postit.style.transform = `rotate(${(Math.random() * 6 - 3).toFixed(1)}deg)`;
  }
  document.body.appendChild(postit);
  makeDraggable(postit);
  postit.addEventListener('blur', savePostits);
  setTimeout(() => postit.focus(), 0);
});

/* ---------- INIT ---------- */
document.addEventListener('DOMContentLoaded', loadSavedPostits);
