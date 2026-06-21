# 1. Start with a lightweight, official Node.js image
FROM node:20-alpine

# 2. Set the working directory inside the container
WORKDIR /app

# 3. Copy only the package files first (this caches dependencies and makes rebuilds lightning fast)
COPY package*.json ./

# 4. Install dependencies (using ci is strictly better for production if you have a package-lock.json)
RUN npm ci || npm install

# 5. Copy the rest of your server code
COPY . .

# 6. Expose the exact port your Express server uses
EXPOSE 4000

# 7. Start the server
CMD ["node", "server.js"]