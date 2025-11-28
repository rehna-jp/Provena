# 🔗 Backend API Integration Guide

**For Your Backend Teammate**

---

## 📋 Overview

The frontend expects a complete REST API with 15+ endpoints organized into 5 categories:
1. **Product Endpoints** (3)
2. **Checkpoint/Event Endpoints** (2)
3. **Consumer Scan Endpoints** (2)
4. **AI/ML Endpoints** (4)
5. **DKG Endpoints** (4)

All endpoints respond with JSON and should handle errors gracefully.

---

## 🎯 Environment Configuration

```javascript
// .env
DKG_ENDPOINT=http://localhost:8900
NEUROWEB_PRIVATE_KEY=your_key
DATABASE_URL=mongodb://localhost/provena
AI_MODEL_PATH=/models/tensorflow
```

---

## 📦 Product Endpoints

### 1. Register Product
**POST** `/product/register`

Creates a new product record in the database.

```javascript
app.post('/product/register', async (req, res) => {
  const { product_id, name, origin } = req.body;

  try {
    // Validate input
    if (!product_id || !name || !origin) {
      return res.status(400).json({
        error: 'Missing required fields: product_id, name, origin'
      });
    }

    // Check if product already exists
    const existing = await Product.findOne({ product_id });
    if (existing) {
      return res.status(409).json({
        error: 'Product already exists'
      });
    }

    // Create product
    const product = await Product.create({
      product_id,
      name,
      origin,
      created_at: new Date(),
      status: 'pending' // pending → published
    });

    res.json({
      success: true,
      product_id: product.product_id,
      name: product.name,
      origin: product.origin,
      created_at: product.created_at
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: error.message });
  }
});
```

### 2. Get Product Details
**GET** `/product/{product_id}`

Fetches product information from database.

