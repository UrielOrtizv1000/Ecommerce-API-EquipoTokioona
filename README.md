# Tokioona E-commerce

Academic e-commerce project built with a static Vanilla JavaScript frontend and a Node.js + Express + MySQL backend.

## Stack

| Layer | Technology |
| --- | --- |
| Frontend | HTML5, CSS3, Vanilla JavaScript |
| Backend | Node.js, Express |
| Database | MySQL |
| Email | SendGrid |

## Project Structure

```text
.
|-- back/
|   |-- public/
|   |   `-- images/
|   |-- src/
|   |   |-- config/
|   |   |-- controllers/
|   |   |-- db/
|   |   |-- middlewares/
|   |   |-- models/
|   |   |-- routes/
|   |   `-- utils/
|   |-- package.json
|   `-- server.js
|-- front/
|   |-- assets/
|   |   |-- js/
|   |   `-- styles/
|   |-- partials/
|   `-- *.html
`-- README.md
```

## Prerequisites

- Node.js 18+
- MySQL 8+
- A SendGrid account if email features should be enabled

## Backend Setup

1. Go to the backend folder:

```bash
cd back
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file inside `back/`:

```env
PORT=3000

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=pf_tiendaweb
DB_PORT=3306

JWT_SECRET=your_strong_secret
JWT_EXPIRES_IN=1h

FRONT_URL=http://127.0.0.1:5500
BACK_URL=http://127.0.0.1:3000

SENDGRID_API_KEY=your_sendgrid_api_key
VERIFIED_SENDER_EMAIL=verified-sender@example.com
```

4. Start the backend:

```bash
npm run dev
```

## Frontend Setup

1. Serve the `front/` folder with a simple static server such as Live Server.
2. Review `front/assets/js/init.js` if you need to point the frontend to a different backend URL.
3. Open `front/index.html`.

## Notes

- The refactor keeps the existing database logic and route behavior intact while standardizing the source layout.
- Static images are served from `back/public/images`.
- Generated receipt PDFs are written to `back/tmp`.
