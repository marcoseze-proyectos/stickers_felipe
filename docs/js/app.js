import { fetchProducts } from './api.js';
import { CONFIG } from './config.js';
import * as Cart from './cart.js';
import { money } from './cart.js';

const $ = (sel) => document.querySelector(sel);

const grid = $('#products-grid');
const filtersBox = $('#filters');
const searchInput = $('#search');
const sortSelect = $('#sort');
const modal = $('#cart-modal');
const cartBtn = $('#cart-btn');
const closeBtn = $('#close-cart');
const countEl = $('#cart-count');
const itemsBox = $('#cart-items');
const totalEl = $('#cart-total');
const checkoutBtn = $('#checkout-whatsapp');
const clearBtn = $('#clear-cart');
const toastEl = $('#toast');

let lastFocus = null;
let toastTimer;

/* ---------- helpers ---------- */
function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
}

function iconBtn(label, text, onClick, className = '') {
    const b = el('button', className, text);
    b.type = 'button';
    b.setAttribute('aria-label', label);
    b.addEventListener('click', onClick);
    return b;
}

function showToast(message) {
    toastEl.textContent = message;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('show'), 1800);
}

// "Dillóm" y "dillom" tienen que matchear igual
const normalize = (s) =>
    s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

/* ---------- estado de la tienda ---------- */
const state = { category: 'all', query: '', sort: 'default' };
let allProducts = [];

function getVisibleProducts() {
    const q = normalize(state.query);

    let list = allProducts.filter((p) => {
        const inCategory = state.category === 'all' || p.category === state.category;
        const inSearch = !q || normalize(`${p.title} ${p.category}`).includes(q);
        return inCategory && inSearch;
    });

    if (state.sort === 'asc') list = [...list].sort((a, b) => a.price - b.price);
    if (state.sort === 'desc') list = [...list].sort((a, b) => b.price - a.price);

    return list;
}

function refresh() {
    renderProducts(getVisibleProducts());
}

/* ---------- productos ---------- */
function renderProducts(products) {
    if (!products.length) {
        const msg = state.query
            ? `No encontramos stickers para “${state.query}”.`
            : 'No hay stickers para esta categoría.';
        grid.replaceChildren(el('p', 'empty-msg', msg));
        return;
    }

    const frag = document.createDocumentFragment();
    products.forEach((p) => {
        const card = el('article', 'card');

        const img = el('img', 'product-img');
        img.src = p.image;
        img.alt = p.title;
        img.loading = 'lazy';
        img.decoding = 'async';

        const add = el('button', 'add-btn', 'Agregar al carrito');
        add.type = 'button';
        add.addEventListener('click', () => {
            flyToCart(img);
            Cart.add(p.id);
            showToast(`✓ ${p.title}`);
        });

        card.append(
            img,
            el('span', 'category-tag', p.category),
            el('h3', '', p.title),
            el('p', 'price', money(p.price)),
            add
        );
        frag.append(card);
    });
    grid.replaceChildren(frag);
}

function renderFilters(products) {
    const categories = [...new Set(products.map((p) => p.category))];
    const buttons = ['all', ...categories].map((cat, i) => {
        const b = el('button', 'filter-btn' + (i === 0 ? ' active' : ''), cat === 'all' ? 'Todos' : cat);
        b.type = 'button';
        b.dataset.filter = cat;
        b.setAttribute('aria-pressed', i === 0);
        return b;
    });
    filtersBox.replaceChildren(...buttons);

    filtersBox.addEventListener('click', (e) => {
        const btn = e.target.closest('.filter-btn');
        if (!btn) return;
        filtersBox.querySelectorAll('.filter-btn').forEach((b) => {
            const on = b === btn;
            b.classList.toggle('active', on);
            b.setAttribute('aria-pressed', on);
        });
        state.category = btn.dataset.filter;
        refresh();
    });
}

