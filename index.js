const telegraf = require('telegraf')
const config = require('./config')

const bot = new telegraf(config.token)
bot.start((ctx) => ctx.reply('您好，請加我在您的群子裡'))
bot.on('message', async (ctx) => {
    if (ctx.updateSubTypes.indexOf('document') > -1 ) {
        await ctx.telegram.deleteMessage(ctx.message.chat.id, ctx.message.message_id)
    }
    //console.log(ctx.updateSubTypes)
    //console.log(ctx.message)
})
bot.launch()
