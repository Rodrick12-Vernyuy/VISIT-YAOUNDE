"""WebSocket chat server (asyncio, event-driven concurrency).

Why WebSocket instead of a raw TCP socket server: Render (where the rest of
this app is deployed) only exposes HTTP/HTTPS publicly — a plain TCP
protocol has nowhere to go once it leaves your own machine. WebSocket
solves that: it's still a full-duplex socket underneath, but the
connection begins as a normal HTTP request with an `Upgrade: websocket`
header, so it passes through the same HTTP-terminating proxy every other
service here goes through.

Concurrency model: instead of one OS thread per client (the classic
thread-per-client pattern), each connection is handled by an `asyncio`
coroutine on a single event loop. A blocking-looking `await ws.recv()`
suspends only that one coroutine — the event loop keeps servicing every
other connection in the meantime. This is the event-driven alternative to
threading.

Protocol is intentionally the same shape as the raw-socket version: on
connect, the server asks for a username, then a room name, then broadcasts
every subsequent line to everyone else currently in that room.
"""

import asyncio
import os

from websockets.asyncio.server import serve, ServerConnection
from websockets.datastructures import Headers
from websockets.exceptions import ConnectionClosed
from websockets.http11 import Request, Response

HOST = "0.0.0.0"
PORT = int(os.environ.get("PORT", 5000))

rooms: dict[str, set[ServerConnection]] = {}


def health_check(connection: ServerConnection, request: Request) -> Response | None:
    """Let Render's health check (a plain HTTP GET) succeed without trying
    to perform a WebSocket handshake — only requests carrying the
    `Upgrade: websocket` header are allowed to fall through to the chat
    handler."""
    if request.path == "/health":
        body = b'{"status":"ok","service":"chat-server"}\n'
        headers = Headers({"Content-Type": "application/json", "Content-Length": str(len(body))})
        return Response(200, "OK", headers, body)
    return None


async def broadcast(message: str, room_name: str, exclude: ServerConnection | None = None) -> None:
    dead = []
    for ws in rooms.get(room_name, ()):
        if ws is exclude:
            continue
        try:
            await ws.send(message)
        except ConnectionClosed:
            dead.append(ws)
    for ws in dead:
        rooms.get(room_name, set()).discard(ws)


async def handle_client(websocket: ServerConnection) -> None:
    username = None
    room_name = None
    try:
        await websocket.send("Enter your username: ")
        username = (await websocket.recv()).strip()
        if not username:
            return

        await websocket.send("Enter room name (default 'general'): ")
        room_name = (await websocket.recv()).strip() or "general"
        rooms.setdefault(room_name, set()).add(websocket)
        print(f"[USER] {username} joined room '{room_name}'")

        await websocket.send(f"Joined room '{room_name}'. Start chatting!")
        await broadcast(f"[{room_name}] {username} joined the room", room_name, exclude=websocket)

        async for message in websocket:
            text = message.strip()
            if text:
                await broadcast(f"{username}: {text}", room_name, exclude=websocket)
    except ConnectionClosed:
        pass
    finally:
        if room_name and websocket in rooms.get(room_name, set()):
            rooms[room_name].discard(websocket)
            if not rooms[room_name]:
                del rooms[room_name]
        if username and room_name:
            await broadcast(f"[{room_name}] {username} left the room", room_name)
        print(f"[DISCONNECT] {username or 'Unknown user'} disconnected")


async def main() -> None:
    print(f"[SERVER] Listening on {HOST}:{PORT}")
    async with serve(handle_client, HOST, PORT, process_request=health_check):
        await asyncio.get_running_loop().create_future()  # run forever


if __name__ == "__main__":
    asyncio.run(main())
