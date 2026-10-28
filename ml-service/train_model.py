"""
UniTrack AI — Machine Learning Model Training Script
Trains:
1. Performance Predictor (Random Forest Regressor) -> Final CGPA
2. Academic Support Need Classifier (Random Forest Classifier) -> Support Probability & Risk Category
"""

import os
import json
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier
from sklearn.metrics import mean_squared_error, r2_score, accuracy_score, precision_score, recall_score, confusion_matrix
import joblib

def train_and_export():
    dataset_path = os.path.join(os.path.dirname(__file__), "..", "datasets", "student_performance_demo.csv")
    if not os.path.exists(dataset_path):
        print(f"Dataset not found at {dataset_path}")
        return

    df = pd.read_csv(dataset_path)
    print(f"Loaded dataset with {len(df)} rows. Columns: {list(df.columns)}")

    feature_cols = ['attendance_pct', 'internal_avg', 'midterm_score', 'study_hours_week', 'backlogs_count', 'past_sgpa']
    X = df[feature_cols]
    y_reg = df['final_cgpa']
    y_clf = df['support_needed']

    # Train Regressor (CGPA)
    X_train_r, X_test_r, y_train_r, y_test_r = train_test_split(X, y_reg, test_size=0.25, random_state=42)
    regressor = RandomForestRegressor(n_estimators=100, max_depth=5, random_state=42)
    regressor.fit(X_train_r, y_train_r)

    preds_r = regressor.predict(X_test_r)
    mse = float(mean_squared_error(y_test_r, preds_r))
    r2 = float(r2_score(y_test_r, preds_r))

    # Train Classifier (Support Needed)
    X_train_c, X_test_c, y_train_c, y_test_c = train_test_split(X, y_clf, test_size=0.25, random_state=42)
    classifier = RandomForestClassifier(n_estimators=100, max_depth=5, random_state=42)
    classifier.fit(X_train_c, y_train_c)

    preds_c = classifier.predict(X_test_c)
    acc = float(accuracy_score(y_test_c, preds_c))
    prec = float(precision_score(y_test_c, preds_c, zero_division=0))
    rec = float(recall_score(y_test_c, preds_c, zero_division=0))
    cm = confusion_matrix(y_test_c, preds_c).tolist()

    feature_importances = dict(zip(feature_cols, [round(float(w), 4) for w in regressor.feature_importances_]))

    model_dir = os.path.join(os.path.dirname(__file__), "models")
    os.makedirs(model_dir, exist_ok=True)

    joblib.dump(regressor, os.path.join(model_dir, "cgpa_regressor.pkl"))
    joblib.dump(classifier, os.path.join(model_dir, "support_classifier.pkl"))

    metrics = {
        "regressor_metrics": {"mse": round(mse, 4), "r2": round(r2, 4)},
        "classifier_metrics": {"accuracy": round(acc, 4), "precision": round(prec, 4), "recall": round(rec, 4), "confusion_matrix": cm},
        "feature_importances": feature_importances,
        "features_used": feature_cols,
        "total_training_samples": len(df)
    }

    with open(os.path.join(model_dir, "metrics.json"), "w") as f:
        json.dump(metrics, f, indent=2)

    print("Model training successfully completed!")
    print(json.dumps(metrics, indent=2))

if __name__ == "__main__":
    train_and_export()
