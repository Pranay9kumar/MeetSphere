# Use Node 20 LTS Alpine image
FROM node:20-alpine

# Set working directory inside container
WORKDIR /app

# Copy package descriptors first to leverage layer caching
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy frontend source code
COPY . .

# Expose Vite React dev server port
EXPOSE 3000

# Start Vite dev server bound to host 0.0.0.0 and port 3000
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "3000"]
