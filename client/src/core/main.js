// /* eslint-disable */
// async function register() {
//     try {
//         const username = document.getElementById('username').value;
//         const password = document.getElementById('password').value;
//         const response = await fetch('/api/auth/register', {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify({ username, password }),
//         });
//         if (!response.ok) throw new Error(`Register failed: ${response.statusText}`);
//         alert('Registered');
//     } catch (error) {
//         console.error('Register error:', error);
//         alert('Registration failed');
//     }
// }
//
// async function login() {
//     try {
//         const username = document.getElementById('username').value;
//         const password = document.getElementById('password').value;
//         const response = await fetch('/api/auth/login', {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify({ username, password }),
//         });
//         if (!response.ok) throw new Error(`Login failed: ${response.statusText}`);
//         const data = await response.json();
//         localStorage.setItem('token', data.token);
//         alert('Logged in');
//         await loadProducts();
//         await getDailyTotals();
//     } catch (error) {
//         console.error('Login error:', error);
//         alert('Login failed');
//     }
// }
//
// async function addProduct() {
//     try {
//         const name = document.getElementById('product').value;
//         const fat = parseFloat(document.getElementById('fat').value) || 0;
//         const protein = parseFloat(document.getElementById('protein').value) || 0;
//         const fiber = parseFloat(document.getElementById('fiber').value) || 0;
//         const carbs = parseFloat(document.getElementById('carbs').value) || 0;
//         const token = localStorage.getItem('token');
//         if (!token) throw new Error('No token found');
//         const response = await fetch('/api/product', {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//                 Authorization: `Bearer ${token}`,
//             },
//             body: JSON.stringify({ name, fat, protein, fiber, carbs }),
//         });
//         if (!response.ok) throw new Error(`Add product failed: ${response.statusText}`);
//         const product = await response.json();
//         alert(`Added: ${product.name}`);
//         await loadProducts();
//     } catch (error) {
//         console.error('Add product error:', error);
//         alert('Failed to add product');
//     }
// }
//
// async function loadProducts() {
//     try {
//         const token = localStorage.getItem('token');
//         if (!token) {
//             console.warn('No token found for loadProducts');
//             return;
//         }
//         console.log('Fetching products with token:', token);
//         const response = await fetch('/api/products', {
//             headers: { Authorization: `Bearer ${token}` },
//         });
//         if (!response.ok) {
//             const errorText = await response.text();
//             throw new Error(`Load products failed: ${response.status} ${errorText}`);
//         }
//         const products = await response.json();
//         console.log('Products fetched:', products);
//         const list = document.getElementById('product-list');
//         if (!list) throw new Error('product-list element not found');
//         list.innerHTML = products.length
//             ? products
//                   .map(
//                       (p) => `
//       <div>
//         ${p.name} (Fat: ${p.fat}g, Protein: ${p.protein}g, Fiber: ${p.fiber}g, Carbs: ${p.carbs}g)
//         <button onclick="logConsumption('${p._id}', 1)">Log 1 unit</button>
//       </div>
//     `,
//                   )
//                   .join('')
//             : '<p>No products found</p>';
//     } catch (error) {
//         console.error('Load products error:', error);
//         const list = document.getElementById('product-list');
//         if (list) list.innerHTML = '<p>Error loading products</p>';
//     }
// }
//
// async function logConsumption(productId, amount) {
//     try {
//         const token = localStorage.getItem('token');
//         if (!token) throw new Error('No token found');
//         const response = await fetch('/api/log', {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//                 Authorization: `Bearer ${token}`,
//             },
//             body: JSON.stringify({ productId, amount }),
//         });
//         if (!response.ok) throw new Error(`Log consumption failed: ${response.statusText}`);
//         const log = await response.json();
//         alert(`Logged: ${amount} units`);
//         await getDailyTotals();
//     } catch (error) {
//         console.error('Log consumption error:', error);
//         alert('Failed to log consumption');
//     }
// }
//
// async function getDailyTotals() {
//     try {
//         const token = localStorage.getItem('token');
//         if (!token) {
//             console.warn('No token found for getDailyTotals');
//             return;
//         }
//         const response = await fetch('/api/logs/daily-totals', {
//             headers: { Authorization: `Bearer ${token}` },
//         });
//         if (!response.ok) throw new Error(`Get totals failed: ${response.statusText}`);
//         const totals = await response.json();
//         const totalsDiv = document.getElementById('totals');
//         if (!totalsDiv) throw new Error('totals element not found');
//         totalsDiv.innerHTML = `
//       <p>Fat: ${totals.fat}g</p>
//       <p>Protein: ${totals.protein}g</p>
//       <p>Fiber: ${totals.fiber}g</p>
//       <p>Carbs: ${totals.carbs}g</p>
//       <p>Net Carbs: ${totals.netCarbs}g</p>
//     `;
//     } catch (error) {
//         console.error('Get totals error:', error);
//         const totalsDiv = document.getElementById('totals');
//         if (totalsDiv) totalsDiv.innerHTML = '<p>Error loading totals</p>';
//     }
// }
//
// // Add event listeners when the DOM is loaded
// document.addEventListener('DOMContentLoaded', () => {
//     document.getElementById('registerBtn').addEventListener('click', register);
//     document.getElementById('loginBtn').addEventListener('click', login);
//     document.getElementById('addProductBtn').addEventListener('click', addProduct);
//     document.getElementById('refreshTotalsBtn').addEventListener('click', getDailyTotals);
//     // Add other event listeners here
// });
