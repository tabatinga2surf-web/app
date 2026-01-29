import requests
import sys
import json
from datetime import datetime
import time

class TabatingaSurfAPITester:
    def __init__(self, base_url="https://beachsurf-app.preview.emergentagent.com"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []
        self.test_data = {}

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        if headers is None:
            headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=10)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    return success, response.json()
                except:
                    return success, response.text
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                print(f"Response: {response.text[:200]}")
                self.failed_tests.append({
                    "test": name,
                    "expected": expected_status,
                    "actual": response.status_code,
                    "response": response.text[:200]
                })
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            self.failed_tests.append({
                "test": name,
                "error": str(e)
            })
            return False, {}

    def test_auth_setup(self):
        """Test admin user setup"""
        success, response = self.run_test(
            "Admin Setup",
            "POST",
            "api/auth/setup",
            200,
            data={"username": "admin", "password": "admin123"}
        )
        return success

    def test_auth_login(self):
        """Test admin login"""
        success, response = self.run_test(
            "Admin Login",
            "POST",
            "api/auth/login",
            200,
            data={"username": "admin", "password": "admin123"}
        )
        return success

    def test_surfboards_crud(self):
        """Test surfboard CRUD operations"""
        # Create surfboard
        board_data = {
            "name": "Prancha Teste",
            "hourly_rate": 25.0,
            "image_url": "https://example.com/board.jpg"
        }
        
        success, response = self.run_test(
            "Create Surfboard",
            "POST",
            "api/surfboards",
            200,
            data=board_data
        )
        
        if success and 'id' in response:
            board_id = response['id']
            self.test_data['board_id'] = board_id
            
            # Get surfboards
            self.run_test(
                "Get Surfboards",
                "GET",
                "api/surfboards",
                200
            )
            
            # Update surfboard
            updated_data = {
                "name": "Prancha Atualizada",
                "hourly_rate": 30.0,
                "image_url": "https://example.com/updated.jpg"
            }
            self.run_test(
                "Update Surfboard",
                "PUT",
                f"api/surfboards/{board_id}",
                200,
                data=updated_data
            )
            
            return True
        return False

    def test_rental_flow(self):
        """Test complete rental flow"""
        if 'board_id' not in self.test_data:
            print("❌ Skipping rental tests - no board available")
            return False
            
        board_id = self.test_data['board_id']
        
        # Start rental
        rental_data = {
            "surfboard_id": board_id,
            "renter_name": "João Silva",
            "estimated_time": 60
        }
        
        success, response = self.run_test(
            "Start Rental",
            "POST",
            "api/rentals/start",
            200,
            data=rental_data
        )
        
        if success and 'id' in response:
            rental_id = response['id']
            self.test_data['rental_id'] = rental_id
            
            # Get active rentals
            self.run_test(
                "Get Active Rentals",
                "GET",
                "api/rentals/active",
                200
            )
            
            # Pause rental
            self.run_test(
                "Pause Rental",
                "PUT",
                f"api/rentals/{rental_id}",
                200,
                data={"action": "pause"}
            )
            
            # Resume rental
            self.run_test(
                "Resume Rental",
                "PUT",
                f"api/rentals/{rental_id}",
                200,
                data={"action": "resume"}
            )
            
            # Complete rental
            self.run_test(
                "Complete Rental",
                "PUT",
                f"api/rentals/{rental_id}",
                200,
                data={"action": "complete", "final_amount": 25.50}
            )
            
            # Get rental history
            self.run_test(
                "Get Rental History",
                "GET",
                "api/rentals/history",
                200
            )
            
            return True
        return False

    def test_products_crud(self):
        """Test product CRUD operations"""
        # Create product
        product_data = {
            "name": "Protetor Solar",
            "description": "Protetor solar FPS 60",
            "price": 35.90,
            "category": "acessorios",
            "stock": 10,
            "image_url": "https://example.com/sunscreen.jpg"
        }
        
        success, response = self.run_test(
            "Create Product",
            "POST",
            "api/products",
            200,
            data=product_data
        )
        
        if success and 'id' in response:
            product_id = response['id']
            self.test_data['product_id'] = product_id
            
            # Get products
            self.run_test(
                "Get Products",
                "GET",
                "api/products",
                200
            )
            
            # Update product
            updated_data = {
                "name": "Protetor Solar Premium",
                "description": "Protetor solar FPS 60 resistente à água",
                "price": 45.90,
                "category": "acessorios",
                "stock": 15,
                "image_url": "https://example.com/premium-sunscreen.jpg"
            }
            self.run_test(
                "Update Product",
                "PUT",
                f"api/products/{product_id}",
                200,
                data=updated_data
            )
            
            return True
        return False

    def test_settings(self):
        """Test settings endpoints"""
        # Get settings
        success, response = self.run_test(
            "Get Settings",
            "GET",
            "api/settings",
            200
        )
        
        if success:
            # Update settings
            settings_data = {
                "logo_url": "https://example.com/logo.png",
                "pix_qr_url": "https://example.com/qr.png",
                "instagram_handle": "tabatinga2surf"
            }
            self.run_test(
                "Update Settings",
                "PUT",
                "api/settings",
                200,
                data=settings_data
            )
            return True
        return False

    def test_weather_api(self):
        """Test weather API"""
        self.run_test(
            "Get Weather",
            "GET",
            "api/weather",
            200
        )

    def test_news_api(self):
        """Test news API"""
        self.run_test(
            "Get Surf News",
            "GET",
            "api/news",
            200
        )

    def test_payment_flow(self):
        """Test payment checkout creation"""
        payment_data = {
            "amount": 100.00,
            "origin_url": "https://beachsurf-app.preview.emergentagent.com",
            "metadata": {
                "items": "Teste de pagamento",
                "total": "100.00"
            }
        }
        
        success, response = self.run_test(
            "Create Payment Checkout",
            "POST",
            "api/payments/checkout",
            200,
            data=payment_data
        )
        
        if success and 'session_id' in response:
            session_id = response['session_id']
            # Test payment status
            self.run_test(
                "Get Payment Status",
                "GET",
                f"api/payments/status/{session_id}",
                200
            )

    def cleanup_test_data(self):
        """Clean up test data"""
        if 'product_id' in self.test_data:
            self.run_test(
                "Delete Test Product",
                "DELETE",
                f"api/products/{self.test_data['product_id']}",
                200
            )
        
        if 'board_id' in self.test_data:
            self.run_test(
                "Delete Test Surfboard",
                "DELETE",
                f"api/surfboards/{self.test_data['board_id']}",
                200
            )

