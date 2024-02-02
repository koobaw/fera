```
export GOOGLE_PROJECT=nova-fe
export REGION=asia-northeast1
export IMAGE_URL=asia-northeast1-docker.pkg.dev/nova-fe/fcm/task:latest
export JOB_NAME=task-js-ps
export sa="taskgenerator@nova-fe.iam.gserviceaccount.com"
export project_id="nova-fe"
gcloud config configurations activate $project_id
gcloud config set project $project_id
gcloud auth application-default set-quota-project $project_id


export GOOGLE_PROJECT=nova-fe
export REGION=asia-northeast1
export IMAGE_URL_S=asia-northeast1-docker.pkg.dev/nova-fe/fcm/task-s:latest
export SERVICE_NAME=task-js-ps-s
export sa="taskgenerator@nova-fe.iam.gserviceaccount.com"
export project_id="nova-fe"
gcloud config configurations activate $project_id
gcloud config set project $project_id
gcloud auth application-default set-quota-project $project_id

docker build -t $IMAGE_URL_S .
docker push $IMAGE_URL_S

gcloud run deploy $SERVICE_NAME \
--image $IMAGE_URL_S \
--region $REGION \
--allow-unauthenticated

```