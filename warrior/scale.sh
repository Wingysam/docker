#!/bin/bash
# This script scales my docker-compose services to have 6 threads * n instances because Warrior only supports up to 6 threads
docker-compose up -d --remove-orphans \
	--scale Auto=1 \
	--scale URLTeam=1 \
