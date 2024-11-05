#!/bin/bash

# Start the MongoDB containers
echo "Starting MongoDB containers..."
docker-compose up -d

# Wait for MongoDB to be ready
echo "Waiting for MongoDB to start..."
sleep 10

# Initialize replica set
echo "Initializing replica set..."
docker exec mongo1 mongosh --eval '
config = {
    "_id": "rs0",
    "version": 1,
    "members": [
        {
            "_id": 1,
            "host": "host.docker.internal:27017",
            "priority": 1
        },
        {
            "_id": 2,
            "host": "host.docker.internal:27018",
            "priority": 1
        },
        {
            "_id": 3,
            "host": "host.docker.internal:27019",
            "priority": 1,
        }
    ]
};
rs.initiate(config);
'

# Connect thorugh mongodb://127.0.0.1:27017,127.0.0.1:27018,127.0.0.1:27019/medium?replicaSet=rs0&connectTimeoutMS=3000
