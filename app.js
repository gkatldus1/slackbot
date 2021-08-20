const { App } = require('@slack/bolt');
const dotenv = require('dotenv')

dotenv.config()

const app = new App({
    token: `${process.env.BOT_TOKEN}`,
    signingSecret: `${process.env.SLACK_SIGNING_SECRET}`,
    socketMode: true,
    appToken: `${process.env.SLACK_APP_TOKEN}`
});

// app.message('hello', async ({ message, say}) => {
//     await say(`Hey there <@${message.user}>!`);
// })

app.message('hello', async ({ message, say }) => {
    // say() sends a message to the channel where the event was triggered
    await say(`Hey there <@${message.user}>!`);
  });

(async () => {
    await app.start(process.env.PORT || 3000);

    console.log('⚡️ Bolt app is running!');
})();