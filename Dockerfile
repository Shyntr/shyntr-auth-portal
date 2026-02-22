FROM node:22-alpine
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000

COPY /public ./public
COPY /.next/standalone ./
COPY /.next/static ./.next/static

EXPOSE 3000

CMD ["node", "server.js"]