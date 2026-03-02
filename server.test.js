const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

const request = require('supertest');
const app = require('./server');
const { connectDB, client } = require('./db');

describe('AgriConnect API Endpoints', () => {

    // Variables to store generated IDs for our testing pipeline
    let testFarmerId;
    let testBuyerId;
    let testCSOwnerId;
    let testCropId;
    let testBidId;
    let testStorageId;

    beforeAll(async () => {
        await connectDB();
    });

    it('should return a 200 OK status for health check', async () => {
        const res = await request(app).get('/health');
        expect(res.statusCode).toEqual(200);
    });

    // --- FARMER API TESTS ---
    describe('Farmer API', () => {
        it('should register a new farmer (POST)', async () => {
            const newFarmer = { name: "Ramesh Kumar", contact: "9876543210", email: "ramesh.test@example.com", password: "securepassword123", no_of_acres: 5, address: { d_no: "4-45/2", village: "Annavaram", mandal: "Sankhavaram", district: "Kakinada", state: "Andhra Pradesh", pincode: "533406" } };
            const res = await request(app).post('/api/farmers').send(newFarmer);
            expect(res.statusCode).toEqual(201);
            testFarmerId = res.body.farmerId;
        });
        it('should fetch all farmers (GET /)', async () => {
            const res = await request(app).get('/api/farmers');
            expect(res.statusCode).toEqual(200);
        });
        it('should fetch a single farmer by ID (GET /:id)', async () => {
            const res = await request(app).get(`/api/farmers/${testFarmerId}`);
            expect(res.statusCode).toEqual(200);
        });
        it('should update a farmer by ID (PUT /:id)', async () => {
            const res = await request(app).put(`/api/farmers/${testFarmerId}`).send({ no_of_acres: 10 });
            expect(res.statusCode).toEqual(200);
        });
        it('should delete a farmer by ID (DELETE /:id)', async () => {
            const res = await request(app).delete(`/api/farmers/${testFarmerId}`);
            expect(res.statusCode).toEqual(200);
        });
    });

    // --- BUYER API TESTS ---
    describe('Buyer API', () => {
        it('should register a new buyer (POST)', async () => {
            const newBuyer = { name: "Ravi Kumar", contact: "9293472399", email: "ravi.test@example.com", password: "securepassword123", address: { d_no: "12-3B", village: "Velangi", mandal: "Pithapuram", district: "Kakinada", state: "Andhra Pradesh", pincode: "533450" } };
            const res = await request(app).post('/api/buyers').send(newBuyer);
            expect(res.statusCode).toEqual(201);
            testBuyerId = res.body.buyerId;
        });
        it('should fetch all buyers (GET /)', async () => {
            const res = await request(app).get('/api/buyers');
            expect(res.statusCode).toEqual(200);
        });
        it('should fetch a single buyer by ID (GET /:id)', async () => {
            const res = await request(app).get(`/api/buyers/${testBuyerId}`);
            expect(res.statusCode).toEqual(200);
        });
        it('should update a buyer by ID (PUT /:id)', async () => {
            const res = await request(app).put(`/api/buyers/${testBuyerId}`).send({ contact: "9999999999" });
            expect(res.statusCode).toEqual(200);
        });
        it('should delete a buyer by ID (DELETE /:id)', async () => {
            const res = await request(app).delete(`/api/buyers/${testBuyerId}`);
            expect(res.statusCode).toEqual(200);
        });
    });

    // --- CS OWNER API TESTS ---
    describe('CS Owner API', () => {
        it('should return a new cold storage owner (POST)', async () => {
            const newCSOwner = { name: "Madhav", contact: "9934561245", email: "madhav.test@example.com", password: "securePassword123" }
            const res = await request(app).post('/api/cs_owners').send(newCSOwner);
            expect(res.statusCode).toEqual(201);
            testCSOwnerId = res.body.cs_ownerId;
        });
        it('should fetch all CS owners (GET /)', async () => {
            const res = await request(app).get('/api/cs_owners');
            expect(res.statusCode).toEqual(200);
        });
        it('should fetch a single CS owner by ID (GET /:id)', async () => {
            const res = await request(app).get(`/api/cs_owners/${testCSOwnerId}`);
            expect(res.statusCode).toEqual(200);
        });
        it('should update a CS owner by ID (PUT /:id)', async () => {
            const res = await request(app).put(`/api/cs_owners/${testCSOwnerId}`).send({ name: "Madhav Updated" });
            expect(res.statusCode).toEqual(200);
        });
        it('should delete a CS owner by ID (DELETE /:id)', async () => {
            const res = await request(app).delete(`/api/cs_owners/${testCSOwnerId}`);
            expect(res.statusCode).toEqual(200);
        });
    });

    // --- CROP API TESTS ---
    describe('Crop API', () => {
        it('should list a new crop (POST)', async() => {
            const res = await request(app).post('/api/crops').send({ farmerId: "Dummy farmer ID 123", crop_name: "Test rice", quantity: 50, expected_price: 25000 });
            expect(res.statusCode).toEqual(201);
            testCropId = res.body.cropId; 
        });
        it('should fetch all crops (GET /)', async () => {
            const res = await request(app).get('/api/crops');
            expect(res.statusCode).toEqual(200);
        });
        it('should fetch a single crop by ID (GET /:id)', async () => {
            const res = await request(app).get(`/api/crops/${testCropId}`);
            expect(res.statusCode).toEqual(200);
        });
        it('should update a crop by ID (PUT /:id)', async () => {
            const res = await request(app).put(`/api/crops/${testCropId}`).send({ expected_price: 26000 });
            expect(res.statusCode).toEqual(200);
        });
        it('should delete a crop by ID (DELETE /:id)', async () => {
            const res = await request(app).delete(`/api/crops/${testCropId}`);
            expect(res.statusCode).toEqual(200);
        });
    });

    // --- BID API TESTS ---
    describe('Bid API', () => {
        it('should register a new bid (POST)', async() => {
            const res = await request(app).post('/api/bids').send({ buyerId: "Dummy buyer 123", cropId: "Dummy crop id", bid_amount: 50000 });
            expect(res.statusCode).toEqual(201);
            testBidId = res.body.bidId;
        });
        it('should fetch all bids (GET /)', async () => {
            const res = await request(app).get('/api/bids');
            expect(res.statusCode).toEqual(200);
        });
        it('should fetch a single bid by ID (GET /:id)', async () => {
            const res = await request(app).get(`/api/bids/${testBidId}`);
            expect(res.statusCode).toEqual(200);
        });
        it('should update a bid by ID (PUT /:id)', async () => {
            const res = await request(app).put(`/api/bids/${testBidId}`).send({ bid_amount: 55000, status: "Accepted" });
            expect(res.statusCode).toEqual(200);
        });
        it('should delete a bid by ID (DELETE /:id)', async () => {
            const res = await request(app).delete(`/api/bids/${testBidId}`);
            expect(res.statusCode).toEqual(200);
        });
    });

    // --- COLD STORAGE API TESTS ---
    describe('Cold Storage API', () => {
        it("should return a new cold storage (POST)", async() => {
            const res = await request(app).post('/api/cold-storages').send({ cs_ownerId: "Dummy cs owner 123", name: "wisdom cold storage", available_capacity: 500, price_per_ton: 1500 });
            expect(res.statusCode).toEqual(201);
            testStorageId = res.body.storageId;
        });
        it('should fetch all cold storages (GET /)', async () => {
            const res = await request(app).get('/api/cold-storages');
            expect(res.statusCode).toEqual(200);
        });
        it('should fetch a single cold storage by ID (GET /:id)', async () => {
            const res = await request(app).get(`/api/cold-storages/${testStorageId}`);
            expect(res.statusCode).toEqual(200);
        });
        it('should update a cold storage by ID (PUT /:id)', async () => {
            const res = await request(app).put(`/api/cold-storages/${testStorageId}`).send({ available_capacity: 450 });
            expect(res.statusCode).toEqual(200);
        });
        it('should delete a cold storage by ID (DELETE /:id)', async () => {
            const res = await request(app).delete(`/api/cold-storages/${testStorageId}`);
            expect(res.statusCode).toEqual(200);
        });
    });

    afterAll(async () => {
        // Failsafe cleanup: Just in case a test fails before hitting the DELETE endpoints, 
        // this ensures our database stays clean for the next test run.
        await client.db("AgriDB").collection("farmers").deleteMany({ email: "ramesh.test@example.com" });
        await client.db("AgriDB").collection('buyers').deleteMany({ email: "ravi.test@example.com"});
        await client.db("AgriDB").collection('cs_owners').deleteMany({ email: "madhav.test@example.com"});
        await client.db("AgriDB").collection('Crops').deleteMany({ farmerId: "Dummy farmer ID 123"});
        await client.db("AgriDB").collection('cold storages').deleteMany({cs_ownerId: "Dummy cs owner 123"});
        await client.db("AgriDB").collection('bids').deleteMany({buyerId: "Dummy buyer 123"});
        
        await client.close();
    });
});