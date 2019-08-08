const telegraf = require('telegraf')
const tokenbucket = require('tokenbucket')
const config = require('./config')

const limits = {};
const bans = {};

const bot = new telegraf(config.token)
bot.start((ctx) => ctx.reply('您好，請加我在您的群子裡'))

bot.on('message', async (ctx) => {
    if (ctx.updateSubTypes.indexOf('document') > -1 ) {
        await ctx.telegram.deleteMessage(ctx.message.chat.id, ctx.message.message_id)
    }

    if (ctx.updateSubTypes.indexOf('new_chat_members') > -1) {
        if(bans[ctx.message.from.id] >= 3) {
            await ctx.telegram.kickChatMember(ctx.message.chat.id, ctx.message.from.id)
            return
        }
    }

    //console.log(ctx.updateSubTypes)
    //console.log(ctx.message)

    if (!(ctx.message.from.id in limits)) {
        limits[ctx.message.from.id] = new tokenbucket({
            size: 5,
            tokensToAddPerInterval: 1,
            interval: 'minute',
            tokensLeft: 2
        })
    }
    if (!limits[ctx.message.from.id].removeTokensSync(1)) {
        await ctx.telegram.deleteMessage(ctx.message.chat.id, ctx.message.message_id)
        if (!bans[ctx.message.from.id]) {
            bans[ctx.message.from.id] = 0
        }
        bans[ctx.message.from.id]++
        if(bans[ctx.message.from.id] >= 3) {
            await ctx.telegram.kickChatMember(ctx.message.chat.id, ctx.message.from.id)
        }
    }
})

if (process.argv[1]) {
    bot.startWebhook('/', null, 5000)
    bot.telegram.setWebhook(process.argv[1])
}

bot.launch()
