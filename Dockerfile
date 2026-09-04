version: "3.9.6"

services:

  # ── MySQL Database ──────────────────────────────────────────
  db:
    image: mysql:8.0
    container_name: fms-db
    restart: unless-stopped
    environment:
      MYSQL_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD:-rootpassword}
      MYSQL_DATABASE:      ${MYSQL_DATABASE:-fms_db}
      MYSQL_USER:          ${MYSQL_USER:-fms_user}
      MYSQL_PASSWORD:      ${MYSQL_PASSWORD:-fms_password}
    ports:
      - "3306:3306"
    volumes:
      - db_data:/var/lib/mysql
      - ./database/schema.sql:/docker-entrypoint-initdb.d/schema.sql:ro
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost", "-u", "root", "-p${MYSQL_ROOT_PASSWORD:-rootpassword}"]
      interval: 10s
      timeout: 5s
      retries: 5

  # ── Spring Boot Backend ─────────────────────────────────────
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: fms-backend
    restart: unless-stopped
    depends_on:
      db:
        condition: service_healthy
    environment:
      SPRING_DATASOURCE_URL:      jdbc:mysql://db:3306/${MYSQL_DATABASE:-fms_db}?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
      SPRING_DATASOURCE_USERNAME: ${MYSQL_USER:-fms_user}
      SPRING_DATASOURCE_PASSWORD: ${MYSQL_PASSWORD:-fms_password}
      SPRING_JPA_HIBERNATE_DDL_AUTO: update
      JWT_SECRET:                 ${JWT_SECRET:-changeme_use_a_long_random_string_here}
      SPRING_MAIL_HOST:           ${MAIL_HOST:-smtp.gmail.com}
      SPRING_MAIL_PORT:           ${MAIL_PORT:-587}
      SPRING_MAIL_USERNAME:       ${MAIL_USERNAME:-}
      SPRING_MAIL_PASSWORD:       ${MAIL_PASSWORD:-}
    ports:
      - "8080:8080"
    volumes:
      - backend_logs:/app/logs

  # ── Nginx Frontend ──────────────────────────────────────────
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: fms-frontend
    restart: unless-stopped
    depends_on:
      - backend
    ports:
      - "80:80"

volumes:
  db_data:
  backend_logs:
