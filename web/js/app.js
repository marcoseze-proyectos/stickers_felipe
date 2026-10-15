import { fetchProducts } from './api.js';

let cart = JSON.parse(localStorage.getItem('cart')) || [];
let allProducts = [];

document.addEventListener('DOMContentLoaded', async () => {
    allProducts = await fetchProducts();
    renderProducts(allProducts);
    updateCartUI();

    // Eventos del Carrito y Cierre por fuera
    const cartModal = document.getElementById('cart-modal');
    document.getElementById('cart-btn').addEventListener('click', () => toggleCartModal(true));
    document.getElementById('close-cart').addEventListener('click', () => toggleCartModal(false));
    cartModal.addEventListener('click', () => toggleCartModal(false)); // Cierra al hacer click en el fondo oscuro

    document.getElementById('checkout-whatsapp').addEventListener('click', sendWhatsAppOrder);

    // Eventos de Filtros
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            const filter = e.target.getAttribute('data-filter');
            if (filter === 'all') {
                renderProducts(allProducts);
            } else {
                const filtered = allProducts.filter(p => p.category === filter);
                renderProducts(filtered);
            }
        });
    });
});

function renderProducts(products) {
    const grid = document.getElementById('products-grid');
    grid.innerHTML = '';

    if (products.length === 0) {
        grid.innerHTML = '<p style="text-align:center; grid-column:1/-1;">No hay stickers para esta categoría.</p>';
        return;
    }

    products.forEach(product => {
        const card = document.createElement('div');
        card.classList.add('card');

        card.innerHTML = `
            <img src="${product.image}" alt="${product.title}" class="product-img">
            <span class="category-tag">${product.category}</span>
            <h3>${product.title}</h3>
            <p class="price">$${product.price.toFixed(2)}</p>
            <button class="add-btn">Agregar al carrito</button>
        `;

        card.querySelector('.add-btn').addEventListener('click', (e) => {
            addToCart(product, e.target);
        });

        grid.appendChild(card);
    });
}

// Animación de vuelo hacia el carrito
function animateFlyToCart(imgElement) {
    const cartIcon = document.getElementById('cart-btn');
    const imgRect = imgElement.getBoundingClientRect();
    const cartRect = cartIcon.getBoundingClientRect();

    const flyingImg = imgElement.cloneNode(true);
    flyingImg.style.position = 'fixed';
    flyingImg.style.left = `${imgRect.left}px`;
    flyingImg.style.top = `${imgRect.top}px`;
    flyingImg.style.width = `${imgRect.width}px`;
    flyingImg.style.height = `${imgRect.height}px`;
    flyingImg.style.borderRadius = '8px';
    flyingImg.style.zIndex = '9999';
    flyingImg.style.transition = 'all 0.8s cubic-bezier(0.2, 1, 0.3, 1)';
    flyingImg.style.pointerEvents = 'none';

    document.body.appendChild(flyingImg);

    setTimeout(() => {
        flyingImg.style.left = `${cartRect.left + cartRect.width / 2}px`;
        flyingImg.style.top = `${cartRect.top}px`;
        flyingImg.style.width = '20px';
        flyingImg.style.height = '20px';
        flyingImg.style.opacity = '0.5';
    }, 10);

    setTimeout(() => {
        flyingImg.remove();
    }, 800);
}

function addToCart(product, buttonElement) {
    const card = buttonElement.closest('.card');
    const img = card.querySelector('.product-img');
    animateFlyToCart(img);

    const existing = cart.find(item => item.id === product.id);
    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    saveAndUdpate();
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveAndUdpate();
}

function saveAndUdpate() {
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartUI();
}

function updateCartUI() {
    const cartCount = document.getElementById('cart-count');
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');

    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;

    cartItemsContainer.innerHTML = '';
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p class="empty-cart" style="text-align:center; color:#888; margin-top:20px;">El carrito está vacío.</p>';
        cartTotal.textContent = '0.00';
        return;
    }

    let total = 0;
    cart.forEach(item => {
        const subtotal = item.price * item.quantity;
        total += subtotal;

        const itemDiv = document.createElement('div');
        itemDiv.classList.add('cart-item');
        itemDiv.innerHTML = `
            <span>${item.title} (x${item.quantity})</span>
            <span>$${subtotal.toFixed(2)}</span>
            <button class="remove-btn" data-id="${item.id}">&times;</button>
        `;

        itemDiv.querySelector('.remove-btn').addEventListener('click', () => {
            removeFromCart(item.id);
        });

        cartItemsContainer.appendChild(itemDiv);
    });

    cartTotal.textContent = total.toFixed(2);
}

function toggleCartModal(forceState) {
    const modal = document.getElementById('cart-modal');
    if (typeof forceState === 'boolean') {
        if (forceState) modal.classList.remove('hidden');
        else modal.classList.add('hidden');
    } else {
        modal.classList.toggle('hidden');
    }
}

function sendWhatsAppOrder() {
    if (cart.length === 0) {
        alert('Tu carrito está vacío.');
        return;
    }

    const telefono = "5491150247722";
    let mensaje = "Hola! Quiero encargar los siguientes stickers:\n\n";
    
    let total = 0;
    cart.forEach(item => {
        const subtotal = item.price * item.quantity;
        total += subtotal;
        mensaje += `- ${item.title} (x${item.quantity}) - $${subtotal}\n`;
    });

    mensaje += `\n*Total a pagar: $${total.toFixed(2)}*\n¿Cómo coordinamos el pago y el envío/retiro en CABA?`;

    const encodedMessage = encodeURIComponent(mensaje);
    window.open(`https://wa.me/${telefono}?text=${encodedMessage}`, '_blank');
}