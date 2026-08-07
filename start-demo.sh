#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"
FRONTEND_DIR="$ROOT_DIR/frontend"
LOG_DIR="$ROOT_DIR/.demo-logs"

BACKEND_PORT="${BACKEND_PORT:-5001}"
FRONTEND_PORT="${FRONTEND_PORT:-8000}"

require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Missing required command: $1"
    exit 1
  fi
}

is_port_busy() {
  lsof -iTCP:"$1" -sTCP:LISTEN >/dev/null 2>&1
}

cleanup() {
  if [[ -n "${BACKEND_PID:-}" ]] && kill -0 "$BACKEND_PID" >/dev/null 2>&1; then
    kill "$BACKEND_PID" >/dev/null 2>&1 || true
  fi
  if [[ -n "${FRONTEND_PID:-}" ]] && kill -0 "$FRONTEND_PID" >/dev/null 2>&1; then
    kill "$FRONTEND_PID" >/dev/null 2>&1 || true
  fi
}

trap cleanup EXIT INT TERM

echo "Checking dependencies..."
require_cmd node
require_cmd npm
require_cmd python3
require_cmd lsof

if [[ ! -d "$BACKEND_DIR/node_modules" ]]; then
  echo "backend/node_modules not found. Run: (cd backend && npm install)"
  exit 1
fi

mkdir -p "$LOG_DIR"

if is_port_busy "$BACKEND_PORT"; then
  echo "Port $BACKEND_PORT is already in use. Stop the existing service first."
  exit 1
fi

if is_port_busy "$FRONTEND_PORT"; then
  echo "Port $FRONTEND_PORT is already in use. Stop the existing service first."
  exit 1
fi

echo "Starting backend on port $BACKEND_PORT..."
(
  cd "$BACKEND_DIR"
  PORT="$BACKEND_PORT" npm start
) >"$LOG_DIR/backend.log" 2>&1 &
BACKEND_PID=$!

sleep 1
if ! kill -0 "$BACKEND_PID" >/dev/null 2>&1; then
  echo "Backend failed to start. See $LOG_DIR/backend.log"
  exit 1
fi

echo "Starting frontend on port $FRONTEND_PORT..."
(
  cd "$FRONTEND_DIR"
  python3 -m http.server "$FRONTEND_PORT"
) >"$LOG_DIR/frontend.log" 2>&1 &
FRONTEND_PID=$!

sleep 1
if ! kill -0 "$FRONTEND_PID" >/dev/null 2>&1; then
  echo "Frontend failed to start. See $LOG_DIR/frontend.log"
  exit 1
fi

LAN_IP="$(ipconfig getifaddr en0 2>/dev/null || echo 'your-lan-ip')"

echo ""
echo "SafeStay demo services started"
echo "Backend URL : http://localhost:${BACKEND_PORT}"
echo "Frontend URL: http://localhost:${FRONTEND_PORT}/index.html"
echo "Phone URL   : http://${LAN_IP}:${FRONTEND_PORT}/index.html"
echo "Logs        : $LOG_DIR/backend.log, $LOG_DIR/frontend.log"
echo ""
echo "Press Ctrl+C to stop both services."

wait