from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import requests
import json

# Database setup
SQLALCHEMY_DATABASE_URL = "sqlite:///./travel_app.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Database Models
class Place(Base):
    __tablename__ = "places"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    category = Column(String)
    rating = Column(Float)
    description = Column(Text)
    location = Column(String)
    latitude = Column(Float)
    longitude = Column(Float)
    reviews_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

class Trip(Base):
    __tablename__ = "trips"
    
    id = Column(Integer, primary_key=True, index=True)
    trip_number = Column(String, unique=True, index=True)
    origin = Column(String)
    destination = Column(String)
    departure_time = Column(String)
    mode = Column(String)
    travel_plan = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

class BusRoute(Base):
    __tablename__ = "bus_routes"
    
    id = Column(Integer, primary_key=True, index=True)
    route_name = Column(String)
    departure_time = Column(String)
    duration = Column(String)
    fare = Column(String)
    operator = Column(String, default="KSRTC")
    reviews = Column(Text)
    rating = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)

class Review(Base):
    __tablename__ = "reviews"
    
    id = Column(Integer, primary_key=True, index=True)
    place_id = Column(Integer)
    user_name = Column(String)
    rating = Column(Float)
    comment = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

# Create tables
Base.metadata.create_all(bind=engine)

# Pydantic models for API
class PlaceCreate(BaseModel):
    name: str
    category: str
    rating: float
    description: str
    location: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class PlaceResponse(BaseModel):
    id: int
    name: str
    category: str
    rating: float
    description: str
    location: str
    reviews_count: int
    
    class Config:
        orm_mode = True

class TripCreate(BaseModel):
    origin: str
    destination: str
    departure_time: str
    mode: str

class TripResponse(BaseModel):
    id: int
    trip_number: str
    origin: str
    destination: str
    departure_time: str
    mode: str
    travel_plan: Optional[str] = None
    
    class Config:
        orm_mode = True

class BusRouteCreate(BaseModel):
    route_name: str
    departure_time: str
    duration: str
    fare: str
    operator: str = "KSRTC"

class BusRouteResponse(BaseModel):
    id: int
    route_name: str
    departure_time: str
    duration: str
    fare: str
    operator: str
    rating: float
    
    class Config:
        orm_mode = True

class ReviewCreate(BaseModel):
    place_id: int
    user_name: str
    rating: float
    comment: str

