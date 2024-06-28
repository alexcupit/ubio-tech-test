#!/bin/bash

set -e

function cleanup {
    echo "Stopping and removing Docker container..."
    npm run stop-docker
}

trap cleanup EXIT

echo "Starting MongoDB container..."
npm run start-docker 

echo "Compiling code to JS..."
npm run compile

echo "Running tests sequentially..."

for file in $(find out/test -name '*.test.js'); do
    echo "Running $file"
    MONGO_URL='mongodb://127.0.0.1:27017/' NODE_ENV=test mocha "$file" --timeout 3000 --exit
done
