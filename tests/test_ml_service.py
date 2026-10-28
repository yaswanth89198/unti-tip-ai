"""
Unit and API Integration Tests for UniTrack AI Python ML Microservice
"""

import pytest
from fastapi.testclient import TestClient
import sys
import os

# Add ml-service directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "ml-service"))
from app import app

client = TestClient(app)

def test_health_check():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_predict_performance_valid():
    payload = {
        "enrollment_id": "240101",
        "attendance_pct": 88.5,
        "internal_avg": 85.0,
        "midterm_score": 82.0,
        "study_hours_week": 16.0,
        "backlogs_count": 0,
        "past_sgpa": 8.5
    }
    response = client.post("/predict/performance", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "predicted_cgpa" in data
    assert 7.5 <= data["predicted_cgpa"] <= 10.0
    assert "confidence_range" in data

def test_predict_support_risk_high():
    payload = {
        "attendance_pct": 55.0, # Below 75% cutoff
        "internal_avg": 42.0,   # Low internal
        "midterm_score": 38.0,
        "study_hours_week": 5.0,
        "backlogs_count": 2,    # Standing backlogs
        "past_sgpa": 5.8
    }
    response = client.post("/predict/support-risk", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["risk_level"] == "High Risk"
    assert data["support_needed"] is True
    assert len(data["risk_factors"]) >= 2

def test_model_metrics_endpoint():
    response = client.get("/model/metrics")
    assert response.status_code == 200
    data = response.json()
    assert "metrics" in data
    assert data["metrics"]["regression_r2"] > 0.85
