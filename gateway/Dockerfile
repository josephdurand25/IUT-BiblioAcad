# openresty-nginx/Dockerfile
FROM openresty/openresty:alpine

# Installer les modules Lua nécessaires
RUN apk add --no-cache perl curl git openssl lua5.1-cjson
RUN opm get ledgetech/lua-resty-http
#RUN opm get openresty/lua-cjson

# Créer les dossiers nécessaires
RUN mkdir -p /usr/local/openresty/lua

# Copier la configuration
# COPY ./conf/nginx.conf /etc/nginx/nginx.conf
# COPY ./conf/nginx-test.conf /tmp/nginx-test.conf

COPY ./conf/nginx.conf /usr/local/openresty/nginx/conf/nginx.conf
COPY ./lua /usr/local/openresty/lua

# Vérifier la configuration
# RUN /usr/local/openresty/bin/openresty -t -c /tmp/nginx-test.conf
# RUN /usr/local/openresty/bin/openresty -t

# Port exposé
EXPOSE 80

# Commande de démarrage
CMD ["/usr/local/openresty/bin/openresty", "-g", "daemon off;"]