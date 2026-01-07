# Use Node to run the mobile web preview
FROM node:22-slim
WORKDIR /app

# Set environment for non-interactive startup
ENV CI=true

COPY package*.json ./
RUN npm install

# Install Expo CLI globally
RUN npm install -g expo-cli

COPY . .

# Expose Metro bundler and web ports
EXPOSE 19000
EXPOSE 19006

# Command to start the web-based preview
CMD ["npx", "expo", "start", "--web"]