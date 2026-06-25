#!/bin/sh
set -e

# Create superuser before serve starts listening
if [ -n "$PB_EMAIL" ] && [ -n "$PB_PASS" ]; then
	./pocketbase superuser create "$PB_EMAIL" "$PB_PASS"
fi

exec ./pocketbase serve --http 0.0.0.0:8090
