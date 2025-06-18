FROM node:22-alpine
WORKDIR /app
# Copy root package files
COPY package*.json ./
# Copy workspace package files
COPY server/package*.json ./server/
COPY client/package*.json ./client/
# Install dependencies using workspaces
RUN npm install --workspaces
# Copy the rest of the application
COPY . .
# Build the client app
RUN npm run -w client build
# Run the preview server
CMD ["npm", "run", "-w", "client", "preview"]