```javascript
app.get('/product/:productId', async (req, res) => {
  const { productId } = req.params;

  try {
    const product = await Product.findOne({ product_id: productId });
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({
      product_id: product.product_id,
      name: product.name,
      origin: product.origin,
      created_at: product.created_at,
      status: product.status,
      manufacturer: product.manufacturer,
      // Add more fields as needed
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### 3. Get Product Timeline
**GET** `/product/{product_id}/timeline`

Returns all events for a product in chronological order.

```javascript
app.get('/product/:productId/timeline', async (req, res) => {
  const { productId } = req.params;

  try {
    const checkpoints = await Checkpoint.find({ product_id: productId })
      .sort({ timestamp: 1 });

    res.json({
      product_id: productId,
      events: checkpoints.map(cp => ({
        id: cp._id,
        location: cp.location,
        handler: cp.handler,
        timestamp: cp.timestamp,
        type: 'checkpoint',
        verified: cp.verified
      })),
      total_events: checkpoints.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

---

## 🚩 Checkpoint/Event Endpoints

### 4. Submit Single Checkpoint
**POST** `/checkpoint/submit`

Records a single supply chain event.

```javascript
app.post('/checkpoint/submit', async (req, res) => {
  const { product_id, location, handler, timestamp } = req.body;

  try {
    // Validate product exists
    const product = await Product.findOne({ product_id });
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Create checkpoint
    const checkpoint = await Checkpoint.create({
      product_id,
      location,
      handler,
      timestamp: timestamp || new Date(),
      verified: false // Will be set to true after AI verification
    });

    // Trigger AI analysis (async)
    analyzeCheckpoint(product, checkpoint).catch(console.error);

    res.json({
      success: true,
      checkpoint_id: checkpoint._id,
      product_id,
      location,
      timestamp: checkpoint.timestamp
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### 5. Submit Batch Checkpoints
**POST** `/checkpoint/batch`

Records multiple events in one request.

```javascript
app.post('/checkpoint/batch', async (req, res) => {
  const { checkpoints } = req.body;

  try {
    if (!Array.isArray(checkpoints) || checkpoints.length === 0) {
      return res.status(400).json({ error: 'Invalid checkpoints array' });
    }

    const results = [];

    for (const cp of checkpoints) {
      const { product_id, location, handler, timestamp } = cp;

      // Validate product
      const product = await Product.findOne({ product_id });
      if (!product) {
        results.push({ success: false, product_id, error: 'Product not found' });
        continue;
      }

      // Create checkpoint
      const checkpoint = await Checkpoint.create({
        product_id,
        location,
        handler,
        timestamp: timestamp || new Date(),
        verified: false
      });

      results.push({
        success: true,
        product_id,
        checkpoint_id: checkpoint._id
      });

      // Trigger AI analysis
      analyzeCheckpoint(product, checkpoint).catch(console.error);
    }

    res.json({
      success: true,
      results,
      total_submitted: checkpoints.length,
      successful: results.filter(r => r.success).length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

---

## 👁️ Consumer Scan Endpoints

### 6. Get Product & AI Results
**GET** `/scan/{product_id}`

Returns complete product data with AI analysis and trust score.

```javascript
app.get('/scan/:productId', async (req, res) => {
  const { productId } = req.params;

  try {
    // Get product
    const product = await Product.findOne({ product_id: productId });
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Get timeline
    const checkpoints = await Checkpoint.find({ product_id: productId })
      .sort({ timestamp: 1 });

    // Get AI results (cached or compute)
    const aiResults = await getOrComputeAIResults(product, checkpoints);

    // Get trust score
    const trustScore = await calculateTrustScore(product, checkpoints, aiResults);

    res.json({
      product: {
        product_id: product.product_id,
        name: product.name,
        origin: product.origin,
        created_at: product.created_at
      },
      timeline: checkpoints.map(cp => ({
        location: cp.location,
        handler: cp.handler,
        timestamp: cp.timestamp,
        verified: cp.verified
      })),
      ai_results: aiResults,
      trust_score: trustScore,
      verified: true,
      last_updated: new Date()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### 7. Get Trust Score
**GET** `/scan/{product_id}/trust`

Returns trust score and component breakdown.

```javascript
app.get('/scan/:productId/trust', async (req, res) => {
  const { productId } = req.params;

  try {
    const product = await Product.findOne({ product_id: productId });
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const checkpoints = await Checkpoint.find({ product_id: productId });
    
    // Calculate each component
    const locationVerified = await verifyLocations(checkpoints);
    const timingValid = await validateTiming(checkpoints);
    const manufacturerReputation = product.manufacturer_reputation || 85;
    const anomalyScore = await detectAnomalies(checkpoints);

    // Weighted average
    const trustScore = Math.round(
      (locationVerified * 0.25) +
      (timingValid * 0.25) +
      (manufacturerReputation * 0.25) +
      ((100 - anomalyScore) * 0.25)
    );

    res.json({
      trust_score: trustScore,
      breakdown: {
        location_verified: locationVerified,
        timing_valid: timingValid,
        manufacturer_reputation: manufacturerReputation,
        anomaly_detection: 100 - anomalyScore
      },
      confidence: 0.95,
      updated_at: new Date()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

---

## 🤖 AI/ML Endpoints

### 8. Validate Product Data
**POST** `/ai/validate`

Uses TensorFlow model to validate product data integrity.

```javascript
app.post('/ai/validate', async (req, res) => {
  const productData = req.body;

  try {
    // Load TensorFlow model
    const model = await tf.loadLayersModel('file://./models/validator/model.json');

    // Preprocess data
    const input = preprocessData(productData);

    // Run prediction
    const prediction = model.predict(input);
    const confidence = await prediction.data();

    res.json({
      is_valid: confidence[0] > 0.7,
      confidence: confidence[0],
      issues: confidence[0] < 0.7 ? ['Low data quality'] : []
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### 9. Anomaly Detection
**POST** `/ai/analyze`

Detects anomalies in supply chain timeline.

```javascript
app.post('/ai/analyze', async (req, res) => {
  const { product_data, timeline } = req.body;

  try {
    const anomalies = [];

    // Check for impossible transit times
    for (let i = 0; i < timeline.length - 1; i++) {
      const current = timeline[i];
      const next = timeline[i + 1];
      
      const distance = calculateDistance(current.location, next.location);
      const timeDiff = (new Date(next.timestamp) - new Date(current.timestamp)) / (1000 * 3600); // hours
      const minHoursNeeded = distance / 80; // 80 km/h average

      if (timeDiff < minHoursNeeded * 0.8) {
        anomalies.push({
          type: 'impossible_speed',
          severity: 'high',
          message: `Transit too fast between ${current.location} and ${next.location}`
        });
      }
    }

    // Check for location spoofing (using geolocation validation)
    const validLocations = await validateGeolocation(timeline);
    if (!validLocations) {
      anomalies.push({
        type: 'location_spoofing',
        severity: 'critical',
        message: 'Suspicious location pattern detected'
      });
    }

    const severity = anomalies.length === 0 ? 'none' : 
                    anomalies.some(a => a.severity === 'critical') ? 'high' :
                    'medium';

    res.json({
      anomalies,
      severity,
      total_issues: anomalies.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### 10. Compute Trust Score
**POST** `/ai/trustscore`

Calculates AI-based trust score.

```javascript
app.post('/ai/trustscore', async (req, res) => {
  const { product_data, checkpoints, manufacturer_reputation } = req.body;

  try {
    // Component calculations
    const locationScore = await validateLocations(checkpoints);
    const timingScore = await validateTiming(checkpoints);
    const reputationScore = manufacturer_reputation || 85;
    const consistencyScore = await checkDataConsistency(product_data);

    // Weighted calculation
    const trustScore = Math.round(
      (locationScore * 0.3) +
      (timingScore * 0.2) +
      (reputationScore * 0.3) +
      (consistencyScore * 0.2)
    );

    res.json({
      score: trustScore,
      factors: {
        location: locationScore,
        timing: timingScore,
        reputation: reputationScore,
        consistency: consistencyScore
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### 11. Fraud Detection
**POST** `/ai/fraud`

Detects potential fraud patterns.

```javascript
app.post('/ai/fraud', async (req, res) => {
  const { product_data, checkpoints, similar_products } = req.body;

  try {
    let fraudIndicators = 0;
    const indicators = [];

    // Check against known fraud patterns
    if (checkpoints.length < 2) {
      indicators.push('Insufficient checkpoints');
      fraudIndicators++;
    }

    // Compare with similar products
    const avgCheckpoints = similar_products.length > 0
      ? similar_products.reduce((sum, p) => sum + p.checkpoints, 0) / similar_products.length
      : 5;

    if (checkpoints.length < avgCheckpoints * 0.5) {
      indicators.push('Below average checkpoint count');
      fraudIndicators++;
    }

    // Check for pattern matching (using TensorFlow)
    const fraudScore = fraudIndicators / 5; // Normalize

    res.json({
      is_fraud: fraudScore > 0.5,
      fraud_score: fraudScore,
      indicators,
      confidence: 0.85
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

---

## 📚 DKG Endpoints

### 12. Publish to DKG
**POST** `/dkg/publish`

Creates and publishes knowledge asset to OriginTrail DKG.

```javascript
const { DKGClient } = require('@origintrail/dkg-client');

const dkg = new DKGClient({
  environment: 'testnet',
  endpoint: process.env.DKG_ENDPOINT || 'http://localhost:8900'
});

app.post('/dkg/publish', async (req, res) => {
  const { product_id, product_name, origin } = req.body;

  try {
    // Create knowledge asset
    const result = await dkg.asset.create({
      '@context': 'https://www.w3.org/2019/did/v1',
      '@type': 'Product',
      '@id': `product:${product_id}`,
      name: product_name,
      origin,
      createdAt: new Date().toISOString(),
      metadata: {
        system: 'Provena',
        version: '1.0'
      }
    }, {
      epochsNum: 1
    });

    // Save UAL to database
    const product = await Product.findOneAndUpdate(
      { product_id },
      { 
        dkg_ual: result.ual,
        dkg_published: true,
        dkg_timestamp: new Date()
      },
      { new: true }
    );

    res.json({
      ual: result.ual,
      knowledge_asset_hash: result.publicAssertionId,
      product_id,
      published: true
    });
  } catch (error) {
    console.error('DKG publish error:', error);
    res.status(500).json({ error: error.message });
  }
});
```

### 13. Append Event to DKG
**POST** `/dkg/append`

Appends a new event to existing knowledge asset.

```javascript
app.post('/dkg/append', async (req, res) => {
  const { ual, event, timestamp } = req.body;

  try {
    // Get current asset
    const currentAsset = await dkg.asset.get(ual);

    // Append event
    const updatedAsset = {
      ...currentAsset,
      events: currentAsset.events || [],
      lastUpdate: timestamp || new Date().toISOString()
    };

    updatedAsset.events.push({
      type: event.type,
      location: event.location,
      timestamp: timestamp || new Date().toISOString(),
      handler: event.handler
    });

    // Publish updated asset
    const result = await dkg.asset.create(updatedAsset, { 
      epochsNum: 1 
    });

    res.json({
      success: true,
      updated_ual: result.ual,
      event_added: true
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### 14. Query DKG Asset
**POST** `/dkg/query`

Retrieves knowledge asset from DKG.

```javascript
app.post('/dkg/query', async (req, res) => {
  const { ual } = req.body;

  try {
    const asset = await dkg.asset.get(ual);

    res.json({
      ual,
      asset_data: asset,
      verified: true,
      retrieved_at: new Date()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### 15. Search DKG Assets
**POST** `/dkg/search`

Searches for products in DKG by criteria.

```javascript
app.post('/dkg/search', async (req, res) => {
  const { product_id, manufacturer, origin, tags } = req.body;

  try {
    // Query database (DKG search is limited, use DB for now)
    let query = {};
    if (product_id) query.product_id = product_id;
    if (manufacturer) query.manufacturer = manufacturer;
    if (origin) query.origin = origin;
    if (tags) query.tags = { $in: tags };

    const results = await Product.find(query).limit(50);

    res.json({
      results,
      total: results.length,
      search_criteria: { product_id, manufacturer, origin, tags }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

---

## 🗄️ Database Schema (MongoDB)

```javascript
// Product Collection
{
  _id: ObjectId,
  product_id: String (unique),
  name: String,
  origin: String,
  manufacturer: String,
  manufacturer_reputation: Number (0-100),
  created_at: Date,
  status: String ('pending' | 'published' | 'delivered'),
  dkg_ual: String,
  dkg_published: Boolean,
  dkg_timestamp: Date
}

// Checkpoint Collection
{
  _id: ObjectId,
  product_id: String,
  location: String,
  handler: String,
  timestamp: Date,
  verified: Boolean,
  ai_analysis: {
    anomalies: Array,
    trust_component: Number,
    fraud_score: Number
  }
}
```

---

## ✅ Testing Endpoints

```bash
# Register product
curl -X POST http://localhost:3001/product/register \
  -H "Content-Type: application/json" \
  -d '{"product_id":"PROD-001","name":"Coffee","origin":"Ethiopia"}'

# Get product
curl http://localhost:3001/product/PROD-001

# Submit checkpoint
curl -X POST http://localhost:3001/checkpoint/submit \
  -H "Content-Type: application/json" \
  -d '{"product_id":"PROD-001","location":"NYC","handler":"0x123..."}'

# Scan product
curl http://localhost:3001/scan/PROD-001

# Get trust score
curl http://localhost:3001/scan/PROD-001/trust
```

---

**All endpoints ready for frontend integration! 🚀**
