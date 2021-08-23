const { App } = require('@slack/bolt');
const dotenv = require('dotenv')
const { WebClient, LogLevel } = require("@slack/web-api");
dotenv.config()

const app = new App({
    token: `${process.env.BOT_TOKEN}`,
    signingSecret: `${process.env.SLACK_SIGNING_SECRET}`,
    socketMode: true,
    appToken: `${process.env.SLACK_APP_TOKEN}`
});

const client = new WebClient(`${process.env.BOT_TOKEN}`, {
    // LogLevel can be imported and used to make debugging simpler
    logLevel: LogLevel.DEBUG
  });



let food_arr = ['짜장면', '비빔밥', '칼국수', '백반', '카레', '고무고무열매', '이글이글열매', '도톰도톰열매'];
let wanna_eat = [];


app.message('!점심', async({ message, say }) => {
    let random = Math.floor(Math.random() * 8);

    await say({
        text:`오늘 점심은 ${food_arr[random]}을(를) 추천드립니다.`
    });
});

app.action('count_clicker', async ({ body, ack, say }) => {
    // Acknowledge the action
    try{
        if (wanna_eat.includes(body.user.id)){
            return;
        } else{
            wanna_eat.push(body.user.id);
            console.log(wanna_eat);
        }
        await ack();
    }
    catch(error){
        console.error(error);
    }
    finally{
        await say(`현재 누르신 분을 포함 점심식사 예정 인원은 ${wanna_eat.length} 명입니다.`);
    }
    
});


// 12:20 sending message logic
let lunchtime = '1629775200';
let temp = '11629707020';
const next = 86400;
// Channel you want to post the message to
const channelId = "C02C13NGFU1";

const today = new Date();
today.setDate(today.getDate());
today.setHours(5,17, 0);


try {
    // Call the chat.scheduleMessage method using the WebClient
     const result = async () => {
         await client.chat.scheduleMessage({
            blocks: [
                {
                  "type": "section",
                  "text": {
                    "type": "mrkdwn",
                    "text": `현재 식사를 원하는 인원은 ${wanna_eat.length} 명 입니다.`
                  },
                  "accessory": {
                    "type": "button",
                    "text": {
                      "type": "plain_text",
                      "text": "식사를 원하시면 눌러주세요"
                    },
                    "action_id": "count_clicker"
                  }
                }
              ],
            channel: channelId,
            text: "Looking towards the future",
            // Time to post message, in Unix Epoch timestamp format
            post_at: temp /1000
            });
        }
  
    console.log(result);
  }
  catch (error) {
    console.error(error);
  }
finally{
    lunchtime = lunchtime + next;
}


try {
  // Call the chat.postMessage method using the WebClient
  const result = async() => {
    await client.chat.postMessage({
    channel: channelId,
    text: "Hello world"
  });
}

  console.log(result);
}
catch (error) {
  console.error(error);
}


(async () => {
    await app.start(process.env.PORT || 3000);

    console.log('⚡️ Bolt app is running!');
})();
