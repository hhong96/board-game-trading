#!/usr/bin/env bash

curl -X POST http://localhost:5000/login -d '{"emailOrNickname": "foo", "password": "foobar"}' -H 'content-type: application/json'