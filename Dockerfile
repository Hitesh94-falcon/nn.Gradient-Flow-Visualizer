FROM node:18-bullseye

# Install system dependencies
RUN apt-get update && \
    apt-get install -y python3 python3-pip graphviz && \
    apt-get clean

# Install Python packages
RUN pip3 install numpy matplotlib

# Set working directory
WORKDIR /app

# Copy Node package files first
COPY package*.json ./
RUN npm install

# Copy entire project
COPY . .

# Expose Render port
ENV PORT=10000
EXPOSE 10000

CMD ["node", "server.js"]
