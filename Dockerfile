FROM nginx:alpine

# Copy static files
COPY noteApp.html /usr/share/nginx/html/
COPY reminderApp.html /usr/share/nginx/html/
COPY assets/ /usr/share/nginx/html/assets/

# Copy nginx config
COPY config/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
