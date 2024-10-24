# IAM

## Info

- This is responsible for access control over the all resources.
- There is several services account created with some require role and permission to perform some action.

## Custom Role | GitHub Role

- There is custom role named `GitHub Role` which is having permission for act as other account to deploy new revision for cloud run.

## Github Service account

- This account (`github@orderna-api.iam.gserviceaccount.com`) is responsible and having permission which is require to push build image to artifact registry and deploy new revision for cloud run.
- This has permission for `Cloud Run Developer`, `Artifact Registry Writer` & `GitHub Role`.
- JSON Key file is being generated from this service account and added as secrets in github which will be used to authenticate github pipeline.

## Cloud Run Service account

- This account (`cloud-run@orderna-api.iam.gserviceaccount.com`) is responsible for having permission for Cloud run access & Secret manager access to inject as env inside the docker container.
- This has permission for `Cloud Run Developer`, `Cloud SQL Client` & `Secret Manager Secret Accessor`.
- This is by default added in cloud run service as service account for dev and prod both.

## Cloud SQL Proxy Service account

- This account (`cloud-sql-proxy@orderna-api.iam.gserviceaccount.com`) is for creating proxy between local system to gcp for acceding production database.
- Follow DB connection [guideline](./CLOUD_SQL_PROXY.md) to use this service account for connecting db from local your machine.

## Others

- There is one account (`395457320407-compute@developer.gserviceaccount.com`) is created by gcp and it is being used for manage redis vm instance by default managed by gcp itself.
