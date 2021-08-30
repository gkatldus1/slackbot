const { App } = require('@slack/bolt');
const dotenv = require('dotenv');
const fetch = require("node-fetch");
const cron = require("node-cron");
const mysql = require('mysql');
const { Record } = require('./models');
const { Op } = require("sequelize");

let sequelize = require('./models/index').sequelize;

dotenv.config()

const app = new App({
    token: `${process.env.BOT_TOKEN}`,
    signingSecret: `${process.env.SLACK_SIGNING_SECRET}`,
    socketMode: true,
    appToken: `${process.env.SLACK_APP_TOKEN}`
});



let wanna_eat = []; // 후에 점심 식사를 하실 이용자들의 아이디를 넣을 배열
let food_arr = [];
let day = 0;


let fs = require('fs');
const { create } = require('domain');
fs.readFile('foodList.txt', 'utf-8', function(err, data) {
  food_arr = data.split(" ");
})

let connection = mysql.createConnection({
  host :'localhost',
  user : 'root',
  password : `${process.env.PASSWD}`,
  database: 'mydb'
})


//// data inserting section
// data1 = JSON.stringify({food:["짜장","짬뽕","카레"]});
// data2 = JSON.stringify({food:["닭가슴살","백반","카레"]});
// data3 = JSON.stringify({food:["도시락","청경채","백반"]});
// data4 = JSON.stringify({food:["짬뽕","간장게장","돼지갈비"]});
// data5 = JSON.stringify({food:["도시락","군만두","칼국수"]});
// data6 = JSON.stringify({food:["청국장","오렌지","오리고기"]});
// data7 = JSON.stringify({food:["양념게장","청경채","김치찌개"]});
// data8 = JSON.stringify({food:["오렌지","닭볶음탕","돈까스"]});
// data9 = JSON.stringify({food:["우렁된장찌개","부대찌개","백반"]});

// connection.connect();
// sequelize.sync();
// content = [{
//   name: 'gyuhong',
//   food_list: [data1],
// },

// {
//   name: 'gyuha',
//   food_list: [data2], 
// },

// {
//   name: 'minhwan',
//   food_list: [data3], 
// },

// {
//   name: 'siyeon',
//   food_list: [data4], 
// },

// {
//   name: 'kakaka',
//   food_list: [data5],
// },

// {
  
//   name: 'lalalal',
//   food_list: [data6],
  
// },
// {
  
//   name: 'lololo',
//   food_list: [data7],
  
// },{
  
//   name: 'yayayay',
//   food_list: [data8],
// },
// {  
//   name: 'yeahehee',
//   food_list: [data9],
// },

// ];

// (async () => {
//   await Record.bulkCreate(content);
// })();




app.message('!점심', async({ message, say }) => {
  let suggestion = '';
  let flag = false;
  let menu = food_arr;
  let food_number = menu.length;
  let food_all =[];
  const result = await Record.findAll({ //db 관리할 데이터(가져올) 설정 부분
    attributes: ['food_list']
  });
  // console.log(JSON.parse(result[0].dataValues.food_list).food);
  // console.log(result[0].dataValues);
  for(let i = 0; i < result.length; i++) {
    food_all.push(JSON.parse(result[i].dataValues.food_list).food);
  }
  // console.log(food_all);
  
  while(1){
    let random = Math.floor(Math.random() * food_number);
    let food = menu[random];
    for(let i = 0; i < food_all.length; i++) {
      if(food_all[i].includes(food)) {
        let index = menu.indexOf(food);
            if (index > -1) {
              menu.splice(index, 1);
              food_number --;
            }
            if (menu.length === 0){
              flag = true;
              suggestion = '백반';
              for(let i = 0; i <food_all.length; i++ ){
                food_all[i][day] = suggestion;
              }
              day ++;
              if (day === 3){ //day 설정 부분.
                day = 0;
              }
              break;
            }
      } else if(i === (food_all.length-1)) {  //마지막 음식 저장 데이터까지 확인 완료
        flag = true;
        suggestion = food;
        for(let i = 0; i <food_all.length; i++ ){
          food_all[i][day] = suggestion;
        }
      }
    }
    if (flag === true){
      console.log(suggestion);
      day ++; //db에 업데이트할 day를 추적
      if (day === 3){ //day 설정 부분
        day = 0;
      }
      break;
    }     
  }

  await say({
      text:`오늘 점심은 ${suggestion}을(를) 추천드립니다.`
  });

  // 추천한 음식으로 db 레코드 업데이트
  for(let i = 0; i < food_all.length; i++){
    let new_data = JSON.stringify({food:food_all[i]});
    await Record.update({
      food_list: new_data
    },{
      where:{
        id: i+1
      }
    });
  }
})

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
  

  const task = cron.schedule("20 12 1-31 * *", () => {
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
connection.end();




(async () => {
    await app.start(process.env.PORT || 3000);

    console.log('⚡️ Bolt app is running!');
})();
