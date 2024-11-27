# Solana to USDC cryptobot 🪙

![GitHub last commit (branch)](https://img.shields.io/github/last-commit/timothechauvet/my-looser-cryptobot/main)

## What's this 🤓
An automated trading bot that swaps between SOL and USDC on Solana using Jupiter API v6. The bot monitors price movements and executes trades based on price trends.

## Features 💫
- Recurrent SOL to USD price monitoring via CoinGecko API
- Trading using Jupiter API v6
- Very smart and intelligent trade execution based on price trends : 
  - it grows, it sells (SOL -> USDC)
  - it grows n times, it sells n times.
  - the reverse.
- Dockerized

## Prerequisites 📋
- Node.js 20 or later
- Docker (optional)
- Solana wallet with private key. I use Phantom
- Some USDC/SOL for trading

## Installation 🔧
```bash
npm install @solana/web3.js @project-serum/anchor cross-fetch bs58
```

Then create a `.env` file with

```
PRIVATE_KEY=your_wallet_private_key
SOLANA_ENDPOINT=https://api.mainnet-beta.solana.com
```

## Usage 🤖
1. Review my code and edit stuff
2. `docker build -t my-looser-cryptobot`
3. `docker run my-looser-cryptobot`
4. Enjoy

## Contributions 🫵
For bugs, ideas or features requests, please submit an issue in this repository.

## Contact 🤗
- via LinkedIn : https://www.linkedin.com/in/timothechauvet/
- via Mail : timothe@chauvet.cloud
- or via an issue in this repository
