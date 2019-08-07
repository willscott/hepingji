const telegraf = require('telegraf')
const tokenbucket = require('tokenbucket')
const config = require('./config')

const limits = {};

const bot = new telegraf(config.token)
bot.start((ctx) => ctx.reply('您好，請加我在您的群子裡'))

bot.on('message', async (ctx) => {
    if (ctx.updateSubTypes.indexOf('document') > -1 ) {
        await ctx.telegram.deleteMessage(ctx.message.chat.id, ctx.message.message_id)
    }
    //console.log(ctx.updateSubTypes)
    //console.log(ctx.message)

    const id = ctx.message.chat.id + '.' + ctx.message.from.id;
    if (!(id in limits)) {
        limits[id] = new tokenbucket({
            size: 3,
            tokensToAddPerInterval: 1,
            interval: 'minute',
            tokensLeft: 1
        })
    }
    if (!limits[id].removeTokensSync(1)) {
        await ctx.telegram.deleteMessage(ctx.message.chat.id, ctx.message.message_id)
    }
})

if (process.argv[1]) {
    bot.startWebhook('/', null, 5000)
    bot.telegram.setWebhook(process.argv[1])
}

bot.launch()
