---
id: player-setup-disconnect-event
title: PlayerSetupDisconnectEvent
sidebar_label: PlayerSetupDisconnectEvent
---

# PlayerSetupDisconnectEvent

Fired when a player disconnects during the connection setup phase, before they have fully connected to the server. This occurs when a connection attempt fails or is cancelled during the early authentication and setup process.

## Event Information

| Property | Value |
|----------|-------|
| **Full Class Name** | `com.hypixel.hytale.server.core.event.events.player.PlayerSetupDisconnectEvent` |
| **Parent Class** | `IEvent<Void>` |
| **Cancellable** | No |
| **Async** | No |
| **Source File** | `decompiled/com/hypixel/hytale/server/core/event/events/player/PlayerSetupDisconnectEvent.java:9` |

## Declaration

```java
public class PlayerSetupDisconnectEvent implements IEvent<Void> {
```

## Fields

| Field | Type | Accessor | Description |
|-------|------|----------|-------------|
| `username` | `String` | `getUsername()` | The username of the disconnecting player |
| `uuid` | `UUID` | `getUuid()` | The UUID of the disconnecting player |
| `auth` | `PlayerAuthentication` | `getAuth()` | Authentication information for the player |
| `disconnectReason` | `PacketHandler.DisconnectReason` | `getDisconnectReason()` | The reason for the disconnection |

## Methods

| Method | Signature | Description |
|--------|-----------|-------------|
| `getUsername` | `public String getUsername()` | Returns the player's username |
| `getUuid` | `public UUID getUuid()` | Returns the player's UUID |
| `getAuth` | `public PlayerAuthentication getAuth()` | Returns authentication information |
| `getDisconnectReason` | `public PacketHandler.DisconnectReason getDisconnectReason()` | Returns why the player disconnected |
| `toString` | `@Nonnull public String toString()` | Returns a string representation of this event |

## Usage Example

```java
// Register a handler for setup disconnections
eventBus.register(PlayerSetupDisconnectEvent.class, event -> {
    String username = event.getUsername();
    UUID uuid = event.getUuid();
    PacketHandler.DisconnectReason reason = event.getDisconnectReason();

    // Log the failed connection attempt
    logger.info("Player " + username + " failed to connect: " + reason);

    // Track failed connections for security
    trackFailedConnection(uuid, reason);
});

// Monitor for potential attacks
eventBus.register(PlayerSetupDisconnectEvent.class, event -> {
    PacketHandler.DisconnectReason reason = event.getDisconnectReason();

    // Check for suspicious activity
    if (reason == PacketHandler.DisconnectReason.AUTHENTICATION_FAILED) {
        incrementFailedAuthCount(event.getUuid());

        // Rate limit after too many failures
        if (getFailedAuthCount(event.getUuid()) > 5) {
            temporarilyBlockUuid(event.getUuid());
        }
    }
});

// Analytics and reporting
eventBus.register(PlayerSetupDisconnectEvent.class, event -> {
    // Record connection statistics
    analytics.recordConnectionFailure(
        event.getUsername(),
        event.getUuid(),
        event.getDisconnectReason()
    );
});
```

## Common Use Cases

- Logging failed connection attempts
- Security monitoring and intrusion detection
- Connection analytics and statistics
- Debugging authentication issues
- Tracking server referral/transfer failures
- Rate limiting based on failed connections

## Related Events

- [PlayerSetupConnectEvent](./player-setup-connect-event.md) - Fired during successful connection setup
- [PlayerConnectEvent](./player-connect-event.md) - Fired when a player fully connects
- [PlayerDisconnectEvent](./player-disconnect-event.md) - Fired when a connected player disconnects

## Notes

This event is specifically for disconnections that occur during the setup phase. It is NOT fired when fully connected players disconnect - use [PlayerDisconnectEvent](./player-disconnect-event.md) for that.

Common disconnect reasons during setup include:
- Authentication failures
- Server full (kicked before connecting)
- Whitelist rejections
- Ban enforcement
- Connection timeouts
- Server transfers (redirects to another server)

Since this event is not cancellable, it is primarily used for logging and monitoring purposes.

## Source Reference

`decompiled/com/hypixel/hytale/server/core/event/events/player/PlayerSetupDisconnectEvent.java:9`
