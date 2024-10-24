# API Usage

> **_NOTE:_** Make sure to change the payload & port number

### Signup: Register a user with the following sample curl

```curl
curl -X 'POST' \
  'http://localhost:3000/auth/signup' \
  -H 'accept: */*' \
  -H 'Content-Type: application/json' \
  -d '{
    "email": "azc1.baltazar@arkconsult.com",
    "username": "daniza_baltazar1",
    "password": "$passwordHere$252810",
    "firstName": "daniza",
    "lastName": "baltazar",
    "mobile": "+639171234561"
  }'
```

### Login: Once a user is successfully registered and added to the database, execute the login API with the following sample curl

```curl
curl -X 'POST' \
  'http://localhost:3000/auth/login' \
  -H 'accept: */*' \
  -H 'Content-Type: application/json' \
  -d '{
    "email": "azc.baltazar@arkconsult.com",
    "password": "$passwordHere$252810"
  }'
```

> **_NOTE:_** A successful execution of the login API responds with a pair of “Access Token” and “Refresh Token”. The refresh token can be used to generate another access token. The access token will expire after 1 hour and the refresh token expires after 24 hours. The response payload also includes an “expires_at” field which can be used to automatically generate an access token from the refresh token if the current token is about to expire.

## Whoami: The generated access token can be verified using the whoami API to decode the access token similar to `jwt.io`, Here is a sample curl

```curl
curl -X 'GET' \
  'http://localhost:3000/auth/whoami' \
  -H 'accept: */*' \
  -H 'Authorization: Bearer <your token>'
```

### Get User by ID: The generated access token can be used as a bearer token to execute the users API. Here is a sample curl for the get user by ID API execution

```curl
curl -X 'GET' \
  'http://localhost:3000/users/1' \
  -H 'accept: */*' \
  -H 'Authorization: Bearer <your token>
```
