# Deploy to Cloud Run

# Build Docker Image
gcloud builds submit --tag gcr.io/datahorror/threadspeaker --project=datahorror --quiet

# Deployment
gcloud run deploy threadspeaker --image gcr.io/datahorror/threadspeaker --project=datahorror --platform managed --port 3000 --concurrency 80 --quiet

# List services on cloud run
# gcloud run services list --platform managed
