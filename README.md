# 🛍️ E-commerce | Proyecto Final

Tienda E-commerce desarrollada como Proyecto Final.

Esta plataforma cuenta con un **catálogo de productos**, **sistema de autenticación**, **carrito de compras**, **lista de deseos (Wishlist)** y funcionalidad de **filtrado dinámico**. Además, incluye un **CRUD** completo y **analíticas** para el Administrador.

---

## Arquitectura del Proyecto

El proyecto está dividido en dos servicios principales: un **Frontend de JavaScript (Vanilla)** y un **Backend basado en Node.js y MySQL**.

| Componente | Tecnología Principal |
| :--- | :--- |
| **Frontend** | JavaScript, HTML5, CSS3 |
| **Backend (API)** | Node.js, Express, MySQL |

---

## 🛠️ Requisitos Previos

Asegúrate de tener instalado lo siguiente antes de iniciar el proyecto:

* **Node.js** (v18 o superior)
* **MySQL** (v8.0 o superior) o acceso a una instancia de base de datos MySQL remota.

---

## Despliegue Local

### Configuración del Backend

1.  Navega a la carpeta del backend:
    ```bash
    cd back
    ```
2.  Ejecuta en la terminal para instalar dependencias:
    ```bash
    npm install
    ```
3.  Crea un archivo de entorno `.env` en la raíz de la carpeta `/back` y configura las siguientes variables, **sustituyendo los *placeholders***:
    ```env
    # Variables de Entorno del Backend
    PORT=3000

    # Configuración de Base de Datos
    DB_HOST=localhost
    DB_USER=root
    DB_PASSWORD=tu_contraseña_mysql
    DB_NAME=pf_tiendaweb
    DB_PORT=3306

    # Configuración de Seguridad
    JWT_SECRET=una_clave_secreta_fuerte_aqui
    JWT_EXPIRES_IN=1h

    # Configuración de Correo Electrónico (Para envío de notificaciones/reset)
    EMAIL_USER=tu_correo_de_envio@gmail.com
    EMAIL_PASS=token_o_contraseña_de_aplicación

    # URLs de Entorno (Local)
    FRONT_URL=[http://127.0.0.1:5500](http://127.0.0.1:5500)
    BACK_URL=[http://127.0.0.1:3000](http://127.0.0.1:3000)
    ```
4.  Crea la base de datos y ejecuta las migraciones para configurar las tablas (`products`, `users`, `wishlists`, `carts`, etc.).
5.  Inicia el servidor:
    ```bash
    npm run dev
    ```

### Configuración del Frontend

1.  Navega a la carpeta del frontend:
    ```bash
    cd front
    ```
2.  Localiza el archivo `./js/init.js` y asegúrate de que la variable `BACK_URL` apunte a la dirección local del backend (`http://127.0.0.1:3000`).
3.  Abre el archivo `front/index.html` utilizando una extensión de servidor local simple (ej., *Live Server* en VS Code).

---

## Despliegue en Línea (Railway)

El proyecto puede ser desplegado en **Railway**, utilizando un enfoque de **Monorepo** o dos servicios separados. Tambien se puede desplegar en otros servicios pero nos enfocaremos en este.

### 1. Configuración de URLs de Despliegue

* **Backend:** El servicio del backend recibirá una URL pública (ej., `https://api-miapp.up.railway.app`).
* **Frontend:** Antes del despliegue del frontend, debes reemplazar la cadena **`"http://localhost:3000"`** dentro del archivo **`front/js/init.js`** con la URL pública real del backend.

### 2. Variables de Entorno en Railway

Asegúrate de configurar las variables de entorno para tu servicio de **Backend** dentro del panel de Railway, incluyendo todas las credenciales sensibles de la base de datos y las claves de correo.

---

## ✅ Características Principales

* **Autenticación:** Login y Registro de usuarios (manejo de sesiones con JWT).
* **Catálogo Dinámico:** Carga de productos y categorías desde la base de datos.
* **Filtrado:** Filtrado por categorías, rango de precios y productos en oferta.
* **Wishlist:** Gestión de lista de deseos para usuarios autenticados.
* **Carrito:** Sistema de gestión de productos en el carrito de compras.
* **Factorización de URLs:** Uso de `window.APP_CONFIG` para una configuración centralizada y adaptabilidad al despliegue.

---

## 🧑‍💻 Desarrolladores

| Nombre | Contacto |
| :--- | :--- |
| Bruno | [https://www.linkedin.com/in/bruno-gonz%C3%A1lez-52a948398/] |
| Brandon | [www.linkedin.com/in/brandon-dávila-0a2603199] |
| Oscar | [https://www.linkedin.com/in/oscar-gomez-aa4b1a398 |
| Azael | [LinkedIn] |
| Gael | [LinkedIn] |
| Uriel | [LinkedIn] |
