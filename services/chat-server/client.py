"""Minimal WebSocket chat client for testing the chat server locally.

Usage:
    python client.py [ws_url]

Defaults to ws://localhost:5000. Against the deployed Render service, pass
the wss:// URL instead, e.g.:
    python client.py wss://visit-yaounde-chat.onrender.com

Browser-based / CLI alternatives that work just as well: `wscat -c <url>`,
or any WebSocket-capable REST client.
"""

import asyncio
import sys

import websockets


async def receive_messages(ws: websockets.asyncio.client.ClientConnection) -> None:
    try:
        async for message in ws:
            print(message)
    except websockets.exceptions.ConnectionClosed:
        print("[DISCONNECTED] Server closed the connection.")


async def main() -> None:
    url = sys.argv[1] if len(sys.argv) > 1 else "ws://localhost:5000"

    async with websockets.connect(url) as ws:
        receiver = asyncio.create_task(receive_messages(ws))
        loop = asyncio.get_running_loop()
        try:
            while True:
                line = await loop.run_in_executor(None, input)
                await ws.send(line)
        except (KeyboardInterrupt, EOFError):
            pass
        finally:
            receiver.cancel()


if __name__ == "__main__":
    asyncio.run(main())
