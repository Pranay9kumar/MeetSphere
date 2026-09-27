# Use Node 20 LTS Alpine image for lightweight footprint
FROM node:20-alpine

# Set working directory inside container
WORKDIR /app

# Copy package descriptors first to optimize layer caching
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application source code
COPY . .

# Expose backend API / WebSocket port
EXPOSE 5000

# Set environment defaults
ENV PORT=5000 \
    NODE_ENV=development

# Start application in development mode with hot-reloading
CMD ["npm", "run", "dev"]
