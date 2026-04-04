import httpx
from typing import Optional


async def get_burnout_score(
    jwt_token: Optional[str] = None,
    spring_boot_url: str = "http://localhost:8080",
    context_data: Optional[dict] = None,
) -> dict:
    """
    Fetch current burnout score from Spring Boot backend.
    Returns score, risk level, and trend.
    """
    headers = {}
    if jwt_token:
        headers["Authorization"] = f"Bearer {jwt_token}"
    headers["Content-Type"] = "application/json"

    async with httpx.AsyncClient() as client:
        try:
            resp = await client.get(
                f"{spring_boot_url}/api/burnout/latest",
                headers=headers,
                timeout=5.0,
            )
            if resp.status_code == 200:
                data = resp.json()
                return {
                    "success": True,
                    "score": data.get("score"),
                    "risk_level": data.get("riskLevel"),
                    "method": data.get("calculationMethod"),
                    "timestamp": data.get("createdAt"),
                }
            return {"success": False, "error": f"HTTP {resp.status_code}"}
        except httpx.ConnectError:
            # Return cached data from context if available
            if context_data and "burnout_score" in context_data:
                cached = context_data["burnout_score"]
                return {
                    "success": True,
                    "score": cached.get("score"),
                    "risk_level": cached.get("riskLevel"),
                    "method": cached.get("calculationMethod"),
                    "timestamp": cached.get("createdAt"),
                    "source": "cached",
                }
            return {"success": False, "error": "Backend unavailable"}
        except Exception as e:
            return {"success": False, "error": str(e)}
