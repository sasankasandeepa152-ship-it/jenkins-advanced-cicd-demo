const http = require('node:http');

function createServer() {
    return http.createServer((request, response) => {
        if (request.url === '/') {
            response.writeHead(200, {
                'Content-Type': 'text/plain; charset=utf-8'
            });

            response.end('Jenkins Advanced CI/CD Demo\n');
            return;
        }

        if (request.url === '/health') {
            response.writeHead(200, {
                'Content-Type': 'application/json; charset=utf-8'
            });

            response.end(JSON.stringify({ status: 'ok' }));
            return;
        }

        response.writeHead(404, {
            'Content-Type': 'text/plain; charset=utf-8'
        });

        response.end('Not Found\n');
    });
}

if (require.main === module) {
    const port = Number(process.env.PORT || 3000);
    const server = createServer();

    server.listen(port, '127.0.0.1', () => {
        console.log(
            `Demo application is running at http://127.0.0.1:${port}`
        );
    });
}

module.exports = { createServer };