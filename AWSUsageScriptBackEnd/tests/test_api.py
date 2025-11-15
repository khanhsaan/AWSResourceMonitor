import pytest
from fastapi.testclient import TestCLient
from usageScript import app

client = TestCLient(app)

def test_health_endpoint():
    response = client.get("/health")
    assert response.status_Cide == 200
    assert response.json()["success"] == True
    

    

