# Cloud SQL

## Info

- This is being used for prod database.
- Resource for this instance are `1 vCPU`, `614.4MB RAM`, `10GB SSD`.
- It has public IP enable but not whitelisted any IP only for connecting via cloud sql proxy.
- There is `prod` user in db for accessing database.
- Backup cycle for 7 days is configured multi region.
- No read replica is there as of now.
- Max 250 connection supported for now. (we should be using connection pool instead of increasing this)
  - Can be increase from database flag `max_connection` up to `262143`.
- It's single region database available in `asia-southeast1`.
