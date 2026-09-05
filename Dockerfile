# ─────────────────────────────────────────────────────────────
# Frontend — Nginx static file server
# ─────────────────────────────────────────────────────────────
FROM nginx:1.27-alpine

RUN rm -rf /usr/share/nginx/html/*
COPY frontend/ /usr/share/nginx/html/

# Load the live functionality layer after the existing dashboard code.
# It keeps the current UI while replacing demo-only behaviour with API calls.
RUN sed -i 's#</body>#<script src="assets/js/dashboard-live.js"></script></body>#' /usr/share/nginx/html/dashboard.html

COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
