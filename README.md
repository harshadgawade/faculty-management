# Faculty Management System

Full-stack Faculty Management System with a static HTML/CSS/JavaScript frontend, Spring Boot backend, and MySQL database.

## Run the complete project in VS Code

### Requirements

- JDK 17
- VS Code
- VS Code Extension Pack for Java (recommended)
- Internet access for Maven dependencies
- A MySQL database. Clever Cloud MySQL can be used as the remote database.

### 1. Clone and open the repository

Open the repository folder in VS Code:

```text
faculty-management/
```

### 2. Create local environment file

Copy `.env.example` to `.env` in the repository root and fill in your database values.

For Clever Cloud, use the database host, port, database name, username and password from your Clever Cloud MySQL addon. Do not commit `.env`.

The Spring Boot configuration automatically reads `.env` from the repository root when the backend is started locally.

### 3. Start everything

In VS Code:

**Terminal → Run Task → `FMS: Start Full Project`**

This starts:

- Spring Boot backend on `http://localhost:8080`
- Frontend server on `http://localhost:5500`

The frontend can be opened at:

```text
http://localhost:5500/login.html
```

The backend API uses the `/api` context path, for example:

```text
http://localhost:8080/api/health
```

### Alternative: backend only

Use the VS Code Run and Debug panel and start **FMS Backend (Spring Boot)**, or run:

Windows:

```bat
backend\mvnw.cmd spring-boot:run
```

macOS/Linux:

```bash
./backend/mvnw spring-boot:run
```

### Frontend only

If you only need to inspect the UI:

Windows:

```bat
py -m http.server 5500 --directory frontend
```

macOS/Linux:

```bash
python3 -m http.server 5500 --directory frontend
```

## Local architecture

```text
Browser
  ↓
Frontend (localhost:5500)
  ↓
Spring Boot API (localhost:8080/api)
  ↓
MySQL / Clever Cloud
```

The backend also exposes the frontend directory during a local Spring Boot run, so opening `http://localhost:8080/` can serve the frontend directly when the repository is run from the expected `backend/` working directory.

## Database configuration

The preferred local variables are:

```text
SPRING_DATASOURCE_URL
SPRING_DATASOURCE_USERNAME
SPRING_DATASOURCE_PASSWORD
```

Clever Cloud linked-app variables are also supported:

```text
MYSQL_ADDON_HOST
MYSQL_ADDON_PORT
MYSQL_ADDON_DB
MYSQL_ADDON_USER
MYSQL_ADDON_PASSWORD
```

Never put real passwords, mail credentials, JWT secrets, or API keys into GitHub.

## Render deployment

The deployed frontend and backend can remain separate services. Render environment variables take precedence over local `.env` values, while the same Spring datasource configuration can connect the backend to Clever Cloud MySQL.
