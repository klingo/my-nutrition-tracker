FROM node:22
WORKDIR /app
RUN git clone https://github.com/klingo/my-nutrition-tracker.git .
RUN git checkout v1.0.0
RUN npm install
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]