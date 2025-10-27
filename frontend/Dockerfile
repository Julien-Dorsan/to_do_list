FROM node:22.21-alpine3.21

WORKDIR /www

COPY  package*.json ./  

# ci pour une installation propre
RUN npm ci

# copie du reste des fichiers
COPY . .

# build l'application
RUN npm run build

EXPOSE 5173
CMD ["npm", "run", "preview"]