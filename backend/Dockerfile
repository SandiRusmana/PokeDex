FROM php:8.2-cli

# Install dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip \
    libzip-dev \
    && docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd zip \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www

# Copy project files
COPY . .

# Install PHP dependencies
RUN composer install --no-dev --optimize-autoloader

# Copy .env example jika .env belum ada
RUN cp -n .env.example .env || true

# Generate app key
RUN php artisan key:generate --force

# Cache config & routes
RUN php artisan config:cache && php artisan route:cache

# Expose port
EXPOSE 8080

# Start Laravel
CMD php artisan migrate --force && php artisan serve --host=0.0.0.0 --port=8080
