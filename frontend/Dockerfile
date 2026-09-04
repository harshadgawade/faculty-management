# ─────────────────────────────────────────────────────────────
# Serve static frontend files with Nginx
# ─────────────────────────────────────────────────────────────
FROM nginx:1.27-alpine

# Remove default nginx page
RUN rm -rf /usr/share/nginx/html/*

# Copy all static files (html, css, js, assets)
COPY . /usr/share/nginx/html/

# Custom nginx config for SPA-style routing and API proxy
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
