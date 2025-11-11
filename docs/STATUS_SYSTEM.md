# Status System

## Dual-Status Model
- Connection Status (actual): ONLINE/OFFLINE from sockets → Redis `presence:online:{userId}`
- Display Status (user choice): ONLINE/IDLE/DND/Invisible → Redis `display:status:{userId}`

## Effective Status
- If offline → `Invisible`
- If online → display status or `ONLINE`

## Examples
- User online + sets IDLE → IDLE
- User online + sets Invisible → Invisible (appears offline)
- User disconnects → Invisible


