# Challan API Documentation

## Overview

The Challan API provides comprehensive CRUD (Create, Read, Update, Delete) operations for managing warehouse delivery/shipment documents. A Challan is a structured document containing shipment details, product information, and quantity tracking.

## Base URL

```
/api/challan
```

## Authentication

All endpoints require authentication via JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

Tokens are obtained through the `/api/auth/login` endpoint and should be included in every request.

---

## API Endpoints

### 1. Create Challan
**POST** `/api/challan`

Creates a new challan document with shipment and product information.

#### Request Body

```json
{
  "challanNo": "CH-001-2024",
  "customerDetail": "Regular Customer",
  "mS": "XYZ Company Ltd.",
  "transporterId": "TR-123",
  "courierPartner": "FedEx",
  "pickupDate": "2024-03-19T00:00:00Z",
  "lotNo": "LOT-10",
  "numberOfBoxes": 16,
  "products": [
    {
      "srNo": 1,
      "nameOfProduct": "Widget A",
      "quantity": 70
    },
    {
      "srNo": 2,
      "nameOfProduct": "Widget B",
      "quantity": 50
    }
  ],
  "notes": "Fragile items - handle with care"
}
```

#### Request Parameters

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `challanNo` | String | Yes | Unique identifier for the challan (max 50 chars) |
| `customerDetail` | String | No | Customer information (max 200 chars) |
| `mS` | String | No | M/S - Business/Company name (max 100 chars) |
| `transporterId` | String | No | ID of the transporter (max 50 chars) |
| `courierPartner` | String | No | Courier service name (max 100 chars) |
| `pickupDate` | Date | No | Date of pickup (ISO 8601 format) |
| `lotNo` | String | No | Lot/Batch number (max 50 chars) |
| `numberOfBoxes` | Number | No | Count of boxes in shipment (min 0) |
| `products` | Array | No | Array of product objects |
| `products[].srNo` | Number | Yes | Serial number (min 1) |
| `products[].nameOfProduct` | String | Yes | Product name (max 200 chars) |
| `products[].quantity` | Number | Yes | Quantity (min 0) |
| `notes` | String | No | Additional notes (max 1000 chars) |

#### Response (Success - 201)

```json
{
  "success": true,
  "message": "Challan created successfully",
  "challan": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "challanNo": "CH-001-2024",
    "customerDetail": "Regular Customer",
    "mS": "XYZ Company Ltd.",
    "transporterId": "TR-123",
    "courierPartner": "FedEx",
    "pickupDate": "2024-03-19T00:00:00.000Z",
    "lotNo": "LOT-10",
    "numberOfBoxes": 16,
    "products": [
      {
        "srNo": 1,
        "nameOfProduct": "Widget A",
        "quantity": 70
      },
      {
        "srNo": 2,
        "nameOfProduct": "Widget B",
        "quantity": 50
      }
    ],
    "totalQuantity": 120,
    "status": "active",
    "createdBy": "65a0a1b2c3d4e5f6g7h8i9j0",
    "createdAt": "2024-03-19T10:30:00.000Z",
    "updatedAt": "2024-03-19T10:30:00.000Z"
  }
}
```

