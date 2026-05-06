
FROM php:8.0-apache

# 1. Instalamos las extensiones de PHP necesarias para conectar con MySQL
RUN docker-php-ext-install mysqli pdo pdo_mysql

# 2. Habilitamos el módulo de reescritura de Apache (útil para el futuro)
RUN a2enmod rewrite

# 3. Copiamos todo tu proyecto (html, css, js, php, imagenes) al servidor
COPY . /var/www/html/

# 4. Ajustamos los permisos para que Apache pueda leer y servir los archivos
RUN chown -R www-data:www-data /var/www/html

# 5. Exponemos el puerto 80
EXPOSE 80