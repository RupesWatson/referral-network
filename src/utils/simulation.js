// Force-directed simulation — ported from referral-network.html
const REPULSION   = 8000;
const SPRING_LEN  = 150;
const SPRING_K    = 0.05;
const GRAVITY     = 0.02;
const DAMPING     = 0.85;
const MAX_TICKS   = 300;
const SETTLE_VEL  = 0.3;

export function createSimNode(data) {
  return {
    ...data,
    x:     (Math.random() - 0.5) * 400,
    y:     (Math.random() - 0.5) * 400,
    vx:    0,
    vy:    0,
    fx:    0,
    fy:    0,
    fixed: false,
  };
}

/** Run one simulation tick. Returns max velocity (use to detect settlement). */
export function stepSimulation(nodes, edges) {
  const n = nodes.length;
  if (n === 0) return 0;

  // Reset forces
  for (let i = 0; i < n; i++) { nodes[i].fx = 0; nodes[i].fy = 0; }

  // Repulsion between all node pairs
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const a = nodes[i], b = nodes[j];
      const dx = a.x - b.x, dy = a.y - b.y;
      const dSq = dx * dx + dy * dy + 1;
      const d   = Math.sqrt(dSq);
      if (d > 500) continue;
      const f  = REPULSION / dSq;
      const fx = (dx / d) * f, fy = (dy / d) * f;
      a.fx += fx; a.fy += fy;
      b.fx -= fx; b.fy -= fy;
    }
  }

  // Spring forces along edges
  const nodeMap = new Map(nodes.map(n => [n.id, n]));
  for (const e of edges) {
    const s = nodeMap.get(e.sourceId), t = nodeMap.get(e.targetId);
    if (!s || !t) continue;
    const dx = t.x - s.x, dy = t.y - s.y;
    const d  = Math.sqrt(dx * dx + dy * dy) || 1;
    const f  = SPRING_K * (d - SPRING_LEN);
    const fx = (dx / d) * f, fy = (dy / d) * f;
    s.fx += fx; s.fy += fy;
    t.fx -= fx; t.fy -= fy;
  }

  // Gravity toward centre
  for (let i = 0; i < n; i++) {
    nodes[i].fx -= nodes[i].x * GRAVITY;
    nodes[i].fy -= nodes[i].y * GRAVITY;
  }

  // Integrate
  let maxVel = 0;
  for (let i = 0; i < n; i++) {
    const nd = nodes[i];
    if (nd.fixed) continue;
    nd.vx = (nd.vx + nd.fx) * DAMPING;
    nd.vy = (nd.vy + nd.fy) * DAMPING;
    const vel = Math.sqrt(nd.vx * nd.vx + nd.vy * nd.vy);
    if (vel > maxVel) maxVel = vel;
    nd.x += nd.vx;
    nd.y += nd.vy;
  }

  return maxVel;
}

export function hasSettled(maxVel, tickCount) {
  return tickCount > MAX_TICKS || maxVel < SETTLE_VEL;
}

/** Lay out nodes in columns by type */
export function applyColumnLayout(nodes, layoutType) {
  const byType = {};
  for (const n of nodes) {
    if (!byType[n.type]) byType[n.type] = [];
    byType[n.type].push(n);
  }

  const col = (list, x, baseY = 0, sp = 150) => {
    const total = list.length;
    list.forEach((nd, i) => {
      nd.x  = x + (Math.random() - 0.5) * 20;
      nd.y  = baseY + (i - (total - 1) / 2) * sp;
      nd.vx = 0; nd.vy = 0;
    });
  };

  const circle = (list, cx, cy, r) => {
    list.forEach((nd, i) => {
      const a = (i / Math.max(list.length, 1)) * Math.PI * 2;
      nd.x  = cx + Math.cos(a) * r;
      nd.y  = cy + Math.sin(a) * r;
      nd.vx = 0; nd.vy = 0;
    });
  };

  const g = type => byType[type] || [];

  if (layoutType === 'by-type') {
    ['organisation','referrer','client','adviser','prospect','jpmorgan'].forEach((t, i) =>
      col(g(t), (i - 2.5) * 220));
  } else if (layoutType === 'clients-prospects') {
    col(g('referrer'),     -400, 0);
    col(g('client'),       -200, 0);
    col(g('adviser'),          0, 0);
    col(g('prospect'),       200, 0);
    col(g('jpmorgan'),     -400, -300);
    col(g('organisation'),   400, 0);
  } else if (layoutType === 'referrers-hub') {
    circle(g('referrer'), 0, 0, 120);
    circle([...g('client'),...g('prospect'),...g('adviser'),...g('jpmorgan')], 0, 0, 320);
    col(g('organisation'), 500, 0);
  } else if (layoutType === 'jpmorgan-view') {
    col(g('jpmorgan'),     -400, 0);
    col(g('organisation'), -150, 0);
    col(g('client'),         100, 0);
    col(g('referrer'),       300, 0);
    col(g('prospect'),       500, 0);
    col(g('adviser'),        100, -300);
  }
}

export function generateId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function getInitials(name) {
  return (name || '?').split(' ').slice(0, 2).map(p => p[0] || '').join('').toUpperCase();
}
