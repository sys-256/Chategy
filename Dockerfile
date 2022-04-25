# Use the Deno image
FROM denoland/deno:alpine

# Set the working directory to /app
WORKDIR /app

# Use the Deno user, not root
USER deno

# Copy the source code to the /app directory
COPY ./start.sh /app/
COPY ./src/ /app/src/
COPY ./public/ /app/public/

# Cache the dependencies and pre compile
RUN deno cache src/*

# Run the Deno application
EXPOSE 3006
CMD ["./start.sh"]