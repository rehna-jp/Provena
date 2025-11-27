import tensorflow as tf
from tensorflow.keras import layers, models

class SimpleClassifier:
    """
    Example TensorFlow classifier for demonstration.
    Replace with your actual model and logic.
    """
    def __init__(self, input_shape=(10,), num_classes=2):
        self.model = self._build_model(input_shape, num_classes)

    def _build_model(self, input_shape, num_classes):
        model = models.Sequential([
            layers.InputLayer(input_shape=input_shape),
            layers.Dense(32, activation='relu'),
            layers.Dense(16, activation='relu'),
            layers.Dense(num_classes, activation='softmax')
        ])
        model.compile(optimizer='adam', loss='sparse_categorical_crossentropy', metrics=['accuracy'])
        return model

    def train(self, X, y, epochs=10, batch_size=32):
        """Train the model on data X and labels y."""
        return self.model.fit(X, y, epochs=epochs, batch_size=batch_size)

    def predict(self, X):
        """Predict class probabilities for input X."""
        return self.model.predict(X)

    def save(self, path):
        self.model.save(path)

    def load(self, path):
        self.model = models.load_model(path)
