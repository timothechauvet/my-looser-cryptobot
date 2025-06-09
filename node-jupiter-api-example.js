import { Connection, Keypair, VersionedTransaction } from '@solana/web3.js';
import fetch from 'cross-fetch';
import { Wallet } from '@project-serum/anchor';
import bs58 from 'bs58';

let lastPrice = 0;
let goingDownCount = 0;
let goingUpCount = 0;
var multiplicator = 1;

async function performSwap(input_mint, output_mint, amount) {
    try {
        // Initialize connection and wallet
        const connection = new Connection('https://api.mainnet-beta.solana.com');
        const wallet = new Wallet(Keypair.fromSecretKey(bs58.decode(process.env.PRIVATE_KEY || '')));

        // Get a quote for the swap
        const quote_url = `https://quote-api.jup.ag/v6/quote?inputMint=${input_mint}&outputMint=${output_mint}&amount=${amount}&slippageBps=300`;
        console.log('Fetching quote from:', quote_url);
        const quoteResponse = await (
            await fetch(quote_url)
        ).json();

        // Get serialized transactions for the swap
        const swapResponse = await (
            await fetch('https://quote-api.jup.ag/v6/swap', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    quoteResponse,
                    userPublicKey: wallet.publicKey.toString(),
                    wrapAndUnwrapSol: true,
                    dynamicComputeUnitLimit: true,
                    prioritizationFeeLamports: 'auto',
                })
            })
        ).json();

        const { swapTransaction } = swapResponse;

        // Deserialize the transaction
        const swapTransactionBuf = Buffer.from(swapTransaction, 'base64');
        const transaction = VersionedTransaction.deserialize(swapTransactionBuf);

        // Sign the transaction
        transaction.sign([wallet.payer]);

        // Execute the transaction
        const rawTransaction = transaction.serialize();
        const txid = await connection.sendRawTransaction(rawTransaction, {
            skipPreflight: true,
            maxRetries: 2
        });

        // Confirm the transaction
        const latestBlockHash = await connection.getLatestBlockhash();
        await connection.confirmTransaction({
            blockhash: latestBlockHash.blockhash,
            lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
            signature: txid
        });

        console.log(`https://solscan.io/tx/${txid}`);
    } catch (error) {
        console.error('Error during the swap:', error);
    }
}

async function getCurrentPrice() {
  try {
    const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd');
    const data = await response.json();
    return data.solana.usd;
  } catch (error) {
    console.error('Error fetching price:', error);
    return lastPrice;
  }
}

async function trackPriceAndSwap() {
  try {
      const currentPrice = await getCurrentPrice(lastPrice);
      const timestamp = new Date().toISOString();
      console.log(`Price recorded at ${timestamp}: ${currentPrice}`);

      // Determine if the price is going down or up in a streak
      if (currentPrice < lastPrice) {
          goingDownCount++;
          goingUpCount = 0;  // Reset upward streak
          console.log(`Price went down ${goingDownCount} times in a row.`);
      } else if (currentPrice > lastPrice) {
          goingUpCount++;
          goingDownCount = 0;  // Reset downward streak
          console.log(`Price went up ${goingUpCount} times in a row.`);
      } else {
          console.log("Price stayed the same, no action taken.");
      }

      // Swap based on streaks
      if (goingDownCount > 0 && currentPrice != lastPrice) {
        await performSwap('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', 'So11111111111111111111111111111111111111112', Math.min(goingDownCount, 5) * 1_000_000 * multiplicator);
      } else if (goingUpCount > 0 && currentPrice != lastPrice) {
        const amountInLamports = Math.floor((Math.min(goingUpCount, 5) * 1 / currentPrice) * 1_000_000_000 * multiplicator);
        await performSwap('So11111111111111111111111111111111111111112', 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', amountInLamports);
      }

      lastPrice = currentPrice;
      
  } catch (error) {
      console.error("Error while tracking price and swapping:", error);
  }
}

multiplicator = parseInt(process.env.MULTIPLICATOR) || 1;
lastPrice = await getCurrentPrice(200);
setInterval(trackPriceAndSwap, 1800000);