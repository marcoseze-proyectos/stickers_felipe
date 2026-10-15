export async function fetchProducts() {
    try {
        const response = await fetch('/api/products');
        if (!response.ok) throw new Error('Error al traer productos');
        return await response.json();
    } catch (error) {
        console.error('Error:', error);
        return [];
    }
}