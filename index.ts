import { InitBot } from './src/bot.ts'

async function InitProject() {
    return await InitBot();
}

await InitProject()