#### Response (Validation Error - 400)

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    "Challan number is required",
    "Product quantity must not be negative"
  ]
}
```

#### Response (Duplicate - 400)

```json
{
  "success": false,
  "message": "Challan number already exists"
}
```

---

### 2. Get Single Challan
**GET** `/api/challan/:id`

Retrieves a specific challan by its MongoDB ObjectId.

#### URL Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | String | MongoDB ObjectId of the challan |

#### Response (Success - 200)

```json
{
  "success": true,
  "challan": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "challanNo": "CH-001-2024",
    "customerDetail": "Regular Customer",
    "mS": "XYZ Company Ltd.",
    "totalQuantity": 120,
    "status": "active",
    "createdAt": "2024-03-19T10:30:00.000Z",
    "updatedAt": "2024-03-19T10:30:00.000Z"
  }
}
```

#### Response (Not Found - 404)

```json
{
  "success": false,
  "message": "Challan not found"
}
```

---

### 3. List All Challans
**GET** `/api/challan`

Retrieves paginated list of all challans created by the current user.

#### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | Number | 1 | Page number for pagination |
| `limit` | Number | 20 | Number of results per page |

#### Example Request

```
GET /api/challan?page=1&limit=10
```

#### Response (Success - 200)

```json
{
  "success": true,
  "total": 45,
  "page": 1,
  "pages": 5,
  "challans": [
    {
      "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
      "challanNo": "CH-001-2024",
      "customerDetail": "Regular Customer",
      "mS": "XYZ Company Ltd.",
      "totalQuantity": 120,
      "status": "active",
      "createdAt": "2024-03-19T10:30:00.000Z"
    },
    {
      "_id": "65a1b2c3d4e5f6g7h8i9j0k2",
      "challanNo": "CH-002-2024",
      "customerDetail": "VIP Customer",
      "mS": "ABC Industries",
      "totalQuantity": 85,
      "status": "completed",
      "createdAt": "2024-03-18T14:20:00.000Z"
    }
  ]
}
```

---

### 4. Update Challan
**PUT** `/api/challan/:id`

Updates specific fields of an existing challan document.

#### URL Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | String | MongoDB ObjectId of the challan |

#### Request Body (all fields optional)

```json
{
  "mS": "Updated Company Name",
  "numberOfBoxes": 20,
  "products": [
    {
      "srNo": 1,
      "nameOfProduct": "Widget A (Updated)",
      "quantity": 75
    }
  ],
  "status": "completed",
  "notes": "Updated delivery notes"
}
```

#### Response (Success - 200)

```json
{
  "success": true,
  "message": "Challan updated successfully",
  "challan": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "challanNo": "CH-001-2024",
    "mS": "Updated Company Name",
    "numberOfBoxes": 20,
    "totalQuantity": 75,
    "status": "completed",
    "notes": "Updated delivery notes",
    "updatedAt": "2024-03-19T11:45:00.000Z"
  }
}
```

#### Response (Authorization Error - 403)

```json
{
  "success": false,
  "message": "Not authorized to update this challan"
}
```

---

### 5. Export Challan as JSON
**GET** `/api/challan/:id/export`

Exports challan data in a structured JSON format suitable for reports and integration.

#### URL Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | String | MongoDB ObjectId of the challan |

#### Response (Success - 200)

```json
{
  "success": true,
  "data": {
    "header": {
      "challanNo": "CH-001-2024",
      "customerDetail": "Regular Customer"
    },
    "customerInformation": {
      "businessName": "XYZ Company Ltd.",
      "transporterId": "TR-123",
      "courierPartner": "FedEx"
    },
    "shipmentDetails": {
      "pickupDate": "2024-03-19",
      "lotNo": "LOT-10",
      "numberOfBoxes": 16
    },
    "productTable": [
      {
        "srNo": 1,
        "nameOfProduct": "Widget A",
        "quantity": 70
      },
      {
        "srNo": 2,
        "nameOfProduct": "Widget B",
        "quantity": 50
      }
    ],
    "summary": {
      "totalQuantity": 120
    },
    "metadata": {
      "status": "active",
      "createdBy": {
        "name": "John Operator",
        "email": "john@boxtrack.internal"
      },
      "createdAt": "2024-03-19T10:30:00.000Z",
      "updatedAt": "2024-03-19T10:30:00.000Z",
      "notes": "Fragile items - handle with care"
    }
  }
}
```

---

### 6. Delete Challan
**DELETE** `/api/challan/:id`

Permanently deletes a challan document.

#### URL Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | String | MongoDB ObjectId of the challan |

#### Response (Success - 200)

```json
{
  "success": true,
  "message": "Challan deleted successfully"
}
```

#### Response (Not Found - 404)

```json
{
  "success": false,
  "message": "Challan not found"
}
```

---

## Frontend Integration Examples

### Using React with axios

```javascript
import { challanAPI } from '../services/api';

