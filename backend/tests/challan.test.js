const request = require('supertest');
const app = require('../server'); // Assuming server exports app
const User = require('../models/User');
const Challan = require('../models/Challan');
const jwt = require('jsonwebtoken');

describe('Challan API Tests', () => {
  let token;
  let userId;
  let challanId;

  // Setup: Create test user and get auth token
  beforeAll(async () => {
    // Create or find test user
    let user = await User.findOne({ email: 'test@boxtrack.internal' });
    if (!user) {
      user = await User.create({
        name: 'Test User',
        email: 'test@boxtrack.internal',
        password: 'test123456',
        role: 'operator',
      });
    }
    userId = user._id;
    token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    );
  });

  // Cleanup: Delete test data
  afterAll(async () => {
    await Challan.deleteMany({ createdBy: userId });
    await User.deleteOne({ email: 'test@boxtrack.internal' });
  });

  // ═══════════════════════════════════════════════════════════════════════════════
  // Test: Create Challan
  // ═══════════════════════════════════════════════════════════════════════════════
  describe('POST /api/challan', () => {
    test('should create a challan with valid data', async () => {
      const challanData = {
        challanNo: 'CH-001-' + Date.now(),
        mS: 'XYZ Company',
        transporterId: 'TR-123',
        courierPartner: 'FedEx',
        pickupDate: new Date('2024-03-19').toISOString(),
        lotNo: 'LOT-10',
        numberOfBoxes: 16,
        products: [
          { srNo: 1, nameOfProduct: 'Widget A', quantity: 70 },
          { srNo: 2, nameOfProduct: 'Widget B', quantity: 50 },
        ],
      };

      const response = await request(app)
        .post('/api/challan')
        .set('Authorization', `Bearer ${token}`)
        .send(challanData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.challan).toBeDefined();
      expect(response.body.challan.challanNo).toBe(challanData.challanNo);
      expect(response.body.challan.totalQuantity).toBe(120); // Auto-calculated

      challanId = response.body.challan._id;
    });

    test('should reject challan without number', async () => {
      const invalidData = {
        mS: 'XYZ Company',
        products: [],
      };

      const response = await request(app)
        .post('/api/challan')
        .set('Authorization', `Bearer ${token}`)
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test('should reject duplicate challan number', async () => {
      const challanNo = 'CH-DUP-' + Date.now();
      const challanData = {
        challanNo,
        mS: 'Company A',
        products: [],
      };

      // First request should succeed
      await request(app)
        .post('/api/challan')
        .set('Authorization', `Bearer ${token}`)
        .send(challanData);

      // Second request with same number should fail
      const response = await request(app)
        .post('/api/challan')
        .set('Authorization', `Bearer ${token}`)
        .send(challanData);

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('already exists');
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════════
  // Test: Get Challan
  // ═══════════════════════════════════════════════════════════════════════════════
  describe('GET /api/challan/:id', () => {
    test('should retrieve a challan by ID', async () => {
      const response = await request(app)
        .get(`/api/challan/${challanId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.challan._id).toBe(challanId.toString());
    });

    test('should return 404 for non-existent challan', async () => {
      const fakeId = '000000000000000000000000';

      const response = await request(app)
        .get(`/api/challan/${fakeId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════════
  // Test: List Challans
  // ═══════════════════════════════════════════════════════════════════════════════
  describe('GET /api/challan', () => {
    test('should list challans with pagination', async () => {
      const response = await request(app)
        .get('/api/challan?page=1&limit=10')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.challans).toBeInstanceOf(Array);
      expect(response.body.page).toBe(1);
      expect(response.body.pages).toBeDefined();
      expect(response.body.total).toBeGreaterThanOrEqual(0);
    });

    test('should require authentication', async () => {
      const response = await request(app)
        .get('/api/challan');

      expect(response.status).toBe(401);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════════
  // Test: Update Challan
  // ═══════════════════════════════════════════════════════════════════════════════
  describe('PUT /api/challan/:id', () => {
    test('should update challan details', async () => {
      const updateData = {
        mS: 'Updated Company Name',
        numberOfBoxes: 20,
        status: 'completed',
      };

      const response = await request(app)
        .put(`/api/challan/${challanId}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.challan.mS).toBe('Updated Company Name');
      expect(response.body.challan.numberOfBoxes).toBe(20);
      expect(response.body.challan.status).toBe('completed');
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════════
  // Test: Export Challan as JSON
  // ═══════════════════════════════════════════════════════════════════════════════
  describe('GET /api/challan/:id/export', () => {
    test('should export challan as structured JSON', async () => {
      const response = await request(app)
        .get(`/api/challan/${challanId}/export`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();

      const { data } = response.body;
      expect(data.header).toBeDefined();
      expect(data.customerInformation).toBeDefined();
      expect(data.shipmentDetails).toBeDefined();
      expect(data.productTable).toBeInstanceOf(Array);
      expect(data.summary).toBeDefined();
      expect(data.metadata).toBeDefined();
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════════
  // Test: Delete Challan
  // ═══════════════════════════════════════════════════════════════════════════════
  describe('DELETE /api/challan/:id', () => {
    test('should delete a challan', async () => {
      // Create a new challan to delete
      const challanData = {
        challanNo: 'CH-DEL-' + Date.now(),
        mS: 'Delete Test',
        products: [],
      };

      const createResponse = await request(app)
        .post('/api/challan')
        .set('Authorization', `Bearer ${token}`)
        .send(challanData);

      const idToDelete = createResponse.body.challan._id;

      // Delete it
      const deleteResponse = await request(app)
        .delete(`/api/challan/${idToDelete}`)
        .set('Authorization', `Bearer ${token}`);

      expect(deleteResponse.status).toBe(200);
      expect(deleteResponse.body.success).toBe(true);

      // Verify it's gone
      const getResponse = await request(app)
        .get(`/api/challan/${idToDelete}`)
        .set('Authorization', `Bearer ${token}`);

      expect(getResponse.status).toBe(404);
    });
  });
});
