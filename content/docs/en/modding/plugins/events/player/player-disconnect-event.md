---
id: player-disconnect-event
title: PlayerDisconnectEvent
sidebar_label: PlayerDisconnectEvent
---

# PlayerDisconnectEvent

Fired when a player disconnects from the server. This event provides information about why the player disconnected and allows plugins to perform cleanup operations.

## Event Information

| Property | Value |
|----------|-------|
| **Full Class Name** | `com.hypixel.hytale.server.core.event.events.player.PlayerDisconnectEvent` |
| **Parent Class** | `PlayerRefEvent<Void>` |
| **Cancellable** | No |
| **Async** | No |
| **Source File** | `decompiled/com/hypixel/hytale/server/core/event/events/player/PlayerDisconnectEvent.java:7` |

## Declaration

```java
public class PlayerDisconnectEvent extends PlayerRefEvent<Void> {
   public PlayerDisconnectEvent(@Nonnull PlayerRef playerRef) {
      super(playerRef);
   }
```

## Fields

| Field | Type | Accessor | Description |
|-------|------|----------|-------------|
| `playerRef` | `PlayerRef` | `getPlayerRef()` | Reference to the disconnecting player (inherited from PlayerRefEvent) |

## Methods

| Method | Signature | Description |
|--------|-----------|-------------|
| `getPlayerRef` | `@Nonnull public PlayerRef getPlayerRef()` | Returns the player reference for the disconnecting player (inherited) |
| `getDisconnectReason` | `@Nonnull public PacketHandler.DisconnectReason getDisconnectReason()` | Returns the reason why the player disconnected |
| `toString` | `@Nonnull public String toString()` | Returns a string representation of this event |

## Usage Example

```java
// Register a handler for when players disconnect
eventBus.register(PlayerDisconnectEvent.class, event -> {
    PlayerRef player = event.getPlayerRef();
    PacketHandler.DisconnectReason reason = event.getDisconnectReason();

    // Log the disconnection
    logger.info("Player " + player.getUsername() + " disconnected: " + reason);

    // Save player data
    savePlayerData(player);

    // Notify other players
    broadcastMessage(player.getUsername() + " has left the server");
});

// Register with late priority for cleanup after other handlers
eventBus.register(EventPriority.LATE, PlayerDisconnectEvent.class, event -> {
    // Perform final cleanup
    cleanupPlayerResources(event.getPlayerRef());
});
```

## Common Use Cases

- Saving player data before they fully disconnect
- Broadcasting leave messages to other players
- Cleaning up player-specific resources and data
- Logging disconnection events for analytics
- Updating player presence or status systems
- Removing players from teams, parties, or other groups

## Related Events

- [PlayerConnectEvent](./player-connect-event.md) - Fired when a player connects
- [PlayerSetupDisconnectEvent](./player-setup-disconnect-event.md) - Fired during early disconnection phase
- [DrainPlayerFromWorldEvent](./drain-player-from-world-event.md) - Fired when removing a player from a world

## Source Reference

`decompiled/com/hypixel/hytale/server/core/event/events/player/PlayerDisconnectEvent.java:7`
