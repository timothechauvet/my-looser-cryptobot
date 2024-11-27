# Use Node.js LTS
FROM node:20-slim

# Set working directory
WORKDIR /app

# Install dependencies first (for caching)
COPY package*.json ./
RUN npm install @solana/web3.js @project-serum/anchor cross-fetch bs58

# Copy source code
COPY node-jupiter-api-example.js ./

# Convert to CommonJS module
RUN echo "{ \"type\": \"module\" }" > package.json

# Set environment variables
ENV SOLANA_ENDPOINT=https://api.mainnet-beta.solana.com

# Run script
CMD ["node", "node-jupiter-api-example.js"]