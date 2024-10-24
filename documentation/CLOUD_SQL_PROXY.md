# Cloud SQL Proxy

## Info

- This is being used for connecting production database from local system.
- [Documentation](https://cloud.google.com/sql/docs/postgres/sql-proxy)
- [Github Repo](https://github.com/GoogleCloudPlatform/cloud-sql-proxy)

## Prerequisite

- Download and install proxy from [here](https://cloud.google.com/sql/docs/postgres/sql-proxy#install) based on operating system.

## Create Key

- If you don't have JSON key for cloud sql proxy you need to create one from gcp.
- In GCP go to `Service Accounts` and select `cloud-sql-proxy` account.
- Go to `Keys` section. and click on `Add Key` > `Create new key`, keep the type `JSON` and it will download one json file.

## Create proxy tunnel

- For creating proxy tunnel run below command and you can pass any port you want to open the proxy in your local system.

```sh
cloud-sql-proxy -p 5435 --credentials-file <path to json file> orderna-api:asia-southeast1:orderna-db
```

## Connection

- Now connect to `127.0.0.1:port`, it will connect with production database directly though proxy.

> port is which you have used for creating tunnel.
