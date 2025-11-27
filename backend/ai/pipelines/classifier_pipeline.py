import numpy as np
from ai.models.simple_classifier import SimpleClassifier

# Example pipeline for using the TensorFlow model in production
# Replace with your actual preprocessing and inference logic

class ClassifierPipeline:
    """
    Production-ready pipeline for TensorFlow model inference.
    Handles preprocessing, model loading, and prediction.
    """
    def __init__(self, model_path=None):
        self.model = SimpleClassifier()
        if model_path:
            self.model.load(model_path)

    def preprocess(self, data):
        # Example: convert input to numpy array and reshape
        arr = np.array(data)
        if arr.ndim == 1:
            arr = arr.reshape(1, -1)
        return arr

    def predict(self, data):
        X = self.preprocess(data)
        preds = self.model.predict(X)
        return preds.tolist()
