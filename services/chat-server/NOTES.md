# Notes — Sockets, Threading, Event-Driven I/O, and REST

## Why this went from raw TCP + threads to WebSocket + asyncio

The first working version of this server (kept below, since the concepts
it demonstrates are still accurate and still the ones the lecture covers)
used a raw `SOCK_STREAM` socket with one thread per client. That runs fine
locally and in `docker-compose`, but it can't be exposed publicly on
Render: Render's Web Service type terminates all public traffic as
HTTP/HTTPS and forwards only one HTTP port per service — a bare TCP
protocol that isn't HTTP has nothing to attach to at the edge.

WebSocket is the standard fix for exactly this: the connection *starts*
as a normal HTTP GET request carrying an `Upgrade: websocket` header, so
it passes straight through the same HTTP-terminating proxy every other
service in this app already goes through, then upgrades in place to a
persistent full-duplex socket — the same read/write shape as before, just
reachable from the public internet. `server.py` implements this with
Python's `websockets` library.

Alongside that, the concurrency model changed from thread-per-client to
**event-driven I/O via `asyncio`**: a single thread runs one event loop,
and every connection is a coroutine on it. `await websocket.recv()` looks
like a blocking call but only suspends that one coroutine — the loop is
free to run every other client's coroutine while it waits. This is the
`select`/`poll`/`epoll`-style model the threading notes below predicted
would eventually be needed, implemented here via `asyncio` instead of a
raw event loop. It also sidesteps the `threading.Lock` bookkeeping the
threaded version needed for the shared `rooms` dict, since only one
coroutine ever actually executes at a time — no true parallelism, no race
condition on that dict.

The room/broadcast/disconnect-cleanup protocol itself — ask for a
username, ask for a room, then relay every line to everyone else in that
room, cleaning up on disconnect — is unchanged between both versions.

## Sockets (raw-TCP version, still accurate background)

A socket is an endpoint for network communication, uniquely identified by
an **IP address + port** pair, bound to a transport protocol (TCP or UDP).
This server uses `SOCK_STREAM` (TCP) sockets for reliable, ordered,
connection-oriented delivery — appropriate for chat, where message loss or
reordering would be confusing.

The server-side socket lifecycle used here:

1. `socket()` — create the socket.
2. `setsockopt(SO_REUSEADDR)` — allow immediately rebinding the port after
   a restart, instead of waiting out the OS's TIME_WAIT state.
3. `bind()` — attach the socket to `0.0.0.0:5000` (all interfaces, so it's
   reachable both from other containers and from the host).
4. `listen()` — mark it passive and queue up to 5 pending connections.
5. `accept()` — blocks until a client connects, then returns a **new**
   socket dedicated to that one client (the original listening socket
   keeps accepting others).

The client side only needs `socket()` + `connect()` before it can
`send()`/`recv()`.

## Threading

`accept()`, `recv()`, and `send()` are all **blocking** calls — the thread
that calls them suspends until the operation completes. If the server
handled every client on a single thread, one slow or silent client would
freeze the whole server (no new connections accepted, no messages
delivered to anyone else).

The fix used here is the **thread-per-client** model: the main thread's
only job is looping on `accept()`; each time a client connects, it spawns
a dedicated `daemon` thread to run `handle_client()` for that one
connection. A blocking `recv()` in one client's thread only blocks that
thread — every other client keeps being served normally.

Shared state (`self.clients`, `self.rooms`) is written from multiple
threads concurrently, so all reads/writes to it go through a
`threading.Lock` to avoid race conditions (e.g. two threads mutating the
same room's socket set at once).

This is the simplest concurrency model, appropriate for a small number of
connections. It doesn't scale to tens of thousands of clients — that's
where event-driven I/O (`select`/`poll`/`epoll`) or an async framework
would take over, since one thread per client gets expensive in memory and
context-switching overhead well before then.

## REST

This particular server is deliberately **not** a REST API — it's a raw
TCP socket server, chosen specifically to show what a REST framework
(Express, Flask, FastAPI, ...) is built on top of: an HTTP server is just
a TCP server that speaks a specific text-based protocol (HTTP) over the
socket, and a REST API is a set of conventions (resource-oriented URLs,
standard verbs, stateless requests, status codes) layered on top of that.

The rest of this repo's services (gateway, auth-service,
attractions-service, etc.) are exactly that: Express/TypeScript REST APIs
running over the same underlying TCP sockets this chat server uses
directly.
