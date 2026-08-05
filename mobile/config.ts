// Always talk to the hosted Render backend — in dev, in the browser, and in
// standalone builds alike — so there's no machine-specific LAN IP to keep in
// sync and testing always hits the same real data.
export const API_BASE = 'https://simfinity-backend-a06f.onrender.com';
