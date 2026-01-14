---
id: drain-player-from-world-event
title: DrainPlayerFromWorldEvent
sidebar_label: DrainPlayerFromWorldEvent
---

# DrainPlayerFromWorldEvent

Fired when a player is being removed from a world. This event allows plugins to modify the player's destination world and transform (position/rotation) when they leave the current world.

## Event Information

| Property | Value |
|----------|-------|
| **Full Class Name** | `com.hypixel.hytale.server.core.event.events.player.DrainPlayerFromWorldEvent` |
| **Parent Class** | `IEvent<String>` |
| **Cancellable** | No |
| **Async** | No |
| **Source File** | `decompiled/com/hypixel/hytale/server/core/event/events/player/DrainPlayerFromWorldEvent.java:10` |

## Declaration

```java
public class DrainPlayerFromWorldEvent implements IEvent<String> {
```

## Fields

| Field | Type | Accessor | Description |
|-------|------|----------|-------------|
| `holder` | `Holder<EntityStore>` | `getHolder()` | The entity holder containing the player's entity store |
| `world` | `World` | `getWorld()` | The world the player is being removed from |
| `transform` | `Transform` | `getTransform()` | The player's transform (position/rotation) for the destination |

## Methods

| Method | Signature | Description |
|--------|-----------|-------------|
| `getHolder` | `public Holder<EntityStore> getHolder()` | Returns the entity holder for the player |
| `getWorld` | `public World getWorld()` | Returns the current world (being left) |
| `getTransform` | `public Transform getTransform()` | Returns the destination transform |
| `setWorld` | `public void setWorld(World world)` | Sets the destination world |
| `setTransform` | `public void setTransform(Transform transform)` | Sets the destination transform |
| `toString` | `@Nonnull public String toString()` | Returns a string representation of this event |

## Usage Example

```java
// Register a handler for when players leave worlds
eventBus.register(DrainPlayerFromWorldEvent.class, event -> {
    World currentWorld = event.getWorld();
    Holder<EntityStore> holder = event.getHolder();

    // Log world exit
    logger.info("Player leaving world: " + currentWorld.getName());

    // Save world-specific data before leaving
    saveWorldProgress(holder, currentWorld);
});

// Redirect players to specific spawn points
eventBus.register(DrainPlayerFromWorldEvent.class, event -> {
    World currentWorld = event.getWorld();

    // Check if leaving a dungeon
    if (isDungeonWorld(currentWorld)) {
        // Send player back to the hub
        World hubWorld = getHubWorld();
        Transform hubSpawn = getHubSpawnPoint();

        event.setWorld(hubWorld);
        event.setTransform(hubSpawn);
    }
});

// Handle minigame exits
eventBus.register(DrainPlayerFromWorldEvent.class, event -> {
    World currentWorld = event.getWorld();
    Holder<EntityStore> holder = event.getHolder();

    if (isMinigameWorld(currentWorld)) {
        // Record minigame statistics
        recordMinigameStats(holder, currentWorld);

        // Return player to lobby
        World lobbyWorld = getMinigameLobby();
        Transform lobbySpawn = getLobbySpawnForPlayer(holder);

        event.setWorld(lobbyWorld);
        event.setTransform(lobbySpawn);
    }
});

// Custom world transfer logic
eventBus.register(DrainPlayerFromWorldEvent.class, event -> {
    Holder<EntityStore> holder = event.getHolder();
    Transform currentTransform = event.getTransform();

    // Check if player has a saved location in the destination world
    World destinationWorld = getPlayerSavedWorld(holder);
    if (destinationWorld != null) {
        Transform savedPosition = getPlayerSavedPosition(holder, destinationWorld);
        if (savedPosition != null) {
            event.setWorld(destinationWorld);
            event.setTransform(savedPosition);
        }
    }
});

// Cleanup and resource management
eventBus.register(EventPriority.LATE, DrainPlayerFromWorldEvent.class, event -> {
    World world = event.getWorld();
    Holder<EntityStore> holder = event.getHolder();

    // Remove player from world-specific systems
    removeFromWorldParty(holder, world);
    removeFromWorldTeam(holder, world);
    cleanupWorldResources(holder, world);

    // Update world population tracking
    decrementWorldPopulation(world);
});
```

## Common Use Cases

- Saving world-specific progress before leaving
- Redirecting players to specific destinations
- Handling minigame or dungeon exits
- Cleaning up world-specific data and resources
- Tracking world population changes
- Custom teleportation and spawn point logic
- Managing world-based parties or teams

## Related Events

- [AddPlayerToWorldEvent](./add-player-to-world-event.md) - Fired when player is added to a world
- [PlayerDisconnectEvent](./player-disconnect-event.md) - Fired when player disconnects
- [RemoveWorldEvent](../world/remove-world-event.md) - Fired when a world is removed

## Event Order

When a player transfers between worlds:

1. **DrainPlayerFromWorldEvent** - Player removed from old world (this event)
2. **AddPlayerToWorldEvent** - Player added to new world

When a player disconnects:

1. **DrainPlayerFromWorldEvent** - Player removed from their current world
2. **PlayerDisconnectEvent** - Player fully disconnected

## Notes

This event cannot be cancelled, but you can control where the player goes by using `setWorld()` and `setTransform()`. The destination can be:
- Another world in the server
- A specific position within the new world
- A spawn point based on custom logic

The `transform` includes both position and rotation data, allowing you to control exactly where and how the player appears in their destination.

If the player is disconnecting rather than transferring worlds, the world and transform may be set to handle where the player appears if they reconnect.

## Source Reference

`decompiled/com/hypixel/hytale/server/core/event/events/player/DrainPlayerFromWorldEvent.java:10`