# FastAPI app
app = FastAPI(title="Travel Suggester API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Travel plan generator
def generate_travel_plan(origin: str, destination: str, departure_time: str, mode: str) -> str:
    """
    Generate a detailed travel plan based on the given parameters.
    In a real implementation, this would integrate with mapping services and transport APIs.
    """
    if mode == "bus":
        if "sulthan bathery" in origin.lower() and "iiit kottayam" in destination.lower():
            return """
            1. Take KSRTC bus from Sulthan Bathery to Pala Kottaramattom bus stand
            2. Journey time: 10h 30m, Arrival: 5:30 AM next day (Fare: ₹280)
            3. From Pala, you have two options:
               Option A: Take auto directly to IIIT Kottayam, Nechipuzhoor (₹50-80)
               Option B: Wait till 7:15 AM for bus to Ramapuram via Nechipuzhoor (₹15)
            4. If choosing Option B: Get down at Nechipuzhoor and take auto to IIIT Kottayam (₹30-50)
            5. Total journey time: 11-12 hours
            6. Estimated total cost: ₹310-360
            """
    
    # Generic travel plan for other routes
    return f"""
    Travel Plan from {origin} to {destination}:
    1. Departure: {departure_time} via {mode}
    2. Check local transport options and timings
    3. Consider booking tickets in advance for better rates
    4. Keep alternative routes ready in case of delays
    5. Carry necessary identification and travel documents
    """

# API Routes

@app.get("/")
def read_root():
    return {"message": "Travel Suggester API is running"}

# Places endpoints
@app.post("/places/", response_model=PlaceResponse)
def create_place(place: PlaceCreate, db: Session = Depends(get_db)):
    db_place = Place(**place.dict())
    db.add(db_place)
    db.commit()
    db.refresh(db_place)
    return db_place

@app.get("/places/", response_model=List[PlaceResponse])
def get_places(skip: int = 0, limit: int = 100, category: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(Place)
    if category:
        query = query.filter(Place.category == category)
    places = query.offset(skip).limit(limit).all()
    return places

@app.get("/places/nearby")
def get_nearby_places(lat: float, lng: float, radius: float = 5.0, db: Session = Depends(get_db)):
    """
    Get places within a specified radius (in km) of given coordinates.
    In a real implementation, this would use spatial queries.
    """
    # Simplified implementation - in production, use proper spatial queries
    places = db.query(Place).all()
    nearby_places = []
    
    for place in places:
        if place.latitude and place.longitude:
            # Simple distance calculation (not accurate for production)
            distance = ((place.latitude - lat) ** 2 + (place.longitude - lng) ** 2) ** 0.5
            if distance <= radius / 111:  # Rough conversion to degrees
                nearby_places.append(place)
    
    return nearby_places[:20]  # Return max 20 places

@app.get("/places/search")
def search_places(q: str, db: Session = Depends(get_db)):
    places = db.query(Place).filter(Place.name.contains(q)).limit(20).all()
    return places

# Trips endpoints
@app.post("/trips/", response_model=TripResponse)
def create_trip(trip: TripCreate, db: Session = Depends(get_db)):
    # Generate unique trip number
    trip_number = f"TRIP{int(datetime.utcnow().timestamp())}"
    
    # Generate travel plan
    travel_plan = generate_travel_plan(
        trip.origin, trip.destination, trip.departure_time, trip.mode
    )
    
    db_trip = Trip(
        trip_number=trip_number,
        origin=trip.origin,
        destination=trip.destination,
        departure_time=trip.departure_time,
        mode=trip.mode,
        travel_plan=travel_plan
    )
    
    db.add(db_trip)
    db.commit()
    db.refresh(db_trip)
    return db_trip

@app.get("/trips/{trip_number}", response_model=TripResponse)
def get_trip(trip_number: str, db: Session = Depends(get_db)):
    trip = db.query(Trip).filter(Trip.trip_number == trip_number).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    return trip

@app.get("/trips/", response_model=List[TripResponse])
def get_trips(skip: int = 0, limit: int = 50, db: Session = Depends(get_db)):
    trips = db.query(Trip).offset(skip).limit(limit).all()
    return trips

# Bus routes endpoints
@app.post("/bus-routes/", response_model=BusRouteResponse)
def create_bus_route(bus_route: BusRouteCreate, db: Session = Depends(get_db)):
    db_bus_route = BusRoute(**bus_route.dict())
    db.add(db_bus_route)
    db.commit()
    db.refresh(db_bus_route)
    return db_bus_route

@app.get("/bus-routes/", response_model=List[BusRouteResponse])
def get_bus_routes(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    bus_routes = db.query(BusRoute).offset(skip).limit(limit).all()
    return bus_routes

@app.get("/bus-routes/search")
def search_bus_routes(origin: str, destination: str, db: Session = Depends(get_db)):
    """Search for bus routes between two locations"""
    routes = db.query(BusRoute).filter(
        BusRoute.route_name.contains(origin) | 
        BusRoute.route_name.contains(destination)
    ).all()
    return routes

@app.get("/bus-routes/nearby")
def get_nearby_bus_routes(location: str, db: Session = Depends(get_db)):
    """Get bus routes that pass through or near a location"""
    routes = db.query(BusRoute).filter(
        BusRoute.route_name.contains(location)
    ).limit(20).all()
    return routes

# Reviews endpoints
@app.post("/reviews/")
def create_review(review: ReviewCreate, db: Session = Depends(get_db)):
    db_review = Review(**review.dict())
    db.add(db_review)
    db.commit()
    
    # Update place rating and review count
    place = db.query(Place).filter(Place.id == review.place_id).first()
    if place:
        reviews = db.query(Review).filter(Review.place_id == review.place_id).all()
        avg_rating = sum(r.rating for r in reviews) / len(reviews)
        place.rating = round(avg_rating, 1)
        place.reviews_count = len(reviews)
        db.commit()
    
    return {"message": "Review created successfully"}

@app.get("/reviews/place/{place_id}")
def get_place_reviews(place_id: int, db: Session = Depends(get_db)):
    reviews = db.query(Review).filter(Review.place_id == place_id).all()
    return reviews

# Additional utility endpoints
@app.get("/stats")
def get_app_stats(db: Session = Depends(get_db)):
    """Get application statistics"""
    total_places = db.query(Place).count()
    total_trips = db.query(Trip).count()
    total_bus_routes = db.query(BusRoute).count()
    total_reviews = db.query(Review).count()
    
    return {
        "total_places": total_places,
        "total_trips": total_trips,
        "total_bus_routes": total_bus_routes,
        "total_reviews": total_reviews
    }

@app.get("/popular-destinations")
def get_popular_destinations(db: Session = Depends(get_db)):
    """Get most popular destinations based on trip data"""
    # This would be more sophisticated in a real implementation
    popular_places = db.query(Place).filter(Place.rating >= 4.5).limit(10).all()
    return popular_places

# Seed data endpoint (for development)
@app.post("/seed-data")
def seed_database(db: Session = Depends(get_db)):
    """Seed the database with sample data"""
    
    # Sample places
    sample_places = [
        Place(
            name="Wayanad Tea Gardens",
            category="nature",
            rating=4.8,
            description="Beautiful tea plantations with scenic mountain views",
            location="Wayanad, Kerala",
            latitude=11.6854,
            longitude=76.1320,
            reviews_count=234
        ),
        Place(
            name="Spice Garden Restaurant",
            category="restaurant",
            rating=4.6,
            description="Authentic Kerala cuisine with traditional spices",
            location="Kalpetta, Wayanad",
            latitude=11.6081,
            longitude=76.0836,
            reviews_count=156
        ),
        Place(
            name="Banasura Sagar Dam",
            category="adventure",
            rating=4.7,
            description="Largest earthen dam in India with boating facilities",
            location="Padinharathara, Wayanad",
            latitude=11.7867,
            longitude=76.1693,
            reviews_count=189
        ),
        Place(
            name="Edakkal Caves",
            category="historical",
            rating=4.5,
            description="Ancient caves with prehistoric petroglyphs",
            location="Ambukuthi Hills, Wayanad",
            latitude=11.6664,
            longitude=76.1788,
            reviews_count=278
        )
    ]
    
    # Sample bus routes
    sample_bus_routes = [
        BusRoute(
            route_name="Sulthan Bathery - Pala",
            departure_time="19:00",
            duration="10h 30m",
            fare="₹280",
            operator="KSRTC",
            rating=4.2
        ),
        BusRoute(
            route_name="Kalpetta - Kochi",
            departure_time="06:30",
            duration="6h 45m",
            fare="₹240",
            operator="KSRTC",
            rating=4.4
        ),
        BusRoute(
            route_name="Mananthavady - Kozhikode",
            departure_time="17:45",
            duration="4h 15m",
            fare="₹180",
            operator="KSRTC",
            rating=4.1
        )
    ]
    
    # Add to database
    for place in sample_places:
        existing = db.query(Place).filter(Place.name == place.name).first()
        if not existing:
            db.add(place)
    
    for route in sample_bus_routes:
        existing = db.query(BusRoute).filter(BusRoute.route_name == route.route_name).first()
        if not existing:
            db.add(route)
    
    db.commit()
    return {"message": "Database seeded successfully"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)