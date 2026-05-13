const autocannon = require('autocannon');

async function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function runPerfTest() {

    console.log("Starting Performance Test Setup...");

    const API_BASE_URL = 'http://localhost:5500';

    // Existing DB user credentials
    const identifier = "tej@gmail.com";
    const password = "123";
    const userType = "Farmer";

    let token = "";

    // Wait for server + MongoDB to become fully ready
    console.log("Waiting for server startup...");
    await delay(10000);

    try {

        console.log(`Attempting login at ${API_BASE_URL}/api/auth/login...`);

        const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                identifier,
                password,
                userType
            })
        });

        const data = await response.json();

        console.log("Login Response:", data);

        if (!response.ok) {
            throw new Error(data.message || 'Unknown error');
        }

        token = data.token;

        console.log("Successfully obtained JWT token!");

    } catch (error) {

        console.error("Failed to authenticate for performance testing:", error);

        process.exit(1);
    }

    const targetUrl = `${API_BASE_URL}/api/bookings`;

    console.log(`Running autocannon against ${targetUrl}...`);

    const instance = autocannon({
        url: targetUrl,
        connections: 50,
        duration: 20,
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    autocannon.track(instance, {
        renderProgressBar: true
    });

    instance.on('done', (result) => {

        console.log("\n--- Performance Test Completed ---");

        console.log(autocannon.printResult(result));

        if (result.errors > 50) {

            console.error("Too many errors during performance test.");

            process.exit(1);
        }
    });
}

runPerfTest();