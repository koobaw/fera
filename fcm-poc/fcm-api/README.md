### Service
```shell
npm install -g @nestjs/cli
nest new fcm-api
cd fcm-api
http://localhost:8080/send

docker build -t asia-northeast1-docker.pkg.dev/fera-feraapp-backend-dev/fcm/fcm11:latest .
docker push asia-northeast1-docker.pkg.dev/fera-feraapp-backend-dev/fcm/fcm11:latest

gcloud run deploy fcm11 \
--image asia-northeast1-docker.pkg.dev/fera-feraapp-backend-dev/fcm/fcm11:latest \
--region asia-northeast1 \
--min-instances=0 \
--max-instances=1 \
--allow-unauthenticated \
--set-env-vars=PROJECT_ID=fera-feraapp-backend-dev
```

### JOB
```
export GOOGLE_PROJECT=fera-feraapp-infra-dev
export REGION=asia-northeast1
export IMAGE_URL=asia-northeast1-docker.pkg.dev/fera-feraapp-infra-dev/infra/golang-job:latest
export JOB_NAME=run-go-bk
export sa="golang-job-firestore-backup@fera-feraapp-infra-dev.iam.gserviceaccount.com"
export project_id="fera-feraapp-infra-dev"
gcloud config configurations activate $project_id
gcloud config set project $project_id
gcloud auth application-default set-quota-project $project_id

docker build -t $IMAGE_URL .
docker push $IMAGE_URL
docker container run --rm $IMAGE_URL

gcloud run jobs delete $JOB_NAME \
    --project $GOOGLE_PROJECT \
    --region $REGION

gcloud run jobs deploy $JOB_NAME \
    --service-account $sa \
    --set-env-vars GOOGLE_CLOUD_PROJECT=fera-feraapp-infra-dev \
    --max-retries 3 \
    --tasks 1 \
    --cpu 2 \
    --memory 4Gi \
    --task-timeout 4h \
    --image $IMAGE_URL \
    --parallelism 0 \
    --project $GOOGLE_PROJECT \
    --region $REGION

gcloud run jobs execute $JOB_NAME --region $REGION --project $GOOGLE_PROJECT
```


```
curl -X POST https://fcm11-eqqsu5fmdq-an.a.run.app/send \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Your Notification Title",
    "body": "Your Notification Body"
  }'

```