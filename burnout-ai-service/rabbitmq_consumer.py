"""
RabbitMQ Consumer for Burnout Alerts
Listens for alert events and triggers proactive wellness messages.
"""

import asyncio
import aio_pika
import json
from typing import Optional
import httpx


class AlertConsumer:
    """
    Async RabbitMQ consumer for burnout alerts.
    Triggers proactive AI messages when alerts fire.
    """

    def __init__(
        self,
        rabbitmq_url: str = "amqp://guest:guest@localhost:5672/",
        queue_name: str = "burnout_alerts",
        ai_service_url: str = "http://localhost:8001",
        spring_boot_url: str = "http://localhost:8080",
        counselor_jwt: Optional[str] = None,
    ):
        self.rabbitmq_url = rabbitmq_url
        self.queue_name = queue_name
        self.ai_service_url = ai_service_url
        self.spring_boot_url = spring_boot_url
        self.counselor_jwt = counselor_jwt
        self._connection: Optional[aio_pika.Connection] = None
        self._channel: Optional[aio_pika.Channel] = None
        self._queue: Optional[aio_pika.Queue] = None
        self._running = False

    async def connect(self):
        """Connect to RabbitMQ"""
        try:
            self._connection = await aio_pika.connect_robust(self.rabbitmq_url)
            self._channel = await self._connection.channel()
            
            # Declare queue
            self._queue = await self._channel.declare_queue(
                self.queue_name,
                durable=True,
            )
            
            print(f"[AlertConsumer] Connected to RabbitMQ, queue: {self.queue_name}")
            return True
        except Exception as e:
            print(f"[AlertConsumer] Connection failed: {e}")
            return False

    async def disconnect(self):
        """Disconnect from RabbitMQ"""
        self._running = False
        if self._connection:
            await self._connection.close()
        print("[AlertConsumer] Disconnected")

    async def _process_alert(self, alert_data: dict):
        """Process a single alert message"""
        print(f"[AlertConsumer] Processing alert: {alert_data.get('alert_id')}")

        try:
            # Call AI service to generate proactive message
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.ai_service_url}/api/agent/process-alert",
                    json=alert_data,
                    headers={
                        "Authorization": f"Bearer {self.counselor_jwt}",
                        "Content-Type": "application/json",
                    },
                    timeout=30.0,
                )
                
                if response.status_code in (200, 201):
                    result = response.json()
                    print(f"[AlertConsumer] Generated message for {alert_data.get('user_id')}")
                else:
                    print(f"[AlertConsumer] AI service error: {response.status_code}")
                    
        except httpx.ConnectError:
            print("[AlertConsumer] AI service unavailable")
        except Exception as e:
            print(f"[AlertConsumer] Error processing alert: {e}")

    async def _on_message(self, message: aio_pika.IncomingMessage):
        """Handle incoming message"""
        async with message.process():
            try:
                body = message.body.decode()
                alert_data = json.loads(body)
                await self._process_alert(alert_data)
            except json.JSONDecodeError:
                print(f"[AlertConsumer] Invalid JSON: {message.body}")
            except Exception as e:
                print(f"[AlertConsumer] Error: {e}")

    async def start_consuming(self):
        """Start consuming messages"""
        if not self._queue:
            print("[AlertConsumer] Not connected")
            return

        self._running = True
        print(f"[AlertConsumer] Starting to consume from {self.queue_name}")

        await self._queue.consume(self._on_message)

        # Keep running
        while self._running:
            await asyncio.sleep(1)

    async def run(self):
        """Main run loop with reconnection"""
        while True:
            if await self.connect():
                try:
                    await self.start_consuming()
                except Exception as e:
                    print(f"[AlertConsumer] Consumer error: {e}")
            
            if not self._running:
                break
                
            # Reconnect after delay
            print("[AlertConsumer] Reconnecting in 5 seconds...")
            await asyncio.sleep(5)


async def main():
    """Run the consumer"""
    import os
    
    consumer = AlertConsumer(
        rabbitmq_url=os.getenv("RABBITMQ_URL", "amqp://guest:guest@localhost:5672/"),
        queue_name=os.getenv("ALERT_QUEUE", "burnout_alerts"),
        ai_service_url=os.getenv("AI_SERVICE_URL", "http://localhost:8001"),
        spring_boot_url=os.getenv("SPRING_BOOT_URL", "http://localhost:8080"),
        counselor_jwt=os.getenv("COUNSELOR_JWT"),  # Should be set by backend
    )
    
    try:
        await consumer.run()
    except KeyboardInterrupt:
        print("\n[AlertConsumer] Stopping...")
        await consumer.disconnect()


if __name__ == "__main__":
    asyncio.run(main())
