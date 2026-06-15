const PRODUCTS_URL = "backend/products.json";

let cachedProducts = null;
let cachedProductMap = null;

const loadProducts = async () => {
	if (cachedProducts) {
		return cachedProducts;
	}
	const response = await fetch(PRODUCTS_URL);

	console.log(response.url);
	console.log(response.status);
	console.log(response.headers.get("content-type"));

	const data = await response.json();
	cachedProducts = Array.isArray(data) ? data : [];
	cachedProductMap = new Map(cachedProducts.map(product => [product.id, product]));
	return cachedProducts;
};

const getProducts = async () => {
	const list = await loadProducts();
	return list.slice();
};

const getProductById = async id => {
	await loadProducts();
	return cachedProductMap ? cachedProductMap.get(id) || null : null;
};

export { getProducts, getProductById };
