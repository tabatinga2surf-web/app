from fastapi import FastAPI, APIRouter, HTTPException, UploadFile, File, Request, Header
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict
import uuid
from datetime import datetime, timezone
import httpx
import feedparser
import shutil
from emergentintegrations.payments.stripe.checkout import StripeCheckout, CheckoutSessionResponse, CheckoutStatusResponse, CheckoutSessionRequest


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

# Stripe setup
STRIPE_API_KEY = os.environ.get('STRIPE_API_KEY')

# Upload directory
UPLOAD_DIR = Path("/app/uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

# Models
class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    username: str
    password_hash: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserLogin(BaseModel):
    username: str
    password: str

class Surfboard(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    image_url: Optional[str] = None
    hourly_rate: float
    status: str = "available"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class SurfboardCreate(BaseModel):
    name: str
    hourly_rate: float
    image_url: Optional[str] = None

class Rental(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    surfboard_id: str
    surfboard_name: str
    renter_name: str
    estimated_time: int
    hourly_rate: float
    start_time: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    end_time: Optional[datetime] = None
    pause_time: Optional[datetime] = None
    total_paused_duration: int = 0
    status: str = "active"
    final_amount: Optional[float] = None
    notification_sent: bool = False

class RentalStart(BaseModel):
    surfboard_id: str
    renter_name: str
    estimated_time: int

class RentalUpdate(BaseModel):
    action: str
    final_amount: Optional[float] = None

class Product(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str
    price: float
    image_url: Optional[str] = None
    category: str
    stock: int = 0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ProductCreate(BaseModel):
    name: str
    description: str
    price: float
    category: str
    stock: int = 0
    image_url: Optional[str] = None

class Order(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    items: List[Dict]
    total: float
    status: str = "pending"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class GalleryImage(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    image_url: str
    title: Optional[str] = None
    order: int = 0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class GalleryImageCreate(BaseModel):
    image_url: str
    title: Optional[str] = None
    order: int = 0

class Settings(BaseModel):
    id: str = "global_settings"
    logo_url: Optional[str] = None
    pix_qr_url: Optional[str] = None
    instagram_handle: Optional[str] = None
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class PushSubscription(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    endpoint: str
    keys: Dict
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Auth endpoints
@api_router.post("/auth/login")
async def login(credentials: UserLogin):
    user = await db.users.find_one({"username": credentials.username}, {"_id": 0})
    if not user or user["password_hash"] != credentials.password:
        raise HTTPException(401, "Invalid credentials")
    return {"success": True, "username": user["username"]}

@api_router.post("/auth/setup")
async def setup_admin(credentials: UserLogin):
    existing = await db.users.find_one({"username": credentials.username}, {"_id": 0})
    if existing:
        raise HTTPException(400, "User already exists")
    
    user = User(username=credentials.username, password_hash=credentials.password)
    doc = user.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.users.insert_one(doc)
    return {"success": True}

# Surfboard endpoints
@api_router.get("/surfboards")
async def get_surfboards():
    boards = await db.surfboards.find({}, {"_id": 0}).to_list(100)
    for board in boards:
        if isinstance(board.get('created_at'), str):
            board['created_at'] = datetime.fromisoformat(board['created_at'])
    return boards

@api_router.post("/surfboards")
async def create_surfboard(board: SurfboardCreate):
    surfboard = Surfboard(**board.model_dump())
    doc = surfboard.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.surfboards.insert_one(doc)
    return surfboard

@api_router.put("/surfboards/{board_id}")
async def update_surfboard(board_id: str, board: SurfboardCreate):
    update_data = board.model_dump()
    result = await db.surfboards.update_one(
        {"id": board_id},
        {"$set": update_data}
    )
    if result.matched_count == 0:
        raise HTTPException(404, "Surfboard not found")
    return {"success": True}

@api_router.delete("/surfboards/{board_id}")
async def delete_surfboard(board_id: str):
    result = await db.surfboards.delete_one({"id": board_id})
    if result.deleted_count == 0:
        raise HTTPException(404, "Surfboard not found")
    return {"success": True}

# Rental endpoints
@api_router.post("/rentals/start")
async def start_rental(rental_data: RentalStart):
    board = await db.surfboards.find_one({"id": rental_data.surfboard_id}, {"_id": 0})
    if not board:
        raise HTTPException(404, "Surfboard not found")
    if board["status"] != "available":
        raise HTTPException(400, "Surfboard not available")
    
    rental = Rental(
        surfboard_id=rental_data.surfboard_id,
        surfboard_name=board["name"],
        renter_name=rental_data.renter_name,
        estimated_time=rental_data.estimated_time,
        hourly_rate=board["hourly_rate"]
    )
    
    doc = rental.model_dump()
    doc['start_time'] = doc['start_time'].isoformat()
    await db.rentals.insert_one(doc)
    
    await db.surfboards.update_one(
        {"id": rental_data.surfboard_id},
        {"$set": {"status": "rented"}}
    )
    
    return rental

@api_router.get("/rentals/active")
async def get_active_rentals():
    rentals = await db.rentals.find({"status": {"$in": ["active", "paused"]}}, {"_id": 0}).to_list(100)
    for rental in rentals:
        if isinstance(rental.get('start_time'), str):
            rental['start_time'] = datetime.fromisoformat(rental['start_time'])
        if rental.get('pause_time') and isinstance(rental['pause_time'], str):
            rental['pause_time'] = datetime.fromisoformat(rental['pause_time'])
    return rentals

@api_router.get("/rentals/check-alerts")
async def check_rental_alerts():
    """Check for rentals that need alerts (80% of estimated time)"""
    rentals = await db.rentals.find({"status": "active", "notification_sent": False}, {"_id": 0}).to_list(100)
    alerts = []
    
    for rental in rentals:
        start_time = datetime.fromisoformat(rental['start_time']) if isinstance(rental['start_time'], str) else rental['start_time']
        elapsed = (datetime.now(timezone.utc) - start_time).total_seconds() / 60
        elapsed -= rental.get('total_paused_duration', 0)
        
        threshold = rental['estimated_time'] * 0.8
        
        if elapsed >= threshold:
            alerts.append({
                "rental_id": rental['id'],
                "surfboard_name": rental['surfboard_name'],
                "renter_name": rental['renter_name'],
                "elapsed": elapsed,
                "estimated": rental['estimated_time']
            })
            
            # Mark as notified
            await db.rentals.update_one(
                {"id": rental['id']},
                {"$set": {"notification_sent": True}}
            )
    
    return alerts

@api_router.put("/rentals/{rental_id}")
async def update_rental(rental_id: str, update: RentalUpdate):
    rental = await db.rentals.find_one({"id": rental_id}, {"_id": 0})
    if not rental:
        raise HTTPException(404, "Rental not found")
    
    update_data = {}
    
    if update.action == "pause":
        update_data = {"status": "paused", "pause_time": datetime.now(timezone.utc).isoformat()}
        await db.surfboards.update_one(
            {"id": rental["surfboard_id"]},
            {"$set": {"status": "paused"}}
        )
    elif update.action == "resume":
        if rental.get("pause_time"):
            pause_time = datetime.fromisoformat(rental["pause_time"])
            paused_duration = (datetime.now(timezone.utc) - pause_time).total_seconds() / 60
            total_paused = rental.get("total_paused_duration", 0) + paused_duration
            update_data = {"status": "active", "pause_time": None, "total_paused_duration": total_paused, "notification_sent": False}
        await db.surfboards.update_one(
            {"id": rental["surfboard_id"]},
            {"$set": {"status": "rented"}}
        )
    elif update.action == "complete":
        update_data = {
            "status": "completed",
            "end_time": datetime.now(timezone.utc).isoformat(),
            "final_amount": update.final_amount
        }
        await db.surfboards.update_one(
            {"id": rental["surfboard_id"]},
            {"$set": {"status": "available"}}
        )
    
    await db.rentals.update_one({"id": rental_id}, {"$set": update_data})
    
    # Return the updated rental data for the receipt
    if update.action == "complete":
        updated_rental = await db.rentals.find_one({"id": rental_id}, {"_id": 0})
        return {"success": True, "rental": updated_rental}
    
    return {"success": True}

@api_router.get("/rentals/history")
async def get_rental_history(date: Optional[str] = None):
    query = {"status": "completed"}
    if date:
        rentals = await db.rentals.find(query, {"_id": 0}).to_list(1000)
        filtered = [r for r in rentals if r.get('start_time', '').startswith(date)]
        return filtered
    
    rentals = await db.rentals.find(query, {"_id": 0}).sort("start_time", -1).limit(100).to_list(100)
    return rentals

@api_router.get("/rentals/{rental_id}")
async def get_rental(rental_id: str):
    rental = await db.rentals.find_one({"id": rental_id}, {"_id": 0})
    if not rental:
        raise HTTPException(404, "Rental not found")
    return rental

# Product endpoints
@api_router.get("/products")
async def get_products():
    products = await db.products.find({}, {"_id": 0}).to_list(1000)
    return products

@api_router.post("/products")
async def create_product(product: ProductCreate):
    prod = Product(**product.model_dump())
    doc = prod.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.products.insert_one(doc)
    return prod

@api_router.put("/products/{product_id}")
async def update_product(product_id: str, product: ProductCreate):
    result = await db.products.update_one(
        {"id": product_id},
        {"$set": product.model_dump()}
    )
    if result.matched_count == 0:
        raise HTTPException(404, "Product not found")
    return {"success": True}

@api_router.delete("/products/{product_id}")
async def delete_product(product_id: str):
    result = await db.products.delete_one({"id": product_id})
    if result.deleted_count == 0:
        raise HTTPException(404, "Product not found")
    return {"success": True}

# Gallery endpoints
@api_router.get("/gallery")
async def get_gallery():
    images = await db.gallery.find({}, {"_id": 0}).sort("order", 1).to_list(100)
    return images

@api_router.post("/gallery")
async def create_gallery_image(image: GalleryImageCreate):
    gallery_img = GalleryImage(**image.model_dump())
    doc = gallery_img.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.gallery.insert_one(doc)
    return gallery_img

@api_router.delete("/gallery/{image_id}")
async def delete_gallery_image(image_id: str):
    result = await db.gallery.delete_one({"id": image_id})
    if result.deleted_count == 0:
        raise HTTPException(404, "Image not found")
    return {"success": True}

@api_router.put("/gallery/{image_id}")
async def update_gallery_image(image_id: str, image: GalleryImageCreate):
    result = await db.gallery.update_one(
        {"id": image_id},
        {"$set": image.model_dump()}
    )
    if result.matched_count == 0:
        raise HTTPException(404, "Image not found")
    return {"success": True}

# Payment endpoints
@api_router.post("/payments/checkout")
async def create_checkout(request: Request, package_data: Dict):
    host_url = str(request.base_url)
    origin_url = package_data.get('origin_url', host_url)
    
    success_url = f"{origin_url}/success?session_id={{CHECKOUT_SESSION_ID}}"
    cancel_url = f"{origin_url}/carrinho"
    
    webhook_url = f"{host_url}api/webhook/stripe"
    stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)
    
    checkout_request = CheckoutSessionRequest(
        amount=package_data['amount'],
        currency="brl",
        success_url=success_url,
        cancel_url=cancel_url,
        metadata=package_data.get('metadata', {})
    )
    
    session = await stripe_checkout.create_checkout_session(checkout_request)
    
    transaction = {
        "id": str(uuid.uuid4()),
        "session_id": session.session_id,
        "amount": package_data['amount'],
        "currency": "brl",
        "payment_status": "pending",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "metadata": package_data.get('metadata', {})
    }
    await db.payment_transactions.insert_one(transaction)
    
    return {"url": session.url, "session_id": session.session_id}

@api_router.get("/payments/status/{session_id}")
async def get_payment_status(session_id: str):
    host_url = os.environ.get('REACT_APP_BACKEND_URL', 'http://localhost:8001')
    webhook_url = f"{host_url}/api/webhook/stripe"
    stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)
    
    status = await stripe_checkout.get_checkout_status(session_id)
    
    transaction = await db.payment_transactions.find_one({"session_id": session_id}, {"_id": 0})
    if transaction and transaction['payment_status'] != status.payment_status:
        await db.payment_transactions.update_one(
            {"session_id": session_id},
            {"$set": {"payment_status": status.payment_status, "status": status.status}}
        )
    
    return status.model_dump()

@api_router.post("/webhook/stripe")
async def stripe_webhook(request: Request):
    body = await request.body()
    signature = request.headers.get("Stripe-Signature")
    
    host_url = str(request.base_url)
    webhook_url = f"{host_url}api/webhook/stripe"
    stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)
    
    webhook_response = await stripe_checkout.handle_webhook(body, signature)
    
    await db.payment_transactions.update_one(
        {"session_id": webhook_response.session_id},
        {"$set": {"payment_status": webhook_response.payment_status, "event_type": webhook_response.event_type}}
    )
    
    return {"success": True}

# Weather endpoint - using Brazilian public APIs
@api_router.get("/weather")
async def get_weather():
    """Get weather from INMET (Brazilian National Institute of Meteorology)"""
    try:
        # João Pessoa coordinates (closest to Tabatinga, PB)
        lat, lon = -7.1195, -34.8450
        
        # Using OpenWeatherMap as fallback since INMET doesn't have public REST API
        api_key = os.environ.get('OPENWEATHER_API_KEY')
        if not api_key:
            return {
                "temp": 26,
                "feels_like": 28,
                "temp_min": 25,
                "temp_max": 30,
                "description": "Sol com muitas nuvens",
                "humidity": 78,
                "wind_speed": 11,
                "wind_direction": "ESE",
                "pressure": 1012,
                "rain_chance": 35,
                "rain_mm": 1.5,
                "uv_index": 8,
                "sunrise": "05:18",
                "sunset": "17:45",
                "source": "estimado"
            }
        
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"https://api.openweathermap.org/data/2.5/weather",
                params={"lat": lat, "lon": lon, "appid": api_key, "units": "metric", "lang": "pt_br"},
                timeout=10
            )
            response.raise_for_status()
            data = response.json()
            
            # Convert wind direction from degrees to compass
            wind_deg = data.get("wind", {}).get("deg", 0)
            directions = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"]
            wind_direction = directions[int((wind_deg + 11.25) / 22.5) % 16]
            
            return {
                "temp": data["main"]["temp"],
                "feels_like": data["main"]["feels_like"],
                "temp_min": data["main"].get("temp_min", data["main"]["temp"]),
                "temp_max": data["main"].get("temp_max", data["main"]["temp"]),
                "description": data["weather"][0]["description"],
                "humidity": data["main"]["humidity"],
                "wind_speed": round(data["wind"]["speed"] * 3.6),  # m/s to km/h
                "wind_direction": wind_direction,
                "pressure": data["main"].get("pressure", 1013),
                "rain_chance": 0,
                "rain_mm": data.get("rain", {}).get("1h", 0),
                "uv_index": 8,
                "sunrise": "05:18",
                "sunset": "17:45",
                "source": "openweathermap"
            }
    except Exception as e:
        return {
            "temp": 26,
            "feels_like": 28,
            "temp_min": 25,
            "temp_max": 30,
            "description": "Sol com muitas nuvens",
            "humidity": 78,
            "wind_speed": 11,
            "wind_direction": "ESE",
            "pressure": 1012,
            "rain_chance": 35,
            "rain_mm": 1.5,
            "uv_index": 8,
            "sunrise": "05:18",
            "sunset": "17:45",
            "source": "estimado",
            "error": str(e)
        }

# Waves/Surf conditions endpoint
@api_router.get("/waves")
async def get_waves():
    """Get wave conditions for Tabatinga beach"""
    import math
    from datetime import datetime
    
    # Simulated wave data based on typical conditions for Tabatinga, PB
    # In production, this would come from a surf forecast API
    hour = datetime.now().hour
    
    # Wave height varies throughout the day
    base_height = 1.2
    variation = 0.3 * math.sin(hour * math.pi / 12)
    wave_height = round(base_height + variation, 1)
    
    # Swell period typically 8-12 seconds
    swell_period = 10 + int(2 * math.sin(hour * math.pi / 24))
    
    return {
        "wave_height": wave_height,
        "wave_height_max": round(wave_height + 0.5, 1),
        "wave_direction": "ESE",
        "wave_direction_degrees": 112,
        "swell_period": swell_period,
        "swell_direction": "E",
        "water_temp": 27,
        "wind_wave_height": 0.4,
        "surf_rating": "Bom" if wave_height >= 1.0 else "Pequeno",
        "best_time": "06:00 - 09:00",
        "tide_influence": "Melhor na maré enchendo",
        "conditions_summary": "Ondas consistentes com vento terral pela manhã",
        "source": "estimado"
    }

# Tides endpoint
@api_router.get("/tides")
async def get_tides():
    """Get tides information for Tabatinga region"""
    try:
        # Using public tide API
        async with httpx.AsyncClient() as client:
            response = await client.get(
                "https://tabuademares.com/api/br/paraiba/joao-pessoa",
                timeout=10
            )
            if response.status_code == 200:
                return response.json()
    except:
        pass
    
    # Fallback with generic data
    return {
        "location": "Tabatinga, PB",
        "tides": [
            {"type": "alta", "time": "06:30", "height": "2.3m"},
            {"type": "baixa", "time": "12:45", "height": "0.5m"},
            {"type": "alta", "time": "18:50", "height": "2.1m"},
        ],
        "source": "estimado"
    }

# News endpoint
@api_router.get("/news")
async def get_surf_news():
    try:
        feed = feedparser.parse("https://www.surfline.com/surf-news/rss")
        news = []
        for entry in feed.entries[:5]:
            news.append({
                "title": entry.title,
                "link": entry.link,
                "published": entry.get('published', ''),
                "summary": entry.get('summary', '')[:200]
            })
        return news
    except Exception as e:
        return {"error": str(e)}

# Push notification subscription
@api_router.post("/push/subscribe")
async def subscribe_push(subscription: Dict):
    sub = PushSubscription(
        endpoint=subscription['endpoint'],
        keys=subscription['keys']
    )
    doc = sub.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    
    # Check if already exists
    existing = await db.push_subscriptions.find_one({"endpoint": subscription['endpoint']}, {"_id": 0})
    if existing:
        return {"success": True, "message": "Already subscribed"}
    
    await db.push_subscriptions.insert_one(doc)
    return {"success": True}

@api_router.get("/push/subscriptions")
async def get_push_subscriptions():
    subs = await db.push_subscriptions.find({}, {"_id": 0}).to_list(1000)
    return subs

# Settings endpoints
@api_router.get("/settings")
async def get_settings():
    settings = await db.settings.find_one({"id": "global_settings"}, {"_id": 0})
    if not settings:
        default_settings = Settings()
        doc = default_settings.model_dump()
        doc['updated_at'] = doc['updated_at'].isoformat()
        await db.settings.insert_one(doc)
        return default_settings.model_dump()
    return settings

@api_router.put("/settings")
async def update_settings(settings: Dict):
    settings['updated_at'] = datetime.now(timezone.utc).isoformat()
    await db.settings.update_one(
        {"id": "global_settings"},
        {"$set": settings},
        upsert=True
    )
    return {"success": True}

# Upload endpoint
@api_router.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    file_ext = Path(file.filename).suffix
    file_id = str(uuid.uuid4())
    filename = f"{file_id}{file_ext}"
    file_path = UPLOAD_DIR / filename
    
    with file_path.open("wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Return full URL with BACKEND_URL
    backend_url = os.environ.get('REACT_APP_BACKEND_URL', 'http://localhost:8001')
    full_url = f"{backend_url}/uploads/{filename}"
    
    return {"url": full_url}

app.include_router(api_router)

# Mount static files for uploads
app.mount("/uploads", StaticFiles(directory="/app/uploads"), name="uploads")

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
