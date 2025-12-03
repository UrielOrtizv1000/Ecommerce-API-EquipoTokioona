// ==========================================
// CONFIGURACIÓN Y UTILIDADES
// ==========================================
const API_URL = 'http://localhost:3000/api'; 
const token = localStorage.getItem('token'); 

// Función genérica para peticiones autenticadas
async function authFetch(endpoint, options = {}) {
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers: { ...headers, ...options.headers }
    });

    if (response.status === 401 || response.status === 403) {
        alert("Sesión expirada o no autorizada");
        window.location.href = 'index.html'; 
        return null;
    }

    return response;
}

// ==========================================
// 1. LÓGICA DEL DASHBOARD
// ==========================================
async function loadDashboardStats() {
    try {
        // 1. Total de Ventas
        const salesRes = await authFetch('/admin/total_sales');
        const salesData = await salesRes.json();
        if (salesData.ok) {
            // Buscamos la tarjeta de Total Ventas (ajusta el selector según tu HTML exacto o agrega IDs)
            // Aquí asumo que es la primera .stat-value
            document.querySelectorAll('.stat-value')[0].textContent = `$${salesData.total_sales.toFixed(2)}`;
        }

        // 2. Reporte de Inventario (para llenar las tarjetas de categorías o gráfica)
        const invRes = await authFetch('/admin/inventory');
        const invData = await invRes.json();

        loadSalesChart();

    } catch (error) {
        console.error("Error cargando dashboard:", error);
    }
}

let myChart = null;

async function loadSalesChart() {
    try {
        const res = await authFetch('/admin/sales/category'); 
        const data = await res.json();

        if (!data) return; 

        const labels = data.map(item => item.category_name);
        const values = data.map(item => item.total_sales);

        // 3. Configurar el contexto del Canvas
        const ctx = document.getElementById('salesChart');
        if (!ctx) return;

        // Si ya existe un gráfico previo, lo destruimos para no sobreponerlos
        if (myChart) {
            myChart.destroy();
        }

        // 4. Crear el Gráfico
        myChart = new Chart(ctx, {
            type: 'doughnut', // Puede ser 'bar', 'line', 'pie', 'doughnut'
            data: {
                labels: labels,
                datasets: [{
                    label: 'Ventas ($)',
                    data: values,
                    backgroundColor: [
                        '#4e73df', '#1cc88a', '#36b9cc', '#f6c23e', '#e74a3b', '#858796'
                    ],
                    hoverOffset: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                    },
                    title: {
                        display: true,
                        text: 'Distribución de Ingresos'
                    }
                }
            }
        });

    } catch (error) {
        console.error("Error cargando gráfico:", error);
    }
}

// ==========================================
// 2. GESTIÓN DE PRODUCTOS (CRUD)
// ==========================================

let currentEditingId = null; // Para saber si estamos editando o creando

// A. Cargar lista de productos en la tabla
async function loadProductsTable() {
    try {
        const res = await fetch(`${API_URL}/products`); // Esta ruta es pública según tu router
        const data = await res.json();
        
        const tbody = document.querySelector('.products-table tbody');
        tbody.innerHTML = ''; // Limpiar tabla actual

        if (data.ok) {
            data.products.forEach(p => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${p.product_id}</td>
                    <td><img src="${p.image_url || 'https://placehold.co/50'}" alt="img" width="50"></td>
                    <td>${p.name}</td>
                    <td>${p.category_name || 'Sin categoría'}</td>
                    <td>$${Number(p.price).toFixed(2)}</td>
                    <td>${p.stock > 0 ? '<span style="color:green">Disponible</span>' : '<span style="color:red">Agotado</span>'}</td>
                    <td>
                        <button class="action-btn edit-btn" onclick="openEditModal(${p.product_id})">Editar</button>
                        <button class="action-btn delete-btn" onclick="deleteProduct(${p.product_id})">Eliminar</button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        }
    } catch (error) {
        console.error("Error cargando productos:", error);
    }
}

// B. Cargar Categorías en el Select del Modal
async function loadCategoriesIntoSelect() {
    try {
        const res = await fetch(`${API_URL}/products/categories`);
        const data = await res.json();
        const select = document.getElementById('productCategory');
        
        select.innerHTML = '<option value="">Selecciona una categoría</option>'; 
        
        if (data.ok) {
            data.categories.forEach(cat => {
                const option = document.createElement('option');
                option.value = cat.category_id; 
                option.textContent = cat.category_name;
                select.appendChild(option);
            });
        }
    } catch (error) {
        console.error("Error cargando categorías:", error);
    }
}

// C. Abrir Modal para Crear
function openCreateModal() {
    currentEditingId = null;
    document.getElementById('productForm').reset();
    document.querySelector('.modal-title').textContent = "Agregar Producto";
    document.getElementById('productModal').style.display = 'flex';
}

// D. Abrir Modal para Editar (Fetch de un solo producto)
window.openEditModal = async function(id) {
    try {
        const res = await fetch(`${API_URL}/products/${id}`);
        const data = await res.json();
        
        if (data.product) {
            const p = data.product;
            currentEditingId = p.product_id;
            
            document.getElementById('productName').value = p.name;
            document.getElementById('productPrice').value = p.price;
            document.getElementById('productDescription').value = p.description;
            document.getElementById('productStock').value = p.stock;
            document.getElementById('productCategory').value = p.category_id;

            let tagsText = "";
            try {
                if (p.tags) {
                    const tagsArray = typeof p.tags === 'string' ? JSON.parse(p.tags) : p.tags;
                    if (Array.isArray(tagsArray)) {
                        tagsText = tagsArray.join(', '); 
                    }
                }
            } catch (e) {
                console.warn("Error parseando tags al editar", e);
                tagsText = "";
            }
            document.getElementById('productTags').value = tagsText;
            // ---------------------------
            
            document.querySelector('.modal-title').textContent = "Editar Producto ID: " + id;
            document.getElementById('productModal').style.display = 'flex';
        }
    } catch (error) {
        console.error("Error obteniendo detalles del producto", error);
    }
};

// E. Guardar Producto (Create o Update)
document.getElementById('productForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const formData = new FormData();
    
    formData.append('name', document.getElementById('productName').value);
    formData.append('category_id', document.getElementById('productCategory').value);
    formData.append('price', document.getElementById('productPrice').value);
    formData.append('description', document.getElementById('productDescription').value);
    formData.append('stock', document.getElementById('productStock').value);
    formData.append('is_on_sale', 0);

    const tagsInput = document.getElementById('productTags').value;
    let tagsArray = tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag !== "");
    formData.append('tags', JSON.stringify(tagsArray));

    const fileInput = document.getElementById('productImage');
    if (fileInput.files.length > 0) {
        formData.append('image', fileInput.files[0]);
    }


    try {
        let endpoint = currentEditingId ? `/products/${currentEditingId}` : `/products`;
        let method = currentEditingId ? 'PUT' : 'POST';

        // 4. Enviamos la petición
        const response = await fetch(`${API_URL}${endpoint}`, {
            method: method,
            headers: {
                'Authorization': `Bearer ${token}`
                // IMPORTANTE: NO poner 'Content-Type': 'application/json'
                // Fetch detecta FormData y pone el Content-Type correcto automáticamente
            },
            body: formData
        });

        // Verificar si la sesión expiró antes de intentar leer JSON
        if (response.status === 401 || response.status === 403) {
            alert("Sesión expirada");
            window.location.href = 'index.html';
            return;
        }

        const json = await response.json();
        
        if (response.ok && json.ok) {
            Swal.fire({
                position: 'center',
                icon: 'success',
                title: currentEditingId ? 'Producto actualizado correctamente' : 'Producto creado correctamente',
                showConfirmButton: false,
                timer: 1500
            });
            document.getElementById('productModal').style.display = 'none';
            loadProductsTable(); 
        } else {
            alert('Error del servidor: ' + json.message);
        }

    } catch (error) {
        alert("Error de red al guardar");
    }
});

