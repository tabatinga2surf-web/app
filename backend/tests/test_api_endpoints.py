"""
Backend API Tests for Tabatinga2Surf - Surf Board Rental System
Tests all API endpoints: weather, tides, products, surfboards, auth, rentals
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestHealthAndWeather:
    """Test weather, waves and tides endpoints (MOCKED data)"""
    
    def test_weather_endpoint(self):
        """Test /api/weather returns weather data with new fields"""
        response = requests.get(f"{BASE_URL}/api/weather")
        assert response.status_code == 200
        data = response.json()
        
        # Verify weather data structure
        assert "temp" in data
        assert "feels_like" in data
        assert "humidity" in data
        assert "wind_speed" in data
        assert "source" in data
        
        # Verify NEW fields added for Condições do Mar
        assert "wind_direction" in data, "Missing wind_direction field"
        assert "rain_chance" in data, "Missing rain_chance field"
        assert "sunrise" in data, "Missing sunrise field"
        assert "sunset" in data, "Missing sunset field"
        
        # Verify expected values (MOCKED data)
        assert data["temp"] == 26
        assert data["source"] == "estimado"
        assert data["wind_direction"] == "ESE"
        assert data["sunrise"] == "05:18"
        assert data["sunset"] == "17:45"
        print(f"✓ Weather API returns: {data['temp']}°C, wind: {data['wind_speed']} km/h {data['wind_direction']}")
        print(f"  Sunrise: {data['sunrise']}, Sunset: {data['sunset']}, Rain chance: {data['rain_chance']}%")
    
    def test_waves_endpoint(self):
        """Test /api/waves returns wave/surf conditions data"""
        response = requests.get(f"{BASE_URL}/api/waves")
        assert response.status_code == 200
        data = response.json()
        
        # Verify waves data structure
        assert "wave_height" in data, "Missing wave_height field"
        assert "wave_height_max" in data, "Missing wave_height_max field"
        assert "wave_direction" in data, "Missing wave_direction field"
        assert "swell_period" in data, "Missing swell_period field"
        assert "water_temp" in data, "Missing water_temp field"
        assert "surf_rating" in data, "Missing surf_rating field"
        assert "best_time" in data, "Missing best_time field"
        assert "conditions_summary" in data, "Missing conditions_summary field"
        assert "source" in data, "Missing source field"
        
        # Verify expected values
        assert data["wave_direction"] == "ESE"
        assert data["water_temp"] == 27
        assert data["surf_rating"] in ["Bom", "Excelente", "Regular", "Pequeno"]
        assert data["source"] == "estimado"
        
        print(f"✓ Waves API returns: {data['wave_height']}m (max: {data['wave_height_max']}m)")
        print(f"  Direction: {data['wave_direction']}, Period: {data['swell_period']}s, Rating: {data['surf_rating']}")
        print(f"  Water temp: {data['water_temp']}°C, Best time: {data['best_time']}")
    
    def test_tides_endpoint(self):
        """Test /api/tides returns tide data"""
        response = requests.get(f"{BASE_URL}/api/tides")
        assert response.status_code == 200
        data = response.json()
        
        # Verify tides data structure
        assert "location" in data
        assert "tides" in data
        assert isinstance(data["tides"], list)
        assert len(data["tides"]) >= 1
        
        # Verify tide entry structure
        tide = data["tides"][0]
        assert "type" in tide
        assert "time" in tide
        assert "height" in tide
        print(f"✓ Tides API returns {len(data['tides'])} tide entries for {data['location']}")


class TestProducts:
    """Test product CRUD endpoints"""
    
    def test_get_products(self):
        """Test /api/products returns product list"""
        response = requests.get(f"{BASE_URL}/api/products")
        assert response.status_code == 200
        data = response.json()
        
        assert isinstance(data, list)
        print(f"✓ Products API returns {len(data)} products")
        
        if len(data) > 0:
            product = data[0]
            assert "id" in product
            assert "name" in product
            assert "price" in product
            assert "category" in product
            print(f"✓ First product: {product['name']} - R$ {product['price']}")
    
    def test_create_and_delete_product(self):
        """Test product creation and deletion"""
        # Create product
        test_product = {
            "name": f"TEST_Product_{uuid.uuid4().hex[:8]}",
            "description": "Test product for automated testing",
            "price": 99.99,
            "category": "test",
            "stock": 10
        }
        
        create_response = requests.post(f"{BASE_URL}/api/products", json=test_product)
        assert create_response.status_code == 200
        created = create_response.json()
        
        assert created["name"] == test_product["name"]
        assert created["price"] == test_product["price"]
        product_id = created["id"]
        print(f"✓ Created test product: {created['name']} (ID: {product_id})")
        
        # Delete product
        delete_response = requests.delete(f"{BASE_URL}/api/products/{product_id}")
        assert delete_response.status_code == 200
        print(f"✓ Deleted test product: {product_id}")


class TestSurfboards:
    """Test surfboard CRUD endpoints"""
    
    def test_get_surfboards(self):
        """Test /api/surfboards returns surfboard list"""
        response = requests.get(f"{BASE_URL}/api/surfboards")
        assert response.status_code == 200
        data = response.json()
        
        assert isinstance(data, list)
        print(f"✓ Surfboards API returns {len(data)} boards")
        
        if len(data) > 0:
            board = data[0]
            assert "id" in board
            assert "name" in board
            assert "hourly_rate" in board
            assert "status" in board
            print(f"✓ First board: {board['name']} - R$ {board['hourly_rate']}/hora")
    
    def test_create_and_delete_surfboard(self):
        """Test surfboard creation and deletion"""
        # Create surfboard
        test_board = {
            "name": f"TEST_Board_{uuid.uuid4().hex[:8]}",
            "hourly_rate": 35.00
        }
        
        create_response = requests.post(f"{BASE_URL}/api/surfboards", json=test_board)
        assert create_response.status_code == 200
        created = create_response.json()
        
        assert created["name"] == test_board["name"]
        assert created["hourly_rate"] == test_board["hourly_rate"]
        board_id = created["id"]
        print(f"✓ Created test board: {created['name']} (ID: {board_id})")
        
        # Delete surfboard
        delete_response = requests.delete(f"{BASE_URL}/api/surfboards/{board_id}")
        assert delete_response.status_code == 200
        print(f"✓ Deleted test board: {board_id}")


class TestAuthentication:
    """Test authentication endpoints"""
    
    def test_login_success(self):
        """Test successful login with admin/admin123"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "username": "admin",
            "password": "admin123"
        })
        assert response.status_code == 200
        data = response.json()
        
        assert data["success"] == True
        assert data["username"] == "admin"
        print("✓ Login successful with admin/admin123")
    
    def test_login_invalid_credentials(self):
        """Test login with invalid credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "username": "invalid",
            "password": "wrongpassword"
        })
        assert response.status_code == 401
        print("✓ Login correctly rejected invalid credentials")


class TestRentals:
    """Test rental management endpoints"""
    
    def test_get_active_rentals(self):
        """Test /api/rentals/active returns active rentals"""
        response = requests.get(f"{BASE_URL}/api/rentals/active")
        assert response.status_code == 200
        data = response.json()
        
        assert isinstance(data, list)
        print(f"✓ Active rentals API returns {len(data)} active rentals")
    
    def test_get_rental_history(self):
        """Test /api/rentals/history returns rental history"""
        response = requests.get(f"{BASE_URL}/api/rentals/history")
        assert response.status_code == 200
        data = response.json()
        
        assert isinstance(data, list)
        print(f"✓ Rental history API returns {len(data)} completed rentals")
    
    def test_get_rental_by_id(self):
        """Test GET /api/rentals/{rental_id} returns specific rental (for receipt page)"""
        # Use existing rental ID from test data
        rental_id = "17546e65-7fc1-4ea0-a12f-894153c74be9"
        response = requests.get(f"{BASE_URL}/api/rentals/{rental_id}")
        assert response.status_code == 200
        data = response.json()
        
        # Verify rental data structure for receipt page
        assert "id" in data, "Missing id field"
        assert "surfboard_name" in data, "Missing surfboard_name field"
        assert "renter_name" in data, "Missing renter_name field"
        assert "start_time" in data, "Missing start_time field"
        assert "end_time" in data, "Missing end_time field"
        assert "final_amount" in data, "Missing final_amount field"
        assert "status" in data, "Missing status field"
        
        print(f"✓ GET rental by ID returns: {data['renter_name']} - {data['surfboard_name']}")
        print(f"  Status: {data['status']}, Amount: R$ {data.get('final_amount', 0):.2f}")
    
    def test_get_rental_not_found(self):
        """Test GET /api/rentals/{rental_id} returns 404 for non-existent rental"""
        response = requests.get(f"{BASE_URL}/api/rentals/non-existent-id-12345")
        assert response.status_code == 404
        print("✓ GET rental correctly returns 404 for non-existent ID")
    
    def test_rental_flow(self):
        """Test complete rental flow: start -> pause -> resume -> complete"""
        # First create a test surfboard
        test_board = {
            "name": f"TEST_RentalBoard_{uuid.uuid4().hex[:8]}",
            "hourly_rate": 25.00
        }
        board_response = requests.post(f"{BASE_URL}/api/surfboards", json=test_board)
        assert board_response.status_code == 200
        board = board_response.json()
        board_id = board["id"]
        print(f"✓ Created test board for rental: {board['name']}")
        
        try:
            # Start rental
            rental_data = {
                "surfboard_id": board_id,
                "renter_name": "TEST_Renter",
                "estimated_time": 60
            }
            start_response = requests.post(f"{BASE_URL}/api/rentals/start", json=rental_data)
            assert start_response.status_code == 200
            rental = start_response.json()
            rental_id = rental["id"]
            print(f"✓ Started rental: {rental_id}")
            
            # Pause rental
            pause_response = requests.put(f"{BASE_URL}/api/rentals/{rental_id}", json={"action": "pause"})
            assert pause_response.status_code == 200
            print("✓ Paused rental")
            
            # Resume rental
            resume_response = requests.put(f"{BASE_URL}/api/rentals/{rental_id}", json={"action": "resume"})
            assert resume_response.status_code == 200
            print("✓ Resumed rental")
            
            # Complete rental
            complete_response = requests.put(f"{BASE_URL}/api/rentals/{rental_id}", json={
                "action": "complete",
                "final_amount": 25.00
            })
            assert complete_response.status_code == 200
            print("✓ Completed rental")
            
        finally:
            # Cleanup: delete test board
            requests.delete(f"{BASE_URL}/api/surfboards/{board_id}")
            print(f"✓ Cleaned up test board: {board_id}")


class TestGallery:
    """Test gallery endpoints"""
    
    def test_get_gallery(self):
        """Test /api/gallery returns gallery images"""
        response = requests.get(f"{BASE_URL}/api/gallery")
        assert response.status_code == 200
        data = response.json()
        
        assert isinstance(data, list)
        print(f"✓ Gallery API returns {len(data)} images")


class TestSettings:
    """Test settings endpoints"""
    
    def test_get_settings(self):
        """Test /api/settings returns app settings"""
        response = requests.get(f"{BASE_URL}/api/settings")
        assert response.status_code == 200
        data = response.json()
        
        assert "id" in data
        print(f"✓ Settings API returns configuration")


class TestNews:
    """Test news endpoint"""
    
    def test_get_news(self):
        """Test /api/news returns surf news"""
        response = requests.get(f"{BASE_URL}/api/news")
        assert response.status_code == 200
        data = response.json()
        
        # News can be a list or error object
        if isinstance(data, list):
            print(f"✓ News API returns {len(data)} news items")
        else:
            print(f"✓ News API returned (may have error): {data}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
