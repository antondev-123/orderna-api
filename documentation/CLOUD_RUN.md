# Cloud Run

## Info

- Cloud run is service provided by gcp in which we can spin up docker container from image (in our case from artifact registry).
- It has environment variables, secrets injected as environment variable defined.
- After performing load testing for single docker container we can do below
  - Requests handling is defined within cloud run service can be modify and adjust precisely.
  - It has horizontal scaling defined max to 3 container as of now but again it's default can be configured.
  - Basic resources are `512GB RAM` and `1 CPU` for dev and prod but again should be change.
- Networking is being configure to `default` VPC which is used for connecting redis from cloud run internally & connecting to cloud sql database.
- Cloud SQL is configured for `prod` cloud run service to have connection with database.
