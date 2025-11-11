# WebSocket Testing (Postman)

## Steps
1. Obtain `accessToken` via REST login/register
2. New WebSocket request: `ws://localhost:3000`
3. Add header `Authorization: Bearer <accessToken>`
4. Connect → expect `CONNECTED`
5. Send `status:get` event (optional) → expect `status:current`
6. Update presence via REST → expect `PRESENCE_UPDATE`

## Tips
- Ensure Redis is running
- Verify Pub/Sub subscription by watching logs


