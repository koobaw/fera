```
export GOOGLE_PROJECT=nova-fe
export REGION=asia-northeast1
export IMAGE_URL_J=asia-northeast1-docker.pkg.dev/nova-fe/fcm/task-j:latest
export JOB_NAME=task-job-ps
export sa="taskgenerator@nova-fe.iam.gserviceaccount.com"
export project_id="nova-fe"
gcloud config configurations activate $project_id
gcloud config set project $project_id
gcloud auth application-default set-quota-project $project_id

docker build -t $IMAGE_URL_J .
docker push $IMAGE_URL_J
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
    --image $IMAGE_URL_J \
    --parallelism 1 \
    --project $GOOGLE_PROJECT \
    --region $REGION

gcloud run jobs execute $JOB_NAME --region $REGION --project $GOOGLE_PROJECT
```