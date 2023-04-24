import https from 'https';

export function fetch(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (response) => {
            let data = "";

            // A chunk of data has been received.
            response.on('data', (chunk) => {
                data += chunk;
            });

            // The whole response has been received.
            response.on('end', () => {
                resolve(JSON.parse(data));
            });

        }).on('error', (error) => {
            reject(error);
        });
    });
}