def main():
    print("🏄‍♂️ Starting Tabatinga Surf API Tests...")
    tester = TabatingaSurfAPITester()

    # Test authentication
    print("\n=== AUTHENTICATION TESTS ===")
    tester.test_auth_setup()  # May fail if admin already exists
    tester.test_auth_login()

    # Test surfboards
    print("\n=== SURFBOARD TESTS ===")
    tester.test_surfboards_crud()

    # Test rental flow
    print("\n=== RENTAL TESTS ===")
    tester.test_rental_flow()

    # Test products
    print("\n=== PRODUCT TESTS ===")
    tester.test_products_crud()

    # Test settings
    print("\n=== SETTINGS TESTS ===")
    tester.test_settings()

    # Test external APIs
    print("\n=== EXTERNAL API TESTS ===")
    tester.test_weather_api()
    tester.test_news_api()

    # Test payment
    print("\n=== PAYMENT TESTS ===")
    tester.test_payment_flow()

    # Cleanup
    print("\n=== CLEANUP ===")
    tester.cleanup_test_data()

    # Print results
    print(f"\n📊 Test Results:")
    print(f"Tests run: {tester.tests_run}")
    print(f"Tests passed: {tester.tests_passed}")
    print(f"Tests failed: {tester.tests_run - tester.tests_passed}")
    print(f"Success rate: {(tester.tests_passed / tester.tests_run * 100):.1f}%")

    if tester.failed_tests:
        print(f"\n❌ Failed tests:")
        for failure in tester.failed_tests:
            print(f"  - {failure.get('test', 'Unknown')}: {failure.get('error', failure.get('response', 'Unknown error'))}")

    return 0 if tester.tests_passed == tester.tests_run else 1

if __name__ == "__main__":
    sys.exit(main())