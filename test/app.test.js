const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createServer } = require('../app');

async function startTestServer(t) {
    const server = createServer();

    await new Promise((resolve, reject) => {
        server.once('error', reject);
        server.listen(0, '127.0.0.1', resolve);
    });

    t.after(() => new Promise((resolve, reject) => {
        server.close((error) => {
            if (error) {
                reject(error);
            } else {
                resolve();
            }
        });
    }));

    const address = server.address();

    return `http://127.0.0.1:${address.port}`;
}

test('GET / returns the application welcome message', async (t) => {
    const baseUrl = await startTestServer(t);
    const response = await fetch(`${baseUrl}/`);
    const body = await response.text();

    assert.equal(response.status, 200);
    assert.match(body, /Jenkins Advanced CI\/CD Demo/);
});

test('GET /health returns an OK health status', async (t) => {
    const baseUrl = await startTestServer(t);
    const response = await fetch(`${baseUrl}/health`);
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.deepEqual(body, { status: 'ok' });
});