const PRODUCTS = [
    { id: 1, title: 'Sticker Pack Lali - Disciplina Tour', category: 'Lali',         price: 1500, image: './uploads/IMG_7289.jpg' },
    { id: 2, title: 'Sticker Dillom - Post Mortem',         category: 'Dillom',       price: 1500, image: './uploads/IMG_7291.jpg' },
    { id: 3, title: 'Sticker Bizarrap & Sessions',          category: 'Bizarrap',     price: 1500, image: './uploads/IMG_7294.jpg' },
    { id: 4, title: 'Sticker Nicki Nicole - Alma',          category: 'Nicki Nicole', price: 1500, image: './uploads/IMG_7295.jpg' },
    { id: 5, title: 'Encendedor / Sticker Dillom Club',     category: 'Dillom',       price: 1800, image: './uploads/IMG_7300.jpg' },
    { id: 6, title: 'Sticker Pack Urbano Argentina',        category: 'Lali',         price: 1500, image: './uploads/IMG_7301.jpg' },
    { id: 7, title: 'Sticker Coleccionable Backstage',      category: 'Bizarrap',     price: 1600, image: './uploads/IMG_7302.jpg' },
    { id: 8, title: 'Sticker Pack BTS Army - Edición 1',    category: 'BTS',          price: 1500, image: './uploads/bts1.jpeg' },
    { id: 9, title: 'Sticker Pack BTS Army - Edición 2',    category: 'BTS',          price: 1500, image: './uploads/bts2.jpeg' }
];

// Async a propósito: si después pasás a un JSON o a una API real,
// solo cambiás el cuerpo de esta función.
export async function fetchProducts() {
    return PRODUCTS;
}