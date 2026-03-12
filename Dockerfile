# Use a specific, small version of Node.js
FROM node:22-alpine
# Create a directory for your app
WORKDIR /usr/src/app
# Copy dependency files first (optimizes build caching)
COPY package*.json ./
# Install only production dependencies
RUN npm ci --only=production
# Copy the rest of your app's source code
COPY . .
# Security: Don't run as root! Use the built-in 'node' user.
USER node
# Match this to your server's listening port
EXPOSE 3000
# The command to start your app
CMD ["npm", "start"]
