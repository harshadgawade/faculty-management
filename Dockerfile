# ─────────────────────────────────────────────────────────────
# Frontend — Nginx static file server
# This is the root Dockerfile used by Render for the frontend.
# ─────────────────────────────────────────────────────────────
FROM nginx:1.27-alpine

# Remove default nginx page
RUN rm -rf /usr/share/nginx/html/*

# Copy all frontend static files
COPY frontend/ /usr/share/nginx/html/

# Copy nginx config
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
