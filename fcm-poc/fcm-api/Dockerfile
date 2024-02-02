# 使用 Node.js 14 作为基础镜像
FROM node:18-slim
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 8080
CMD ["npm", "start"]