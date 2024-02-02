```
docker build -t  asia-northeast1-docker.pkg.dev/nova-fe/fcm/ps:latest .


export GOOGLE_PROJECT=nova-nv
export REGION=us-central1
export IMAGE_URL=asia-northeast1-docker.pkg.dev/nova-nv/infra/ps:latest
export JOB_NAME=run-js-ps
export sa="taskgenerator@nova-nv.iam.gserviceaccount.com"
export project_id="nova-nv"
gcloud config configurations activate $project_id
gcloud config set project $project_id
gcloud auth application-default set-quota-project $project_id

docker build -t $IMAGE_URL .
docker push $IMAGE_URL
gcloud run jobs delete $JOB_NAME \
    --project $GOOGLE_PROJECT \
    --region $REGION
gcloud run jobs deploy $JOB_NAME \
    --service-account $sa \
    --set-env-vars GOOGLE_CLOUD_PROJECT=nova-fe \
    --max-retries 1 \
    --tasks 1 \
    --cpu 8 \
    --memory 16Gi \
    --task-timeout 12h \
    --image $IMAGE_URL \
    --parallelism 1 \
    --project $GOOGLE_PROJECT \
    --region $REGION

gcloud run jobs execute $JOB_NAME --region $REGION --project $GOOGLE_PROJECT



export GOOGLE_PROJECT=nova-nv
export REGION=us-central1
export IMAGE_URL_S=asia-northeast1-docker.pkg.dev/nova-nv/infra/ps-s:latest
export SERVICE_NAME=run-js-ps-s
export sa="taskgenerator@nova-nv.iam.gserviceaccount.com"
export project_id="nova-nv"
gcloud config configurations activate $project_id
gcloud config set project $project_id
gcloud auth application-default set-quota-project $project_id

docker build -t $IMAGE_URL_S .
docker push $IMAGE_URL_S
gcloud run jobs delete $SERVICE_NAME \
    --project $GOOGLE_PROJECT \
    --region $REGION

gcloud run deploy $SERVICE_NAME \
--image $IMAGE_URL_S \
--region $REGION \
--allow-unauthenticated



--service-account=taskgenerator@nova-nv.iam.gserviceaccount.com \
--transport-topic=projects/nova-nv/topics/ps-demo \
--destination-run-service=run-js-ps-s \
--destination-run-region=us-central1 \
--destination-run-path="/" \
--event-filters="type=google.cloud.pubsub.topic.v1.messagePublished"
```