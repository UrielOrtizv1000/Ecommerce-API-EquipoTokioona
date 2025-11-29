// -----------------------------------------------------
// POST create product (admin only)
// -----------------------------------------------------
async function createProduct(productData, token) {
  const res = await fetch(`${BACKEND_URL}/products`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(productData)
  });

  return await res.json();
}


// -----------------------------------------------------
// Navegation
// -----------------------------------------------------
function showSection(sectionId) {
    // Ocultar todas las secciones
    document.querySelectorAll('.panel-section').forEach(section => {
        section.classList.remove('active-section');
    });
    
    // Mostrar la sección seleccionada
    document.getElementById(sectionId).classList.add('active-section');
    
    // Actualizar navegación activa
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('data-section') === sectionId) {
            item.classList.add('active');
        }
    });
}

// Inicializar navegación
document.addEventListener('DOMContentLoaded', function() {
    // Mostrar la sección dashboard por defecto
    showSection('dashboard');
    
    // Configurar event listeners para los elementos de navegación
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', function() {
            const sectionId = this.getAttribute('data-section');
            showSection(sectionId);
        });
    })
    // Modal para agregar producto
    const modal = document.getElementById('productModal');
    const addProductBtn = document.getElementById('addProductBtn');
    const closeBtn = document.querySelector('.close-btn');
    const cancelBtn = document.getElementById('cancelBtn')
    addProductBtn.addEventListener('click', function() {
        modal.style.display = 'flex';
    })
    closeBtn.addEventListener('click', function() {
        modal.style.display = 'none';
    })
    cancelBtn.addEventListener('click', function() {
        modal.style.display = 'none';
    })
    // Cerrar modal al hacer clic fuera del contenido
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    })
    // Manejo del formulario de producto
    document.getElementById('productForm').addEventListener('submit', function(e) {
        e.preventDefault();
        alert('Funcionalidad de guardar producto - Se implementará en el backend');
        modal.style.display = 'none';
        // Aquí iría la lógica para enviar los datos al backend
    })
    // Funcionalidad de logout
    document.querySelector('.logout-btn').addEventListener('click', function() {
        if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
            alert('Funcionalidad de logout - Se implementará en el backend');
            // Aquí iría la lógica para cerrar sesión
        }
    })
    // Funcionalidad de editar y eliminar productos
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            alert('Funcionalidad de editar producto - Se implementará en el backend');
        });
    })
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            if (confirm('¿Estás seguro de que deseas eliminar este producto?')) {
                alert('Funcionalidad de eliminar producto - Se implementará en el backend');
            }
        });
    });
});