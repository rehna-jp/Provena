# To fix Docker Compose issues:
# 1. Move this file (docker-compose.yml) from backend/docker/ to backend/
# 2. Then run all docker compose commands from the backend directory, not the docker subfolder.
#
# Your backend directory structure should look like:
#
# backend/
#   app/
#   ai/
#   docs/
#   docker/
#   tests/
#   requirements.txt
#   Dockerfile
#   docker-compose.yml  <--- should be here
#
# This will allow the backend service to find the app module and all volume mounts to work as expected.
