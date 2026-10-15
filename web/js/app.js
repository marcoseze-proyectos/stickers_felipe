import { fetchProducts } from './api.js';

document.addEventListener('DOMContentLoaded', async () => {
    const products = await fetchProducts();
    renderProducts(products);
});

function renderProducts(products) {
    const grid = document.getElementById('products-grid');
    grid.innerHTML = '';

    if (products.length === 0) {
        grid.innerHTML = '<p style="text-align:center; grid-column:1/-1;">No hay stickers cargados.</p>';
        return;
    }

    products.forEach(product => {
        const card = document.createElement('div');
        card.classList.add('card');

        // Tu número real de WhatsApp con formato internacional sin símbolos extra
        const telefono = "5491150247722";
        const mensaje = encodeURIComponent(`Hola! Me interesa el sticker "${product.title}" ($${product.price}). ¿Cómo coordinamos el retiro/envío?`);
        const whatsappUrl = `https://wa.me/${telefono}?text=${mensaje}`;

        card.innerHTML = `
            <img src="${product.image}" alt="${product.title}">
            <h3>${product.title}</h3>
            <p class="price">$${product.price.toFixed(2)}</p>
            <a href="${whatsappUrl}" target="_blank" style="text-decoration: none;">
                <button><i class="fa-brands fa-whatsapp"></i> Pedir por WhatsApp</button>
            </a>
        `;

        grid.appendChild(card);
    });
}