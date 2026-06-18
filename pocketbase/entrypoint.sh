#!/bin/sh
set -e

# Create superuser before serve starts listening
if [ -n "$EMAIL" ] && [ -n "$PASSWORD" ]; then
	./pocketbase superuser create "$EMAIL" "$PASSWORD"
fi

exec ./pocketbase serve --http 0.0.0.0:8090
