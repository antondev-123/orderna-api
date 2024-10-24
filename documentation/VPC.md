# VPC

## Info

- There is `default` vpc which is available in all region to perform internal connection.

## VPC network Peering

- For security purpose cloud sql database (prod database) is in isolated network, for connecting to database from cloud run there is network peering created between 2 networks.
