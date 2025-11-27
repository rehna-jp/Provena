# TensorFlow Model Usage Example

This notebook demonstrates how to train, save, load, and use the production-ready TensorFlow model and pipeline in the TrustChain backend.

## 1. Train and Save Model
```python
from ai.models.simple_classifier import SimpleClassifier
import numpy as np

# Generate dummy data
X = np.random.rand(100, 10)
y = np.random.randint(0, 2, 100)

model = SimpleClassifier(input_shape=(10,), num_classes=2)
model.train(X, y, epochs=5)
model.save('simple_classifier.h5')
```

## 2. Load and Predict
```python
from ai.pipelines.classifier_pipeline import ClassifierPipeline
import numpy as np

pipeline = ClassifierPipeline(model_path='simple_classifier.h5')

# Predict on new data
sample = np.random.rand(10)
preds = pipeline.predict(sample)
print(preds)
```

## 3. Integrate with FastAPI Endpoint
- Use the pipeline in your AI/ML service logic (e.g., in `app/services/ai/validation.py`).
- Pass input data from API requests to the pipeline and return predictions.

---
For more advanced use, add preprocessing, postprocessing, and model versioning as needed.
