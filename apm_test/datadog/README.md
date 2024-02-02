# cloud-run-demo-js

[Run on Google Cloud](https://deploy.cloud.run)

export GOOGLE_PROJECT=nova-fe
export REGION=asia-northeast1
export IMAGE_URL=asia-northeast1-docker.pkg.dev/nova-fe/infra/dd:latest
export JOB_NAME=run-go-bk
export sa="golang-job-firestore-backup@nova-fe.iam.gserviceaccount.com"
export project_id="nova-fe"
gcloud config configurations activate $project_id
gcloud config set project $project_id
gcloud auth application-default set-quota-project $project_id
docker build -t $IMAGE_URL .
docker push $IMAGE_URL

gcloud run deploy cloud-run-demo-js --image=${IMAGE_URL} \
  --port=80 \
  --region=${REGION} \
  --update-env-vars=DD_API_KEY=${DD_API_KEY} \
  --update-env-vars=DD_TRACE_ENABLED=true \
  --update-env-vars=DD_SITE='ap1.datadoghq.com' \
  --update-env-vars=DD_TRACE_PROPAGATION_STYLE='datadog'

export DD_API_KEY=''

curl -X GET "https://api.ap1.datadoghq.com/api/v1/validate" \
-H "Accept: application/json" \
-H "DD-API-KEY: ${DD_API_KEY}"