#Dockerfile
FROM node:20-alpine

#Create app directory
WORKDIR /usr/src/app

#Copy package files and install dependencies
COPY package*.json ./
RUN npm ci --only=production

#Copy application code
COPY . .

#Expose port
EXPOSE 3000

#Start the app
CMD ["node", "app.js"]