// F. Eliminar Producto
window.deleteProduct = async function(id) {
    // Usamos Swal para confirmar
    const result = await Swal.fire({
        title: '¿Estás seguro?',
        text: "No podrás revertir esto. El producto ID " + id + " será eliminado.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
        try {
            const res = await authFetch(`/products/${id}`, {
                method: 'DELETE'
            });
            
            if (res.ok) {
                Swal.fire(
                    '¡Eliminado!',
                    'El producto ha sido eliminado.',
                    'success'
                );
                loadProductsTable();
            } else {
                Swal.fire('Error', 'No se pudo eliminar el producto', 'error');
            }
        } catch (error) {
            console.error(error);
            Swal.fire('Error', 'Error de red', 'error');
        }
    }
};


// ==========================================
// 3. NAVEGACIÓN Y EVENTOS GENERALES
// ==========================================
function showSection(sectionId) {
    // Ocultar todas
    document.querySelectorAll('.panel-section').forEach(s => s.classList.remove('active-section'));
    // Mostrar actual
    document.getElementById(sectionId).classList.add('active-section');
    
    // Actualizar menú
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('data-section') === sectionId) {
            item.classList.add('active');
        }
    });

    // Cargar datos específicos según la sección
    if (sectionId === 'dashboard') loadDashboardStats();
    if (sectionId === 'products') {
        loadProductsTable();
        loadCategoriesIntoSelect();
    }
}

document.addEventListener('DOMContentLoaded', function() {
    // Verificar Auth
    if (!token) {
        console.warn("No hay token, redirigiendo...");
        window.location.href = 'index.html'; 
    }

    // Navegación click
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', function() {
            showSection(this.getAttribute('data-section'));
        });
    });

    // Modal Events
    const modal = document.getElementById('productModal');
    document.getElementById('addProductBtn').addEventListener('click', openCreateModal);
    document.querySelector('.close-btn').addEventListener('click', () => modal.style.display = 'none');
    document.getElementById('cancelBtn').addEventListener('click', () => modal.style.display = 'none');
    
    window.addEventListener('click', (e) => {
        if (e.target === modal) modal.style.display = 'none';
    });

    // Logout
    document.querySelector('.logout-btn').addEventListener('click', () => {
        localStorage.removeItem('token');
        window.location.href = 'index.html';
    });

    // Carga inicial
    showSection('dashboard');

    const searchInput = document.getElementById('searchInput');

    if (searchInput) {
        searchInput.addEventListener('keyup', function(e) {
            const term = e.target.value.toLowerCase();
            const rows = document.querySelectorAll('.products-table tbody tr');

            rows.forEach(row => {
                const name = row.children[2].textContent.toLowerCase();
                const category = row.children[3].textContent.toLowerCase();

                if (name.includes(term) || category.includes(term)) {
                    row.style.display = '';
                } else {
                    row.style.display = 'none';
                }
            });
        });
    }
});