# Use Debian-based Node image so apt-get works
FROM node:18-bullseye

# Install Python and Graphviz
RUN apt-get update && \
    apt-get install -y python3 python3-pip graphviz && \
    apt-get clean

# Create app directory
WORKDIR /app

# Copy package.json first (caches npm install)
COPY package.json package-lock.json* ./

# Install node dependencies
RUN npm install

# Copy the rest of the project
COPY . .

# Expose Render port
ENV PORT=10000

# Start command
CMD ["node", "server.js"]
