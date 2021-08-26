const { App } = require('@slack/bolt');
const dotenv = require('dotenv');
const fetch = require("node-fetch");
const cron = require("node-cron");
const mysql = require('mysql');
const { Record } = require('./models');
const { Op } = require("sequelize");

// let usersRouter = require('./routes/users');
let sequelize = require('./models/index').sequelize;
// let app2 = express();
sequelize.sync();



dotenv.config()

const app = new App({
    token: `${process.env.BOT_TOKEN}`,
    signingSecret: `${process.env.SLACK_SIGNING_SECRET}`,
    socketMode: true,
    appToken: `${process.env.SLACK_APP_TOKEN}`
});



let wanna_eat = ['itzy', 'nanana', 'lalala', 'lololo', 'kakaka', 'gyuhong', 'gyuha', 'minhwan', 'siyeon'];
let food_arr = [];
let food1 = [];
let food2 = [];
let food3 = [];
let day = 1;


let fs = require('fs');
const { create } = require('domain');
fs.readFile('foodList.txt', 'utf-8', function(err, data) {
  food_arr = data.split(" ");
})



let flag = false;

let connection = mysql.createConnection({
  host :'localhost',
  user : 'root',
  password : `${process.env.PASSWD}`,
  database: 'mydb'
})

// connection.connect(function(err) {
//   if (err) throw err;
//   console.log("Connected!");
//   connection.query("CREATE DATABASE mydb", function (err, result) {
//     if (err) throw err;
//     console.log("Database created");
//   });
// });



// // connection.end();

connection.connect();
// connection.query('SELECT 1 + 1 AS solution', function (error, results, fields){
//   if (error) throw error;
//   console.log('The solution is:', results[0].solution);
// })

// content = [{
  
//   name: 'gyuhong',
//   food1: '닭가슴살',
//   food2: "청경채",
//   food3: "청국장",
// },

// {
  
//   name: 'gyuha',
//   food1: '백반',
//   food2: "짜장",
//   food3: "돈까스",
// },

// {
  
//   name: 'minhwan',
//   food1: '도시락',
//   food2: "군만두",
//   food3: "김치찌개",
// },

// {
  
//   name: 'siyeon',
//   food1: '칼국수',
//   food2: "카레",
//   food3: "백반",
// },

// {
  
//   name: 'kakaka',
//   food1: '닭가슴살',
//   food2: "군만두",
//   food3: "백반",
// }];

// (async () => {
//   const insert = await Record.bulkCreate(content);
// })();



// (async () => {
//   const result = await Record.findAll({
//     attributes: ['food1', 'food2', 'food3']
//   });
  
//   // console.log(result[0].dataValues);
//   for(let i = 0; i < result.length; i++) {
//     eat_list.push(result[i].dataValues);
//   }
//   food1 = eat_list.map(function(rowData){ return rowData.food1;});
//   food2 = eat_list.map(function(rowData){ return rowData.food2;});
//   food3 = eat_list.map(function(rowData){ return rowData.food3;});

// })();


app.message('!점심', async({ message, say }) => {
  let suggestion = '';
  let menu = food_arr;
  let food_number = 19;
  let eat_list = [];
  const result = await Record.findAll({
    attributes: ['food1', 'food2', 'food3']
  });
  
  // console.log(result[0].dataValues);
  for(let i = 0; i < result.length; i++) {
    eat_list.push(result[i].dataValues);
  }
  food1 = eat_list.map(function(rowData){ return rowData.food1;});
  food2 = eat_list.map(function(rowData){ return rowData.food2;});
  food3 = eat_list.map(function(rowData){ return rowData.food3;});
  while(1){
    
    let random = Math.floor(Math.random() * food_number);
    let food = menu[random];
    if(food1.includes(food) || food2.includes(food) || food3.includes(food)){
      let index = menu.indexOf(food);
          if (index > -1) {
            console.log(menu);
            menu.splice(index, 1);
            food_number --;
          }
          if (menu.length === 0){
            suggestion = '백반';
            day ++;
            if (day === 4){
              day = 1;
            }
            break;
          }
    } else {
      flag = true;
      suggestion = food;
    }
    
    if (flag === true){
      console.log(suggestion);
      flag = false;
      day ++;
      if (day === 4){
        day = 1;
      }
      break;
    }
      
  }

  await say({
      text:`오늘 점심은 ${suggestion}을(를) 추천드립니다.`
  });

  
  let column = `food${day}`;
  await Record.update({
    [column]: suggestion
  },{
    where:{
      id: {
        [Op.in]: [1,2,3,4,5,6,7,8,9]
      }
    }
  });
  
  
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
