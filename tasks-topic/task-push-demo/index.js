// Imports the Google Cloud Tasks library.
const { CloudTasksClient } = require("@google-cloud/tasks");

// Instantiates a client.
const client = new CloudTasksClient();

const taskGenerator = async () => {
  const taskCount = 100000;
  const project = "nova-fe";
  const queue = "gdgdemo";
  const location = "asia-northeast1";
  const url = "https://task-js-ps-s-jkoftgy3aq-an.a.run.app/taskHandler";

  for (let i = 0; i < taskCount; i++) {
    const payload = {
      a: Math.floor(Math.random() * 100),
      b: i,
    };
    const parent = client.queuePath(project, location, queue);
    const task = {
      httpRequest: {
        headers: {
          "Content-Type": "application/json",
        },
        httpMethod: "POST",
        url,
      },
    };
    if (payload) {
      task.httpRequest.body = Buffer.from(JSON.stringify(payload), "utf-8").toString("base64");
    }

    console.log("Sending task:");
    console.log(task);

    const request = { parent: parent, task: task };
    const [response] = await client.createTask(request);
    console.log(`Created task ${response.name}`);
  }
  console.log("Job completed");
};

// Call the taskGenerator function when the script is executed
taskGenerator();
