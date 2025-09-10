import { InitBot } from './src/bot';

async function InitProd() {
    await InitBot();
}

await InitProd();