/* ---------- animación de vuelo ---------- */
function flyToCart(img) {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const a = img.getBoundingClientRect();
    const b = cartBtn.getBoundingClientRect();
    const fly = img.cloneNode();
    fly.removeAttribute('loading');
    fly.className = 'fly-img';
    Object.assign(fly.style, {
        left: `${a.left}px`, top: `${a.top}px`,
        width: `${a.width}px`, height: `${a.height}px`
    });
    document.body.append(fly);

    requestAnimationFrame(() => requestAnimationFrame(() => {
        Object.assign(fly.style, {
            left: `${b.left + b.width / 2 - 10}px`, top: `${b.top}px`,
            width: '20px', height: '20px', opacity: '0.4'
        });
    }));
    setTimeout(() => fly.remove(), 800);
}

/* ---------- carrito ---------- */
let prevCount = 0;

function renderCart() {
    const lines = Cart.getLines();
    const count = Cart.count();

    countEl.textContent = count;
    if (count > prevCount) {
        countEl.classList.remove('bump');
        void countEl.offsetWidth; // reinicia la animación
        countEl.classList.add('bump');
    }
    prevCount = count;

    totalEl.textContent = money(Cart.total());
    checkoutBtn.disabled = lines.length === 0;
    clearBtn.hidden = lines.length === 0;

    if (!lines.length) {
        itemsBox.replaceChildren(el('p', 'empty-cart', 'El carrito está vacío.'));
        return;
    }

    itemsBox.replaceChildren(...lines.map(({ product: p, qty }) => {
        const row = el('div', 'cart-item');

        const thumb = el('img', 'cart-thumb');
        thumb.src = p.image;
        thumb.alt = '';

        const info = el('div', 'cart-info');
        info.append(el('span', 'cart-title', p.title), el('span', 'cart-unit', money(p.price)));

        const qtyBox = el('div', 'qty');
        qtyBox.append(
            iconBtn(`Quitar uno de ${p.title}`, '−', () => Cart.change(p.id, -1)),
            el('span', '', String(qty)),
            iconBtn(`Agregar uno de ${p.title}`, '+', () => Cart.change(p.id, 1))
        );

        const sub = el('span', 'cart-sub', money(p.price * qty));
        const rm = iconBtn(`Eliminar ${p.title}`, '×', () => Cart.remove(p.id), 'remove-btn');

        row.append(thumb, info, rm, qtyBox, sub);
        return row;
    }));
}

function toggleCart(open) {
    modal.classList.toggle('open', open);
    modal.setAttribute('aria-hidden', String(!open));
    document.body.classList.toggle('no-scroll', open);
    if (open) {
        lastFocus = document.activeElement;
        closeBtn.focus();
    } else {
        lastFocus?.focus();
    }
}

function sendWhatsAppOrder() {
    const lines = Cart.getLines();
    if (!lines.length) return;

    const detail = lines
        .map(({ product: p, qty }) => `• ${p.title} x${qty} — ${money(p.price * qty)}`)
        .join('\n');

    const msg =
        `Hola! Quiero encargar los siguientes stickers:\n\n${detail}\n\n` +
        `*Total: ${money(Cart.total())}*\n` +
        `¿Cómo coordinamos el pago y el retiro por el Showroom en CABA / envío?`;

    window.open(`https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener');
}

/* ---------- init ---------- */
cartBtn.addEventListener('click', () => toggleCart(true));
closeBtn.addEventListener('click', () => toggleCart(false));
modal.addEventListener('click', (e) => { if (e.target === modal) toggleCart(false); });
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('open')) toggleCart(false);
});
checkoutBtn.addEventListener('click', sendWhatsAppOrder);
clearBtn.addEventListener('click', () => {
    if (confirm('¿Vaciar el carrito?')) Cart.clear();
});

searchInput.addEventListener('input', () => {
    state.query = searchInput.value;
    refresh();
});
sortSelect.addEventListener('change', () => {
    state.sort = sortSelect.value;
    refresh();
});

try {
    allProducts = await fetchProducts();
    Cart.initCart(allProducts);
    Cart.subscribe(renderCart);
    renderFilters(allProducts);
    refresh();
} catch (err) {
    console.error(err);
    grid.replaceChildren(el('p', 'empty-msg', 'No pudimos cargar los stickers. Probá recargar la página.'));
}