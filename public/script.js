async function updateGraph() {
  const x = document.getElementById("x").value;
  const y = document.getElementById("y").value;
  const z = document.getElementById("z").value;
  const activation = document.getElementById("activation").value;

  const res = await fetch(`/graph?x=${x}&y=${y}&z=${z}&activation=${activation}`);
  const svg = await res.text();
  document.getElementById("graph").innerHTML = svg;
}

document.getElementById("update-btn").addEventListener("click", updateGraph);
window.onload = updateGraph;
