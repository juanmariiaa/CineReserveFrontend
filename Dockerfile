# Etapa 1: Construcción de la aplicación Angular
FROM node:18 AS build
WORKDIR /app

# Copiamos solo los package.json para aprovechar cache de npm install
COPY package*.json ./
RUN npm install

# Copiamos el resto del código fuente
COPY . .

# Ejecutamos build de producción de Angular
RUN npm run build -- --configuration production

# Etapa 2: Servir con Nginx
FROM nginx:alpine

# Copiamos el build estático desde la etapa anterior
COPY --from=build /app/dist/cinema/browser /usr/share/nginx/html

# Copiamos configuración personalizada de nginx (si tienes una)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exponemos el puerto 80 para el servidor web
EXPOSE 80

# Comando para ejecutar nginx en primer plano
CMD ["nginx", "-g", "daemon off;"]
