
from ai.pipelines.classifier_pipeline import ClassifierPipeline
import numpy as np

# Load the model pipeline (adjust model_path as needed)
pipeline = ClassifierPipeline(model_path=None)  # Set path to your .h5 if available

def validate_product_data(product_data):
    """
    Run TensorFlow model inference on product data for validation.
    Expects product_data as a list or array of features.
    Returns validation_score and details.
    """
    try:
        # Example: extract features from product_data
        # Replace with your actual feature extraction logic
        features = np.array(product_data.get('features', []))
        preds = pipeline.predict(features)
        validation_score = float(np.max(preds))
        severity_level = "LOW" if validation_score > 0.8 else "HIGH"
        return {
            "validation_score": validation_score,
            "issues": [] if validation_score > 0.8 else ["Low confidence prediction"],
            "severity_level": severity_level
        }
    except Exception as e:
        return {
            "validation_score": 0.0,
            "issues": [str(e)],
            "severity_level": "ERROR"
        }
