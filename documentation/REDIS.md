# Redis

## Info

- We have vm instance of `e2-small` category running `ubuntu 20.04 LTS`.
- There is 2 redis stack running inside docker container.
- In the machine there is user `orderna` from which docker container is created and in the home directory of user `orderna` there is docker-compose yaml files for dev and prod which is using `redis/redis-stack:7.4.0-v0` docker image for redis stack container.
- dev redis is running on port `6379` and prod is running on `6380` both port are exposed form machine.
- both redis container has attached volume so killing and creating redis container will not loose any data.

## Connection

- In cloud run the redis connection is with private ip as cloud run and redis-vm both are in same network and cloud run has VPC attached for outbound request.
- Redis vm has attached public ip as well, so for connecting redis from local machine you need to whitelist your ip in default network firewall rule `orderna-redis-external-ip`
