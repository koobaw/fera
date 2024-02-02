const FCM = require("fcm-node");
const serverKey =
  "AAAAu6SBq8E:APA91bGZQPkosHb6Ko5xbpMH4nfbsYSKIJpv0L3VdbfgfjEIa-iFB4xX_bNGLxaeeGE0lh6oaoSWrKk2ZY5-jKxFu8bkDF431_o11v9RqiKyWnFyGwyaJsX83d6yT4TXOYXpDrVdnmBw";
const fcm = new FCM(serverKey);

const message = {
  notification: {
    title: "Test notification5",
    body: "Test Body message5",
    notice: "Test Body message5",
  },
  to: "fJmHwyhzMRip_BKCLxrSTw:APA91bF3oDkR-hO2SOGxV92GlPnbJZhOsfS1MOqp3ljS9JQ4G5ilaIgYB1X_ejC8LLZ-QkPKgU2Sa34KOFJo7zX_q6JdjqtTiR5GgHpCiKtuTJUfzj6iWNExDJQGoSgJfF7rhyVnlnNH",
};
fcm.send(message, function (err, response) {
  if (err) {
    console.error("error sending message :", err);
  } else {
    console.log("Successfully sent ", response);
  }
});
