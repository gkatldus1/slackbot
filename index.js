const Slack = require("slack-node");

const API_TOKEN = `${process.env.BOT_TOKEN}`;

const slack = new Slack(API_TOKEN);
const send = async(sender, message) => {
    slack.api(
        "chat.postMessage",
        {
            text:`${sender}:\n${message}`,
            channel: "#bot-test",
            icon_emoji:"slack",
        },
        (error, response) => {
            if(error) {
                console.log(error);
                return;
            }
            console.log(response)
        }
    );
};

send("함시연", "send message");