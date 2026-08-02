FROM php:8.2-cli

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip \
    libssl-dev \
    pkg-config

# Install PHP extensions
RUN docker-php-ext-install pdo mbstring exif pcntl bcmath gd

# Install MongoDB PHP extension (Required for Laravel MongoDB)
RUN pecl install mongodb && docker-php-ext-enable mongodb

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /app

# Copy application files
COPY . .

# Set dummy environment variables so Laravel artisan commands don't fail during Docker build
ENV MONGODB_URI="mongodb://127.0.0.1:27017"
ENV MONGODB_DATABASE="dummy"

# Install PHP dependencies
RUN composer install --no-dev --optimize-autoloader --no-interaction



# Set permissions for Laravel
RUN chown -R www-data:www-data /app \
    && chmod -R 775 /app/storage \
    && chmod -R 775 /app/bootstrap/cache

# Start the Laravel application
CMD php artisan serve --host=0.0.0.0 --port=${PORT:-10000}
