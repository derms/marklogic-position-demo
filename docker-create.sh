#!/bin/bash
docker-compose --skip-hostname-check up -d
docker exec -it bt-node1.local init-marklogic