// Create a challan
const createNewChallan = async () => {
  try {
    const response = await challanAPI.create({
      challanNo: 'CH-001-2024',
      mS: 'XYZ Company',
      products: [
        { srNo: 1, nameOfProduct: 'Item A', quantity: 100 }
      ]
    });
    console.log('Created:', response.data.challan);
  } catch (error) {
    console.error('Error:', error.response.data);
  }
};

// List all challans
const loadChallans = async () => {
  try {
    const response = await challanAPI.list(1, 20);
    console.log('Challans:', response.data.challans);
  } catch (error) {
    console.error('Error:', error);
  }
};

// Get single challan
const getChallanDetails = async (challanId) => {
  try {
    const response = await challanAPI.getById(challanId);
    console.log('Details:', response.data.challan);
  } catch (error) {
    console.error('Error:', error);
  }
};

// Update challan
const updateChallanStatus = async (challanId) => {
  try {
    const response = await challanAPI.update(challanId, {
      status: 'completed'
    });
    console.log('Updated:', response.data.challan);
  } catch (error) {
    console.error('Error:', error);
  }
};

// Export as JSON
const exportChallanData = async (challanId) => {
  try {
    const response = await challanAPI.exportJSON(challanId);
    console.log('Exported data:', response.data.data);
  } catch (error) {
    console.error('Error:', error);
  }
};
```

---

## Schema Structure

### Challan Document

```javascript
{
  _id: ObjectId,
  
  // Header Section
  challanNo: String (unique, max 50),
  customerDetail: String (max 200),
  
  // Customer Information Section
  mS: String (max 100),
  transporterId: String (max 50),
  courierPartner: String (max 100),
  
  // Shipment Details Section
  pickupDate: Date,
  lotNo: String (max 50),
  numberOfBoxes: Number,
  
  // Products Section
  products: [{
    srNo: Number,
    nameOfProduct: String (max 200),
    quantity: Number
  }],
  
  // Summary Section
  totalQuantity: Number (auto-calculated),
  
  // Metadata
  status: String (enum: ['active', 'completed', 'cancelled']),
  notes: String (max 1000),
  sessionId: ObjectId (ref: 'Session'),
  createdBy: ObjectId (ref: 'User'),
  createdAt: Date,
  updatedAt: Date
}
```

---

## Error Handling

All error responses follow this format:

```json
{
  "success": false,
  "message": "Error description",
  "errors": ["Detailed error 1", "Detailed error 2"]
}
```

### Common HTTP Status Codes

- **200 OK** - Request successful
- **201 Created** - Resource created successfully
- **400 Bad Request** - Validation error or invalid input
- **401 Unauthorized** - Missing or invalid JWT token
- **403 Forbidden** - User lacks permission to perform action
- **404 Not Found** - Resource not found
- **500 Internal Server Error** - Server error

---

## Validation Rules

### Challan Number
- **Required**: Yes
- **Type**: String
- **Max Length**: 50 characters
- **Uniqueness**: Must be unique in database

### Product Objects
- **srNo**: Required, must be ≥ 1
- **nameOfProduct**: Required, max 200 characters
- **quantity**: Required, must be ≥ 0

### Status Values
- `active` - Challan is active/in-transit
- `completed` - Shipment delivered
- `cancelled` - Challan cancelled

---

## Testing

Run tests using:

```bash
npm test -- challan.test.js
```

Test file: `backend/tests/challan.test.js`

---

## Rate Limiting

All API endpoints are subject to rate limiting. Default limits:
- 100 requests per 15 minutes per IP address

---

## Future Enhancements

- [ ] Challan document upload/scanning with OCR
- [ ] PDF export functionality
- [ ] Batch challan creation from CSV
- [ ] Automated email notifications
- [ ] Integration with shipping providers APIs
- [ ] Real-time tracking updates
- [ ] Advanced filtering and search
- [ ] Barcode/QR code generation

---

## Support

For issues or questions:
1. Check the test file for usage examples
2. Review validation schemas in `validation/challanValidation.js`
3. Consult the server logs for detailed error messages
