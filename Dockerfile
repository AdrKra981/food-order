# Multi-stage Dockerfile for Laravel (build JS assets in Node, run PHP-FPM in final image)
### Stage 1: Node build (assets)
FROM node:20-bullseye AS node-builder
WORKDIR /app
# Install build tools for native modules
RUN apt-get update && apt-get install -y python3 build-essential ca-certificates \
    && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
COPY resources/ resources/
COPY vite.config.js .
# Attempt deterministic install first; if it fails due to optional dep/platform binary issues,
# remove package-lock.json and retry npm install inside the container so native binaries
# are resolved for the build platform (Linux).
RUN set -e; \
        if npm ci --silent; then \
            echo "npm ci succeeded"; \
        else \
            echo "npm ci failed — retrying by removing package-lock.json and running npm install"; \
            rm -f package-lock.json; \
            npm install --silent; \
        fi
RUN npm run build

### Stage 2: PHP runtime
FROM php:8.2-fpm

# system deps
RUN apt-get update && apt-get install -y \
    git curl zip unzip libpng-dev libonig-dev libxml2-dev sqlite3 libsqlite3-dev \
    && docker-php-ext-install pdo pdo_mysql pdo_sqlite mbstring exif pcntl bcmath gd \
    && rm -rf /var/lib/apt/lists/*

# Composer
COPY --from=composer:2.7 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www

# Copy only composer files, install, then copy app to leverage build cache
COPY composer.json composer.lock ./
RUN composer install --no-dev --no-interaction --prefer-dist --optimize-autoloader

# Copy app source
COPY . .

# Copy built assets from node-builder
COPY --from=node-builder /app/dist public/build

# Install dev dependencies for possible runtime tasks (optional)
RUN if [ -f package-lock.json ]; then npm ci --only=production || true; fi

RUN chown -R www-data:www-data /var/www/storage /var/www/bootstrap/cache

EXPOSE 9000
CMD ["php-fpm"]
# Dockerfile for Laravel (PHP 8.2, Composer, Node.js, npm, and SQLite for testing)
FROM php:8.2-fpm

# Install system dependencies
RUN apt-get update \
    && apt-get install -y \
        git \
        curl \
        libpng-dev \
        libonig-dev \
        libxml2-dev \
        zip \
        unzip \
        sqlite3 \
        libsqlite3-dev \
        npm \
    && docker-php-ext-install pdo pdo_mysql pdo_sqlite mbstring exif pcntl bcmath gd

# Install Composer
COPY --from=composer:2.7 /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www

# Copy project files
COPY . .

# Install PHP dependencies
RUN composer install --no-interaction --prefer-dist --optimize-autoloader

# Install Node dependencies and build assets
RUN npm install && npm run build

# Set permissions
RUN chown -R www-data:www-data /var/www/storage /var/www/bootstrap/cache

# Expose port 9000 and start php-fpm server
EXPOSE 9000
CMD ["php-fpm"]
