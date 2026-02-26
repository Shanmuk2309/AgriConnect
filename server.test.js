const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

const request = require('supertest');
const app = require('./server');
const { connectDB, client } = require('./db');

describe('Health Endpoint', () => {

    beforeAll(async () => {
        await connectDB();
    });

    it('should return a 200 OK status', async () => {
        const res = await request(app).get('/health');
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('status', 'Server is healthy');
    });

    it('should register a new farmer in the database', async () => {
        const newFarmer = {
            name: "Ramesh Kumar",
            contact: "9876543210",
            email: "ramesh.test@example.com",
            password: "securepassword123",
            no_of_acres: 5,
            address: {
                d_no: "4-45/2",
                village: "Annavaram",
                mandal: "Sankhavaram",
                district: "Kakinada",
                state: "Andhra Pradesh",
                pincode: "533406"
            }
        };

        const res = await request(app)
            .post('/api/farmers')
            .send(newFarmer);

        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('message', 'Registration Successful');
        expect(res.body).toHaveProperty('farmerId');
    });

    it('should register a new buyer in the database', async () => {
        const newBuyer = {
            name: "Ravi Kumar",
            contact: "9293472399",
            email: "ravi.test@example.com",
            password: "securepassword123",
            address: {
                d_no: "12-3B",
                village: "Velangi",
                mandal: "Pithapuram",
                district: "Kakinada",
                state: "Andhra Pradesh",
                pincode: "533450"
            }
        };

        const res = await request(app)
            .post('/api/buyers')
            .send(newBuyer);
            

        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('message', 'Registration Successful');
        expect(res.body).toHaveProperty('buyerId');
    });

    it('should return a new cold storage owner in the database', async () => {
        const newCSOwner = {
            name: "Madhav",
            contact: "9934561245",
            email: "madhav.test@example.com",
            password: "securePassword123"
        }

        const res = await request(app)
            .post('/api/cs_owners')
            .send(newCSOwner);

        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('message', 'Registration Successful');
        expect(res.body).toHaveProperty('cs_ownerId');
    });

    it('should list a new crop in the database', async() => {
        const newCrop = {
            farmerId: "Dummy farmer ID 123",
            crop_name: "Test rice",
            quantity: 50,
            expected_price: 25000
        }

        const res = await request(app).post('/api/crops').send(newCrop);

        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('message', 'Crop listed successfully');
        expect(res.body).toHaveProperty('cropId');
    })

    it('should register a new bid in the database', async() => {
        const newBid = {
            buyerId: "Dummy buyer 123",
            cropId: "Dummy crop id",
            bid_amount: 50000
        }

        const res = await request(app).post('/api/bids').send(newBid);

        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('message', 'Bid placed successfully');
        expect(res.body).toHaveProperty('bidId');
    })

    it("should return a new cold storage in the database", async() => {
        const newCS = {
            cs_ownerId: "Dummy cs owner 123",
            name: "wisdom cold storage",
            available_capacity: 500,
            price_per_ton: 1500,
            address: {
                d_no: "8-12-45",
                street: "Market Yard Road",
                village: "Nallapadu",
                mandal: "Guntur",
                district: "Guntur",
                state: "Andhra Pradesh",
                pincode: "522005"
            }
        }

        const res = await request(app).post('/api/cold-storages').send(newCS);

        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('message', 'Cold storage added successfully');
        expect(res.body).toHaveProperty('storageId');
    })

    afterAll(async () => {
        await client.db("AgriDB").collection("farmers").deleteOne({ email: "ramesh.test@example.com" });
        await client.db("AgriDB").collection('buyers').deleteOne({ email: "ravi.test@example.com"});
        await client.db("AgriDB").collection('cs_owners').deleteOne({ email: "madhav.test@example.com"});
        await client.db("AgriDB").collection('Crops').deleteOne({ farmerId: "Dummy farmer ID 123"});
        await client.db("AgriDB").collection('cold storages').deleteOne({cs_ownerId: "Dummy cs owner 123"});
        await client.db("AgriDB").collection('bids').deleteOne({cs_ownerId: "Dummy cs owner 123"});
        await client.close();
    });
});