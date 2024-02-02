FROM node:18-slim

# Set the working directory to /usr/src/app
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the current directory contents into the container at /usr/src/app
COPY . .

# Run the index.js script when the container launches
CMD ["node", "index.js"]
