# Deploy to GAE
yarn build:staging
gcloud app deploy app.yaml --project=datahorror --quiet
