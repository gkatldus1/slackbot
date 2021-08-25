const { App } = require('@slack/bolt');
const dotenv = require('dotenv');
const fetch = require("node-fetch");
const cron = require("node-cron");
dotenv.config()

const app = new App({
    token: `${process.env.BOT_TOKEN}`,
    signingSecret: `${process.env.SLACK_SIGNING_SECRET}`,
    socketMode: true,
    appToken: `${process.env.SLACK_APP_TOKEN}`
});


let food_arr = ['짜장면', '비빔밥', '칼국수', '백반', '카레', '고무고무열매', '이글이글열매', '도톰도톰열매'];
let wanna_eat = ['홍길동', '김선비', '최규옹', '김민완', '이규아', '함시현'];
let record = {'홍길동':['짜장면', '비빔밥', '칼국수'], '김선비':['짜장면', '비빔밥', '칼국수'], '최규옹':['짜장면', '비빔밥', '칼국수'], '김민완':['짜장면', '비빔밥', '칼국수'],'이규아':['짜장면', '비빔밥', '칼국수'], '함시현':['짜장면', '비빔밥', '칼국수']};
let flag = false;


app.message('!점심', async({ message, say }) => {
    let suggestion = '';
    while(1){
      
      let menu = food_arr;
      let random = Math.floor(Math.random() * 8);
      let food = menu[random];
      
      for (let i = 0; i < wanna_eat.length; i++){
        let user = record[wanna_eat[i]];
        
        if(user){
          result = user.includes(food);
          if(result === true){
            flag = false;
            let index = menu.indexOf(food);
            if (index > -1) {
              menu.splice(index, 1);
            }
            break;
          } else {
            flag = true;
          } 

        } 
          
      }
      if (flag === true) {
        flag = false;
        suggestion = food;
        for (let i = 0; i < wanna_eat.length; i++){
            let user = record[wanna_eat[i]];
            user.shift();
            user.push(food);
        }
        break;
    }
      

    }
    console.log(suggestion);
  
    await say({
        text:`오늘 점심은 ${suggestion}을(를) 추천드립니다.`
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



// Channel you want to post the message to
const channelId = "C02C13NGFU1";

const payload = {
    channel: channelId,
    blocks: [
        {
          "type": "section",
          "text": {
            "type": "mrkdwn",
            "text": '식사를 원하시는 분은 버튼을 눌러주세요~'
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
    attachments: [
      {
        title: "점심시간 10분 전!!!",
        // text: "점심시간 10분 전!!!",
        // author_name: "Food Fairy",
        color: "#00FF00",
      },
    ],
  };
  

  const task = cron.schedule("10 12 1-31 * *", () => {
    fetch("https://slack.com/api/chat.postMessage", {
    
    method: "POST",
    body: JSON.stringify(payload),
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Length": payload.length,
      Authorization: `Bearer ${process.env.BOT_TOKEN}`,
      Accept: "application/json",
      
    },
    
  })
    .then((res) => {
      if (!res.ok) {
        throw new Error(`Server error ${res.status}`);
      }
      return res.json();
    })
    .catch((error) => {
      console.log(error);
    });
  }, {
    scheduled: false
  });
 
  task.start();

(async () => {
    await app.start(process.env.PORT || 3000);

    console.log('⚡️ Bolt app is running!');
})();
