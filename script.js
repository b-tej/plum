

const layers = Array.from(document.querySelectorAll(".layer"));

// bite settings
const bitesToClear = 7;
let biteCount = 0;

function addToothyBite(holesGroup, x, y) {
  const ns = "http://www.w3.org/2000/svg";

  // cluster settings (tweak these)
  const n = 20;                               // number of circles in the cluster
  const base = 40 + Math.random() * 6;        // average radius
  const spread = base * 1.6;                  // how wide the cluster spreads
  const dir = Math.random() * Math.PI * 2;    // overall bite direction

  // helper: stamp a circle
  function stampCircle(cx, cy, r) {
    const c = document.createElementNS(ns, "circle");
    c.setAttribute("cx", cx);
    c.setAttribute("cy", cy);
    c.setAttribute("r", r);
    c.setAttribute("fill", "black");
    holesGroup.appendChild(c);
  }

  // helper: stamp an ellipse (optional; makes it feel more organic)
  function stampEllipse(cx, cy, rx, ry, rotDeg) {
    const e = document.createElementNS(ns, "ellipse");
    e.setAttribute("cx", cx);
    e.setAttribute("cy", cy);
    e.setAttribute("rx", rx);
    e.setAttribute("ry", ry);
    e.setAttribute("fill", "black");
    e.setAttribute("transform", `rotate(${rotDeg} ${cx} ${cy})`);
    holesGroup.appendChild(e);
  }

  for (let i = 0; i < n; i++) {
    // Place points in a lopsided cluster that has a "tooth edge":
    // - more points near the outer edge (dir)
    // - fewer points behind it
    const t = i / (n - 1);

    // angle around the bite direction (small arc)
    const arc = (Math.random() - 0.5) * 1.4; // radians
    const a = dir + arc;

    // radius from center: bias outward so it forms an edge
    const outwardBias = 0.45 + 0.55 * Math.pow(Math.random(), 0.6);
    const d = outwardBias * spread;

    const cx = x + Math.cos(a) * d;
    const cy = y + Math.sin(a) * d;

    // near-even sizes (not identical)
    const r = base * (0.8 + Math.random() * 0.35);

    // Mix circles + ellipses for organic look
    if (Math.random() < 0.45) {
      const rx = r * (0.85 + Math.random() * 0.35);
      const ry = r * (0.85 + Math.random() * 0.35);
      const rot = (Math.random() * 50) - 25;
      stampEllipse(cx, cy, rx, ry, rot);
    } else {
      stampCircle(cx, cy, r);
    }
  }
}



function biteActiveLayer(e) {

  const active = document.querySelector(".layer.active");
  if (!active) return;

  const rect = active.getBoundingClientRect();
  const x = ((e.clientX - rect.left) / rect.width) * 500;
  const y = ((e.clientY - rect.top) / rect.height) * 500;

  // only allow bites inside the circle
  const dx = x - 250, dy = y - 250;
  if (dx * dx + dy * dy > 250 * 250) return;

  active.classList.add("wiggle");

  setTimeout(() => {
    active.classList.remove("wiggle");
  }, 180);

  new Audio('sounds/bitesound.mp3').play();

  const layerIndex = active.dataset.layer; // "0" or "1"
  const holesGroup = document.getElementById(`holes${layerIndex}`);


  addToothyBite(holesGroup, x, y);


  // const r = 45 + Math.random() * 18; // bite size
  // const hole = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  // hole.setAttribute("cx", x);
  // hole.setAttribute("cy", y);
  // hole.setAttribute("r", r);
  // hole.setAttribute("fill", "black");
  // holesGroup.appendChild(hole);

  biteCount++;

  // clear the layer after enough bites
  if (biteCount >= bitesToClear) {
    advanceLayer(active);
  }
}

function advanceLayer(currentActive) {
  currentActive.classList.remove("active");
  currentActive.style.display = "none"; // remove top completely

  biteCount = 0; // reset for next layer

  // find the next layer underneath (the one with the next highest layer number)
  const next = layers
    .filter(l => l.style.display !== "none" && !l.classList.contains("active"))
    .pop(); // because last in DOM is top; after hiding, next top is last remaining

  if (next) next.classList.add("active");
}

// attach click handler to the whole stack, but only active layer will respond
document.querySelector(".stack").addEventListener("click", biteActiveLayer);



