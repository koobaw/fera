const { PubSub } = require('@google-cloud/pubsub');

const pubSubClient = new PubSub();
const topicName = 'projects/nova-nv/topics/ps-demo';

async function publishBatchedMessages(maxMessages, maxWaitTime) {
  const publishOptions = {
    batching: {
      maxMessages: maxMessages,
      maxMilliseconds: maxWaitTime * 1000,
    },
  };
  const batchPublisher = pubSubClient.topic(topicName, publishOptions);

  const promises = [];
  for (let i = 0; i < maxMessages; i++) {
    console.log(`${i} start.`);
    promises.push(
      (async () => {
        const data = JSON.stringify({
          a: Math.floor(Math.random() * 100),
          b: i,
        });
        const dataBuffer = Buffer.from(data);

        const messageId = await batchPublisher.publishMessage({
          data: dataBuffer,
        });
        console.log(`Message ${messageId} published.`);
      })()
    );
  }
  await Promise.all(promises);
}

async function main() {
  const maxMessages = 100000;
  const maxWaitTime = 10;

  await publishBatchedMessages(maxMessages, maxWaitTime);
}

main().catch(console.error);
