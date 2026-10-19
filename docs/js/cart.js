import { CONFIG } from './config.js';

const KEY = 'stickers_cart_v1';
const listeners = new Set();
let catalog = new Map();
let items = []; // [{ id, qty }]

export const money = (n) =>
    new Intl.NumberFormat(CONFIG.locale, {
        style: 'currency',
        currency: CONFIG.currency,
        maximumFractionDigits: 0
    }).format(n);

export function initCart(products) {
    catalog = new Map(products.map((p) => [p.id, p]));
    try {
        const raw = JSON.parse(localStorage.getItem(KEY));
        items = Array.isArray(raw)
            ? raw.filter((i) => catalog.has(i.id) && Number.isInteger(i.qty) && i.qty > 0)
            : [];
    } catch {
        items = [];
    }
    emit();
}

export const subscribe = (fn) => { listeners.add(fn); fn(); };

function emit() {
    try { localStorage.setItem(KEY, JSON.stringify(items)); } catch { /* modo privado */ }
    listeners.forEach((fn) => fn());
}

export function add(id) {
    const found = items.find((i) => i.id === id);
    found ? found.qty++ : items.push({ id, qty: 1 });
    emit();
}

export function change(id, delta) {
    const found = items.find((i) => i.id === id);
    if (!found) return;
    found.qty += delta;
    if (found.qty <= 0) items = items.filter((i) => i.id !== id);
    emit();
}

export function remove(id) {
    items = items.filter((i) => i.id !== id);
    emit();
}

export function clear() {
    items = [];
    emit();
}

export const getLines = () =>
    items.map((i) => ({ product: catalog.get(i.id), qty: i.qty }));

export const count = () => items.reduce((s, i) => s + i.qty, 0);

export const total = () =>
    items.reduce((s, i) => s + catalog.get(i.id).price * i.qty, 0);