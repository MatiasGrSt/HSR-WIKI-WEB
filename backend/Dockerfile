# Usamos la imagen oficial de PHP con el servidor Apache incluido
FROM php:8.2-apache

# Le decimos a Docker que instale la extensión de MySQLi
RUN docker-php-ext-install mysqli

# (Opcional) Activa el mod_rewrite de Apache por si usas URLs limpias en el futuro
RUN a2enmod rewrite