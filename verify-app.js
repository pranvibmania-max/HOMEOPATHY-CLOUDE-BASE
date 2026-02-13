const https = require('http');

async function testEndpoint(name, path, method = 'GET', body = null) {
    process.stdout.write(`Testing ${name} (${method} ${path})... `);

    return new Promise((resolve) => {
        const options = {
            hostname: 'localhost',
            port: 3000,
            path: encodeURI(path),
            method: method,
            headers: body ? {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(JSON.stringify(body))
            } : {}
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    process.stdout.write('✓ SUCCESS\n');
                    try {
                        const json = JSON.parse(data);
                        resolve({ name, success: true, data: json });
                    } catch (e) {
                        resolve({ name, success: true, data });
                    }
                } else {
                    process.stdout.write(`✖ FAILED (${res.statusCode})\n`);
                    console.error('  Response:', data);
                    resolve({ name, success: false, error: data });
                }
            });
        });

        req.on('error', (e) => {
            process.stdout.write(`✖ ERROR: ${e.message}\n`);
            resolve({ name, success: false, error: e.message });
        });

        if (body) {
            req.write(JSON.stringify(body));
        }
        req.end();
    });
}

async function runTests() {
    console.log('\n--- STARTING APP VERIFICATION ---\n');

    const results = [];

    // 1. Health check
    results.push(await testEndpoint('Health Check', '/health'));

    // 2. Symptoms
    results.push(await testEndpoint('Get Symptoms', '/symptoms'));
    results.push(await testEndpoint('Search Symptoms', '/symptoms?q=head'));

    // 3. Remedies
    results.push(await testEndpoint('Get Remedies', '/remedies'));
    results.push(await testEndpoint('Search Remedies', '/remedies?q=arnica'));
    results.push(await testEndpoint('Remedy Details', '/remedy/Arnica Montana'));

    // 4. Analysis
    results.push(await testEndpoint('Analyze Symptoms', '/analyze', 'POST', {
        symptoms: ['headache', 'fever']
    }));

    // 5. Cases
    results.push(await testEndpoint('Get Cases', '/cases'));

    // 6. Save Case
    results.push(await testEndpoint('Save Case', '/save', 'POST', {
        name: 'Test Patient',
        age: 30,
        gender: 'Male',
        mobile: '1234567890',
        complaint: 'Testing the app',
        symptoms: ['test symptom'],
        prescription: 'Rest and water'
    }));

    // 7. Stats
    results.push(await testEndpoint('Stats', '/stats'));

    console.log('\n--- VERIFICATION SUMMARY ---');
    const passed = results.filter(r => r.success).length;
    const total = results.length;
    console.log(`${passed}/${total} tests passed.`);

    if (passed === total) {
        console.log('\n✨ ALL SYSTEMS OPERATIONAL ✨\n');
    } else {
        console.log('\n⚠️ SOME TESTS FAILED ⚠️\n');
    }
}

runTests();
