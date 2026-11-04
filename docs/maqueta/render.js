// Renderiza una pantalla .dc.html con un motor mínimo (sc-for, sc-if, {{ }}, onClick/onInput)
// Uso: node render.js <archivo> [salida.png] [--medir] [--click <selector>]...
const { chromium } = require('playwright');
const fs = require('fs');

const engine = () => {
  const scriptEl = document.querySelector('script[data-dc-script]');
  const code = scriptEl.textContent;
  let renderFn = () => {};
  class DCLogic {
    constructor(props) { this.props = props || {}; this.state = {}; }
    setState(s) { Object.assign(this.state, typeof s === 'function' ? s(this.state) : s); renderFn(); }
  }
  const Component = new Function('DCLogic', code + '\n;return Component;')(DCLogic);
  const inst = new Component({});
  const root = document.querySelector('x-dc');
  const helmet = root.querySelector('helmet');
  const orig = [...root.childNodes].filter((n) => n !== helmet);
  const tpl = orig.map((n) => n.cloneNode(true));
  orig.forEach((n) => n.remove());
  const errors = [];
  const ev = (expr, scope) => {
    try {
      const keys = Object.keys(scope);
      return new Function(...keys, 'return (' + expr + ');')(...keys.map((k) => scope[k]));
    } catch (e) { errors.push(expr + ': ' + e.message); return undefined; }
  };
  const interp = (str, scope) => {
    const m = str.match(/^\s*\{\{\s*([^}]+?)\s*\}\}\s*$/);
    if (m) return ev(m[1], scope);
    return str.replace(/\{\{\s*([^}]+?)\s*\}\}/g, (_, e) => { const v = ev(e, scope); return v === undefined ? '' : String(v); });
  };
  const build = (node, scope, out) => {
    if (node.nodeType === 3) { out.push(document.createTextNode(String(interp(node.textContent, scope) ?? ''))); return; }
    if (node.nodeType !== 1) return;
    const tag = node.tagName.toLowerCase();
    if (tag === 'sc-for') {
      const list = interp(node.getAttribute('list'), scope) || [];
      const as = node.getAttribute('as');
      if (!Array.isArray(list)) errors.push('sc-for sin lista: ' + node.getAttribute('list'));
      (list || []).forEach((item, i) => { const s = { ...scope, [as]: item }; node.childNodes.forEach((c) => build(c, s, out)); });
      return;
    }
    if (tag === 'sc-if') {
      const v = interp(node.getAttribute('value'), scope);
      if (v === undefined) errors.push('sc-if indefinido: ' + node.getAttribute('value'));
      if (v) node.childNodes.forEach((c) => build(c, scope, out));
      return;
    }
    const target = node.namespaceURI === 'http://www.w3.org/1999/xhtml' ? document.createElement(tag) : document.createElementNS(node.namespaceURI, node.tagName);
    for (const a of node.attributes) {
      const name = a.name;
      if (/^on[a-z]+$/.test(name)) {
        const fn = interp(a.value, scope);
        if (typeof fn !== 'function') { errors.push('handler no es función: ' + a.value); continue; }
        const evName = name.slice(2);
        target.addEventListener(evName === 'input' ? 'input' : evName, fn);
        continue;
      }
      const v = interp(a.value, scope);
      if (v === undefined) errors.push('atributo indefinido ' + name + '=' + a.value);
      if (v === false || v === null) continue;
      target.setAttribute(name, v === true ? '' : String(v));
    }
    node.childNodes.forEach((c) => {
      const kids = []; build(c, scope, kids); kids.forEach((k) => target.appendChild(k));
    });
    out.push(target);
  };
  let current = [];
  renderFn = () => {
    const vals = inst.renderVals();
    current.forEach((n) => n.remove());
    current = [];
    tpl.forEach((t) => build(t, vals, current));
    current.forEach((n) => root.appendChild(n));
  };
  renderFn();
  window.__dcErrors = errors;
  return errors;
};

(async () => {
  const args = process.argv.slice(2);
  const file = args[0];
  const out = args[1] && !args[1].startsWith('--') ? args[1] : null;
  const medir = args.includes('--medir');
  const clicks = [];
  args.forEach((a, i) => { if (a === '--click') clicks.push(args[i + 1]); });
  let html = fs.readFileSync(file, 'utf8').replace('<script src="./support.js"></script>', '');
  if (medir) html = html.replace(/(<div style="width: 390px; )(min-)?height: \d+px;/, '$1');
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 390, height: 1600 } });
  await p.setContent(html, { waitUntil: 'networkidle' });
  const errs = await p.evaluate(engine);
  for (const c of clicks) await p.locator(c).first().click();
  await p.waitForTimeout(150);
  const allErrs = await p.evaluate(() => window.__dcErrors);
  if (allErrs.length) console.log('ERRORES:', [...new Set(allErrs)].join('\n'));
  const h = await p.evaluate(() => document.querySelector('x-dc > div').getBoundingClientRect().height);
  const sw = await p.evaluate(() => document.documentElement.scrollWidth);
  console.log(file.split('/').pop(), 'alto', Math.round(h), 'scrollWidth', sw);
  if (out) await p.locator('x-dc > div').first().screenshot({ path: out });
  await b.close();
})();
