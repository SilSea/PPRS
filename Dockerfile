# Use the official Bun image
FROM oven/bun:latest

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json bun.lock ./

# Install dependencies
RUN bun install

# Copy project files
COPY . .

# Create necessary directories for data and images
RUN mkdir -p src/data public/images

# Expose the application port
EXPOSE 3000

# Start the application
CMD ["bun", "run", "src/index.ts"]
