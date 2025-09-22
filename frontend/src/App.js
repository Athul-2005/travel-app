import React, { useState, useEffect } from 'react';
import { Search, Home, MapPin, Plus, Clock, User, Award, Star, Navigation, Bus, Calendar, Users, ChevronRight, Filter } from 'lucide-react';

const TravelApp = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [userLocation, setUserLocation] = useState(null);
  const [hasLocationPermission, setHasLocationPermission] = useState(false);
  const [userProfile, setUserProfile] = useState({ badge: null, name: 'Traveler' });
  const [searchQuery, setSearchQuery] = useState('');
  const [trips, setTrips] = useState([]);

  // Mock data for demonstration
  const places = [
    { id: 1, name: "Wayanad Tea Gardens", rating: 4.8, category: "Nature", distance: "2.5 km", image: "🏔", reviews: 234 },
    { id: 2, name: "Spice Garden Restaurant", rating: 4.6, category: "Restaurant", distance: "1.2 km", image: "🍽", reviews: 156 },
    { id: 3, name: "Banasura Sagar Dam", rating: 4.7, category: "Adventure", distance: "5.8 km", image: "🌊", reviews: 189 },
    { id: 4, name: "Edakkal Caves", rating: 4.5, category: "Historical", distance: "8.2 km", image: "🗿", reviews: 278 }
  ];

  const busRoutes = [
    { id: 1, route: "Sulthan Bathery - Pala", time: "7:00 PM", duration: "10h 30m", fare: "Rs 280" },
    { id: 2, route: "Kalpetta - Kochi", time: "6:30 AM", duration: "6h 45m", fare: "Rs 240" },
    { id: 3, route: "Mananthavady - Kozhikode", time: "5:45 PM", duration: "4h 15m", fare: "Rs 180" }
  ];

  useEffect(() => {
    requestLocationPermission();
  }, []);

  const requestLocationPermission = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setHasLocationPermission(true);
        },
        (error) => {
          console.log("Location access denied");
          setHasLocationPermission(false);
        }
      );
    }
  };

  const HomeScreen = () => (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <div className="bg-white shadow-sm px-4 py-3">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="font-semibold text-gray-800">{userProfile.name}</p>
              {userProfile.badge && (
                <div className="flex items-center gap-1">
                  <Award className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm text-yellow-600">{userProfile.badge}</span>
                </div>
              )}
            </div>
          </div>
          {hasLocationPermission && (
            <div className="text-right">
              <p className="text-sm text-green-600">📍 Location Active</p>
              <p className="text-xs text-gray-500">Kalpatta, Kerala</p>
            </div>
          )}
        </div>
        
        {/* Search Bar */}
        <div className="relative">
          <Search className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search places, restaurants, attractions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-gray-100 rounded-xl border-0 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-6">
        {/* Categories */}
        <div className="flex gap-3 mb-6 overflow-x-auto pb-2">
          {['All', 'Nature', 'Restaurant', 'Adventure', 'Historical'].map((category) => (
            <button
              key={category}
              className="px-4 py-2 bg-white rounded-full text-sm font-medium text-gray-600 hover:bg-blue-50 hover:text-blue-600 whitespace-nowrap border"
            >
              {category}
            </button>
          ))}
        </div>

        {/* Places Grid */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            {hasLocationPermission ? "Near You" : "Popular Places"}
          </h2>
          {places.map((place) => (
            <div key={place.id} className="bg-white rounded-2xl shadow-sm p-4 hover:shadow-md transition-shadow">
              <div className="flex gap-4">
                <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center text-2xl">
                  {place.image}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800">{place.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-sm font-medium">{place.rating}</span>
                    <span className="text-sm text-gray-500">({place.reviews} reviews)</span>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
                      {place.category}
                    </span>
                    <span className="text-sm text-gray-500">{place.distance}</span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const PlaceFinder = () => {
    const [tripData, setTripData] = useState({
      origin: '',
      destination: '',
      time: '',
      mode: 'bus',
      tripNumber: 'TRIP' + Date.now()
    });
    const [showPlan, setShowPlan] = useState(false);

    const handleSubmit = () => {
      if (!tripData.origin || !tripData.destination || !tripData.time) {
        alert('Please fill in all required fields');
        return;
      }
      setTrips([...trips, { ...tripData, id: Date.now() }]);
      setShowPlan(true);
    };

    const samplePlan = {
      steps: [
        "Take KSRTC bus from Sulthan Bathery to Pala Kottaramattom bus stand",
        "Journey time: 10h 30m, Arrival: 5:30 AM next day",
        "From Pala, take auto to IIIT Kottayam, Nechipuzhoor (Rs 50-80)",
        "Alternative: Wait till 7:15 AM for bus to Ramapuram via Nechipuzhoor (Rs 15)",
        "Get down at Nechipuzhoor and take auto to IIIT Kottayam"
      ]
    };

    return (
      <div className="min-h-screen bg-gray-50 px-4 py-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Plan Your Journey</h1>
        
        {!showPlan ? (
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">From</label>
                <input
                  type="text"
                  value={tripData.origin}
                  onChange={(e) => setTripData({...tripData, origin: e.target.value})}
                  placeholder="Enter origin (e.g., Sulthan Bathery, Wayanad)"
                  className="w-full p-3 bg-gray-50 rounded-xl border-0 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">To</label>
                <input
                  type="text"
                  value={tripData.destination}
                  onChange={(e) => setTripData({...tripData, destination: e.target.value})}
                  placeholder="Enter destination (e.g., IIIT Kottayam)"
                  className="w-full p-3 bg-gray-50 rounded-xl border-0 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Departure Time</label>
                <input
                  type="time"
                  value={tripData.time}
                  onChange={(e) => setTripData({...tripData, time: e.target.value})}
                  className="w-full p-3 bg-gray-50 rounded-xl border-0 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mode of Transport</label>
                <select
                  value={tripData.mode}
                  onChange={(e) => setTripData({...tripData, mode: e.target.value})}
                  className="w-full p-3 bg-gray-50 rounded-xl border-0 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="bus">Bus</option>
                  <option value="train">Train</option>
                  <option value="car">Car</option>
                  <option value="mixed">Mixed Transport</option>
                </select>
              </div>
              
              <div className="bg-blue-50 p-3 rounded-xl">
                <p className="text-sm text-blue-600">Trip ID: {tripData.tripNumber}</p>
              </div>
              
              <button
                type="button"
                onClick={handleSubmit}
                className="w-full bg-blue-500 text-white py-3 rounded-xl font-medium hover:bg-blue-600 transition-colors"
              >
                Generate Travel Plan
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Your Travel Plan</h2>
              <div className="bg-green-50 p-4 rounded-xl mb-4">
                <p className="text-sm text-green-600">
                  {tripData.origin} → {tripData.destination}
                </p>
                <p className="text-sm text-green-600">Departure: {tripData.time} via {tripData.mode}</p>
              </div>
              
              <div className="space-y-3">
                {samplePlan.steps.map((step, index) => (
                  <div key={index} className="flex gap-3">
                    <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                      {index + 1}
                    </div>
                    <p className="text-sm text-gray-700 flex-1">{step}</p>
                  </div>
                ))}
              </div>
            </div>
            
            <button
              onClick={() => setShowPlan(false)}
              className="w-full bg-gray-200 text-gray-800 py-3 rounded-xl font-medium hover:bg-gray-300 transition-colors"
            >
              Plan Another Trip
            </button>
          </div>
        )}
      </div>
    );
  };

  const PlaceAdder = () => {
    const [reviewData, setReviewData] = useState({
      placeName: '',
      category: 'restaurant',
      rating: 5,
      description: '',
      location: ''
    });

    const handleSubmit = () => {
      if (!reviewData.placeName || !reviewData.description) {
        alert('Please fill in all required fields');
        return;
      }
      alert('Place/Review submitted successfully!');
      setReviewData({ placeName: '', category: 'restaurant', rating: 5, description: '', location: '' });
    };

    return (
      <div className="min-h-screen bg-gray-50 px-4 py-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Add Place or Review</h1>
        
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Place Name</label>
              <input
                type="text"
                value={reviewData.placeName}
                onChange={(e) => setReviewData({...reviewData, placeName: e.target.value})}
                placeholder="Enter place name"
                className="w-full p-3 bg-gray-50 rounded-xl border-0 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={reviewData.category}
                onChange={(e) => setReviewData({...reviewData, category: e.target.value})}
                className="w-full p-3 bg-gray-50 rounded-xl border-0 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="restaurant">Restaurant</option>
                <option value="attraction">Tourist Attraction</option>
                <option value="hotel">Hotel/Stay</option>
                <option value="nature">Nature Spot</option>
                <option value="historical">Historical Place</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReviewData({...reviewData, rating: star})}
                    className={`w-8 h-8 ${star <= reviewData.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                  >
                    <Star className="w-full h-full fill-current" />
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={reviewData.description}
                onChange={(e) => setReviewData({...reviewData, description: e.target.value})}
                placeholder="Write your review or description..."
                rows={4}
                className="w-full p-3 bg-gray-50 rounded-xl border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
              <input
                type="text"
                value={reviewData.location}
                onChange={(e) => setReviewData({...reviewData, location: e.target.value})}
                placeholder="Enter location details"
                className="w-full p-3 bg-gray-50 rounded-xl border-0 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <button
              type="button"
              onClick={handleSubmit}
              className="w-full bg-green-500 text-white py-3 rounded-xl font-medium hover:bg-green-600 transition-colors"
            >
              Submit Review
            </button>
          </div>
        </div>
        
        {hasLocationPermission && (
          <div className="mt-6 bg-blue-50 p-4 rounded-2xl">
            <p className="text-sm text-blue-600 text-center">
              📍 You can review places within 5 miles of your current location
            </p>
          </div>
        )}
      </div>
    );
  };

  const BusTimings = () => {
    const [showAddBus, setShowAddBus] = useState(false);
    const [newBus, setNewBus] = useState({ route: '', time: '', fare: '' });

    return (
      <div className="min-h-screen bg-gray-50 px-4 py-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Bus Timings</h1>
        
        {!hasLocationPermission && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded-xl">
            <p className="text-yellow-700">Enable location access to see buses near you</p>
            <button
              onClick={requestLocationPermission}
              className="mt-2 px-4 py-2 bg-yellow-500 text-white rounded-lg text-sm"
            >
              Enable Location
            </button>
          </div>
        )}
        
        <div className="space-y-4 mb-6">
          <h2 className="text-lg font-semibold text-gray-800">
            {hasLocationPermission ? "Buses Near You" : "Popular Routes"}
          </h2>
          
          {busRoutes.map((bus) => (
            <div key={bus.id} className="bg-white rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Bus className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">{bus.route}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>🕒 {bus.time}</span>
                      <span>⏱️ {bus.duration}</span>
                      <span>💰 {bus.fare}</span>
                    </div>
                  </div>
                </div>
                <button className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm">
                  Review
                </button>
              </div>
            </div>
          ))}
        </div>
        
        <button
          onClick={() => setShowAddBus(true)}
          className="w-full bg-blue-500 text-white py-3 rounded-xl font-medium hover:bg-blue-600 transition-colors mb-4"
        >
          Add Missing Bus
        </button>
        
        {showAddBus && (
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Add New Bus Route</h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Route (e.g., Kalpetta - Bangalore)"
                value={newBus.route}
                onChange={(e) => setNewBus({...newBus, route: e.target.value})}
                className="w-full p-3 bg-gray-50 rounded-xl border-0 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <input
                type="time"
                value={newBus.time}
                onChange={(e) => setNewBus({...newBus, time: e.target.value})}
                className="w-full p-3 bg-gray-50 rounded-xl border-0 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <input
                type="text"
                placeholder="Fare (e.g., Rs 200)"
                value={newBus.fare}
                onChange={(e) => setNewBus({...newBus, fare: e.target.value})}
                className="w-full p-3 bg-gray-50 rounded-xl border-0 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    alert('Bus route added successfully!');
                    setShowAddBus(false);
                    setNewBus({ route: '', time: '', fare: '' });
                  }}
                  className="flex-1 bg-green-500 text-white py-3 rounded-xl font-medium hover:bg-green-600 transition-colors"
                >
                  Add Bus
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddBus(false)}
                  className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-xl font-medium hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderScreen = () => {
    switch (activeTab) {
      case 'home': return <HomeScreen />;
      case 'finder': return <PlaceFinder />;
      case 'adder': return <PlaceAdder />;
      case 'bus': return <BusTimings />;
      default: return <HomeScreen />;
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen relative">
      {renderScreen()}
      
      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-white border-t border-gray-200">
        <div className="flex justify-around py-3">
          <button
            onClick={() => setActiveTab('finder')}
            className={`p-3 rounded-full ${activeTab === 'finder' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'}`}
          >
            <MapPin className="w-6 h-6" />
          </button>
          
          <button
            onClick={() => setActiveTab('bus')}
            className={`p-3 rounded-full ${activeTab === 'bus' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'}`}
          >
            <Clock className="w-6 h-6" />
          </button>
          
          <button
            onClick={() => setActiveTab('home')}
            className={`p-4 rounded-full ${activeTab === 'home' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-400'} transform scale-110`}
          >
            <Home className="w-6 h-6" />
          </button>
          
          <button
            onClick={() => setActiveTab('adder')}
            className={`p-3 rounded-full ${activeTab === 'adder' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'}`}
          >
            <Plus className="w-6 h-6" />
          </button>
          
          <button className="p-3 rounded-full text-gray-400">
            <Navigation className="w-6 h-6" />
          </button>
        </div>
      </div>
      
      <div className="h-20"></div>
    </div>
  );
};

export default TravelApp;