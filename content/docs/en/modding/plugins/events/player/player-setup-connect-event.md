---
id: player-setup-connect-event
title: PlayerSetupConnectEvent
sidebar_label: PlayerSetupConnectEvent
---

# PlayerSetupConnectEvent

Fired during the early connection setup phase when a player is attempting to join the server. This is a cancellable event that allows plugins to validate, reject, or redirect incoming connections before the player fully connects.

## Event Information

| Property | Value |
|----------|-------|
| **Full Class Name** | `com.hypixel.hytale.server.core.event.events.player.PlayerSetupConnectEvent` |
| **Parent Class** | `IEvent<Void>` |
| **Cancellable** | Yes |
| **Async** | No |
| **Source File** | `decompiled/com/hypixel/hytale/server/core/event/events/player/PlayerSetupConnectEvent.java:16` |

## Declaration

```java
public class PlayerSetupConnectEvent implements IEvent<Void>, ICancellable {
   public static final String DEFAULT_REASON = "You have been disconnected from the server!";
```

## Fields

| Field | Type | Accessor | Description |
|-------|------|----------|-------------|
| `packetHandler` | `PacketHandler` | `getPacketHandler()` | The packet handler for this connection |
| `username` | `String` | `getUsername()` | The player's username |
| `uuid` | `UUID` | `getUuid()` | The player's unique identifier |
| `auth` | `PlayerAuthentication` | `getAuth()` | Authentication information for the player |
| `referralData` | `byte[]` | `getReferralData()` | Data passed from a referral server (if any) |
| `referralSource` | `HostAddress` | `getReferralSource()` | The address of the referral server (if any) |
| `cancelled` | `boolean` | `isCancelled()` | Whether the connection has been cancelled |
| `reason` | `String` | `getReason()` | The disconnect reason message |
| `clientReferral` | `ClientReferral` | `getClientReferral()` | Client referral information for server transfers |

## Methods

| Method | Signature | Description |
|--------|-----------|-------------|
| `getPacketHandler` | `public PacketHandler getPacketHandler()` | Returns the connection's packet handler |
| `getUsername` | `public String getUsername()` | Returns the player's username |
| `getUuid` | `public UUID getUuid()` | Returns the player's UUID |
| `getAuth` | `public PlayerAuthentication getAuth()` | Returns authentication info |
| `getReferralData` | `@Nullable public byte[] getReferralData()` | Returns referral data from previous server (nullable) |
| `getReferralSource` | `@Nullable public HostAddress getReferralSource()` | Returns the referral server address (nullable) |
| `isReferralConnection` | `public boolean isReferralConnection()` | Checks if this is a server-to-server transfer |
| `getClientReferral` | `@Nullable public ClientReferral getClientReferral()` | Returns client referral info (nullable) |
| `isCancelled` | `public boolean isCancelled()` | Returns whether the event is cancelled |
| `setCancelled` | `public void setCancelled(boolean cancelled)` | Cancels or uncancels the event |
| `getReason` | `public String getReason()` | Returns the disconnect reason |
| `setReason` | `public void setReason(String reason)` | Sets the disconnect reason message |
| `referToServer` | `public void referToServer(@Nonnull String host, int port)` | Redirects player to another server |
| `referToServer` | `public void referToServer(@Nonnull String host, int port, @Nullable byte[] data)` | Redirects with custom data |
| `toString` | `@Nonnull public String toString()` | Returns a string representation of this event |

## Constants

| Constant | Value | Description |
|----------|-------|-------------|
| `DEFAULT_REASON` | `"You have been disconnected from the server!"` | Default message shown when connection is cancelled |

## Usage Example

```java
// Register a handler for connection setup
eventBus.register(PlayerSetupConnectEvent.class, event -> {
    String username = event.getUsername();
    UUID uuid = event.getUuid();

    // Check if player is banned
    if (isBanned(uuid)) {
        event.setCancelled(true);
        event.setReason("You are banned from this server!");
        return;
    }

    // Check server capacity
    if (getOnlinePlayerCount() >= getMaxPlayers()) {
        if (!isVIP(uuid)) {
            event.setCancelled(true);
            event.setReason("Server is full! VIP members can still join.");
            return;
        }
    }

    // Check whitelist
    if (isWhitelistEnabled() && !isWhitelisted(uuid)) {
        event.setCancelled(true);
        event.setReason("You are not whitelisted on this server.");
        return;
    }

    logger.info("Player " + username + " is connecting...");
});

// Server network load balancing
eventBus.register(EventPriority.FIRST, PlayerSetupConnectEvent.class, event -> {
    // Check if this server is overloaded
    if (getCurrentLoad() > 0.9) {
        // Redirect to another server in the network
        event.referToServer("lobby2.example.com", 25565);
        return;
    }
});

// Handle server transfers
eventBus.register(PlayerSetupConnectEvent.class, event -> {
    if (event.isReferralConnection()) {
        // Player was transferred from another server
        byte[] referralData = event.getReferralData();
        HostAddress source = event.getReferralSource();

        // Process transfer data
        handleServerTransfer(event.getUuid(), referralData, source);
    }
});

// Custom authentication
eventBus.register(EventPriority.EARLY, PlayerSetupConnectEvent.class, event -> {
    PlayerAuthentication auth = event.getAuth();

    // Verify authentication
    if (!verifyAuth(auth)) {
        event.setCancelled(true);
        event.setReason("Authentication failed.");
    }
});
```

## Common Use Cases

- Ban checking and enforcement
- Whitelist systems
- Server capacity management (VIP slots)
- Server network load balancing
- Player redirection and transfers
- Custom authentication systems
- Login rate limiting
- IP-based restrictions
- Maintenance mode implementation

## Related Events

- [PlayerConnectEvent](./player-connect-event.md) - Fired after successful setup, when player fully connects
- [PlayerSetupDisconnectEvent](./player-setup-disconnect-event.md) - Fired if setup phase connection fails
- [PlayerDisconnectEvent](./player-disconnect-event.md) - Fired when a connected player disconnects

## Notes

This event fires very early in the connection process, before the player entity is created. Use this for:
- Connection validation
- Authentication checks
- Server transfers

The `referToServer` methods allow you to redirect players to different servers in a network, passing optional data that will be available on the destination server.

## Source Reference

`decompiled/com/hypixel/hytale/server/core/event/events/player/PlayerSetupConnectEvent.java:16`
