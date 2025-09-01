FROM node:20

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN npm install

ENV NODE_ENV=production

# Bundle app source
COPY . .

# Expose the port the app runs on
EXPOSE 3005

# Run the app
CMD [ "node", "src/server.js" ]