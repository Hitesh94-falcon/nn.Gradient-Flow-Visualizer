async function updateGraph() {
  const x1 = document.getElementById("x1").value;
  const x2 = document.getElementById("x2").value;
  const w1 = document.getElementById("w1").value;
  const w2 = document.getElementById("w2").value;
  const b = document.getElementById("b").value;
  const activation = document.getElementById("activation").value;


  const res = await fetch(`/graph?x1=${x1}&x2=${x2}&w1=${w1}&w2=${w2}&b=${b}&activation=${activation}`);
  const svg = await res.text();
  const graphBox = document.getElementById("graph");
  graphBox.innerHTML = svg;

  const svgEl = graphBox.querySelector('svg');
  if (!svgEl) return;

  // Ensure SVG has viewBox
  const bbox = getSvgContentBBox(svgEl);
  ensureViewBox(svgEl, bbox);

  // Apply initial fit
  fitToContainer(svgEl);

  // Enable interactions
  enablePanZoom(svgEl);
}

document.getElementById("update-btn").addEventListener("click", updateGraph);
window.onload = () => {
  updateGraph();
  wireZoomButtons();
  window.addEventListener('resize', () => {
    const svgEl = document.querySelector('#graph svg');
    if (svgEl) fitToContainer(svgEl);
  });
};

function getSvgContentBBox(svgEl) {
  // Wrap all children in a group to measure content bbox without changing layout
  const temp = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  while (svgEl.firstChild) temp.appendChild(svgEl.firstChild);
  svgEl.appendChild(temp);
  const bbox = temp.getBBox();
  // put children back
  while (temp.firstChild) svgEl.appendChild(temp.firstChild);
  svgEl.removeChild(temp);
  return bbox;
}

function ensureViewBox(svgEl, bbox) {
  const padding = 20;
  const minX = Math.floor(bbox.x) - padding;
  const minY = Math.floor(bbox.y) - padding;
  const width = Math.ceil(bbox.width) + padding * 2;
  const height = Math.ceil(bbox.height) + padding * 2;
  svgEl.setAttribute('preserveAspectRatio', 'xMidYMid meet');
  svgEl.setAttribute('viewBox', `${minX} ${minY} ${width} ${height}`);
}

function fitToContainer(svgEl) {
  const container = svgEl.parentElement;
  const cW = container.clientWidth;
  const cH = container.clientHeight;
  svgEl.style.width = `${cW}px`;
  svgEl.style.height = `${cH}px`;
}

function enablePanZoom(svgEl) {
  let isPanning = false;
  let start = { x: 0, y: 0 };
  let viewBox = svgEl.getAttribute('viewBox').split(' ').map(Number);
  let zoom = 1;

  function setViewBox(x, y, w, h) {
    svgEl.setAttribute('viewBox', `${x} ${y} ${w} ${h}`);
  }

  function current() { return svgEl.getAttribute('viewBox').split(' ').map(Number); }

  svgEl.addEventListener('mousedown', (e) => {
    isPanning = true;
    const [x, y, w, h] = current();
    start = { x: e.clientX, y: e.clientY, x0: x, y0: y, w, h };
  });

  window.addEventListener('mousemove', (e) => {
    if (!isPanning) return;
    const dx = ((e.clientX - start.x) * start.w) / svgEl.clientWidth;
    const dy = ((e.clientY - start.y) * start.h) / svgEl.clientHeight;
    setViewBox(start.x0 - dx, start.y0 - dy, start.w, start.h);
  });

  window.addEventListener('mouseup', () => { isPanning = false; });

  svgEl.addEventListener('wheel', (e) => {
    e.preventDefault();
    const delta = Math.sign(e.deltaY);
    const [x, y, w, h] = current();
    const zoomFactor = 1 + (delta > 0 ? 0.15 : -0.15);
    const mx = (e.offsetX / svgEl.clientWidth) * w + x;
    const my = (e.offsetY / svgEl.clientHeight) * h + y;
    const newW = w * zoomFactor;
    const newH = h * zoomFactor;
    const newX = mx - (e.offsetX / svgEl.clientWidth) * newW;
    const newY = my - (e.offsetY / svgEl.clientHeight) * newH;
    setViewBox(newX, newY, newW, newH);
    zoom = (svgEl._initialViewBoxW || w) / newW;
  }, { passive: false });

  svgEl._initialViewBox = svgEl.getAttribute('viewBox');
  svgEl._initialViewBoxW = Number(svgEl._initialViewBox.split(' ')[2]);
  svgEl._initialViewBoxH = Number(svgEl._initialViewBox.split(' ')[3]);

  svgEl._panZoomAPI = {
    zoomBy: (factor) => {
      const [x, y, w, h] = current();
      const cX = x + w / 2;
      const cY = y + h / 2;
      const newW = w / factor;
      const newH = h / factor;
      setViewBox(cX - newW / 2, cY - newH / 2, newW, newH);
    },
    reset: () => {
      const parts = svgEl._initialViewBox.split(' ').map(Number);
      setViewBox(parts[0], parts[1], parts[2], parts[3]);
    },
    fit: () => fitToContainer(svgEl)
  };
}

function wireZoomButtons() {
  const svgEl = () => document.querySelector('#graph svg');
  const plus = document.getElementById('zoom-in');
  const minus = document.getElementById('zoom-out');
  const reset = document.getElementById('zoom-reset');
  const fit = document.getElementById('zoom-fit');

  if (plus) plus.addEventListener('click', () => svgEl()?._panZoomAPI?.zoomBy(1.25));
  if (minus) minus.addEventListener('click', () => svgEl()?._panZoomAPI?.zoomBy(0.8));
  if (reset) reset.addEventListener('click', () => svgEl()?._panZoomAPI?.reset());
  if (fit) fit.addEventListener('click', () => svgEl()?._panZoomAPI?.fit());
}
