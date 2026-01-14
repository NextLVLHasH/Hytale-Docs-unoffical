---
id: add-player-to-world-event
title: AddPlayerToWorldEvent
sidebar_label: AddPlayerToWorldEvent
---

# AddPlayerToWorldEvent

Fired when a player is being added to a world. This event allows plugins to control whether a join message should be broadcast and perform setup operations when a player enters a world.

## Event Information

| Property | Value |
|----------|-------|
| **Full Class Name** | `com.hypixel.hytale.server.core.event.events.player.AddPlayerToWorldEvent` |
| **Parent Class** | `IEvent<String>` |
| **Cancellable** | No |
| **Async** | No |
| **Source File** | `decompiled/com/hypixel/hytale/server/core/event/events/player/AddPlayerToWorldEvent.java:9` |

## Declaration

```java
public class AddPlayerToWorldEvent implements IEvent<String> {
   @Nonnull
   private final Holder<EntityStore> holder;
   @Nonnull
   private final World world;
   private boolean broadcastJoinMessage = true;
```

## Fields

| Field | Type | Accessor | Description |
|-------|------|----------|-------------|
| `holder` | `Holder<EntityStore>` | `getHolder()` | The entity holder containing the player's entity store |
| `world` | `World` | `getWorld()` | The world the player is being added to |
| `broadcastJoinMessage` | `boolean` | `shouldBroadcastJoinMessage()` | Whether to broadcast a join message to other players |

## Methods

| Method | Signature | Description |
|--------|-----------|-------------|
| `getHolder` | `@Nonnull public Holder<EntityStore> getHolder()` | Returns the entity holder for the player |
| `getWorld` | `@Nonnull public World getWorld()` | Returns the world being joined |
| `shouldBroadcastJoinMessage` | `public boolean shouldBroadcastJoinMessage()` | Returns whether a join message will be broadcast |
| `setBroadcastJoinMessage` | `public void setBroadcastJoinMessage(boolean broadcastJoinMessage)` | Sets whether to broadcast a join message |
| `toString` | `@Nonnull public String toString()` | Returns a string representation of this event |

## Usage Example

```java
// Register a handler for when players are added to worlds
eventBus.register(AddPlayerToWorldEvent.class, event -> {
    World world = event.getWorld();
    Holder<EntityStore> holder = event.getHolder();

    // Get player info from the holder
    logger.info("Player being added to world: " + world.getName());

    // Conditionally suppress join message
    if (world.getName().equals("minigame_lobby")) {
        // Don't broadcast in minigame lobbies
        event.setBroadcastJoinMessage(false);
    }

    // Perform world-specific setup
    setupPlayerForWorld(holder, world);
});

// Silent joins for staff
eventBus.register(EventPriority.EARLY, AddPlayerToWorldEvent.class, event -> {
    Holder<EntityStore> holder = event.getHolder();

    // Check if player is staff with vanish enabled
    if (isStaffWithVanish(holder)) {
        event.setBroadcastJoinMessage(false);
    }
});

// World-specific welcome messages
eventBus.register(AddPlayerToWorldEvent.class, event -> {
    World world = event.getWorld();
    Holder<EntityStore> holder = event.getHolder();

    // Suppress default message and send custom one
    event.setBroadcastJoinMessage(false);

    String worldType = getWorldType(world);
    switch (worldType) {
        case "survival":
            broadcastToWorld(world, "A new adventurer has entered the realm!");
            break;
        case "creative":
            broadcastToWorld(world, "A builder has joined the creative world!");
            break;
        case "minigame":
            // No announcement for minigames
            break;
        default:
            // Use default announcement
            event.setBroadcastJoinMessage(true);
    }
});

// Track world population
eventBus.register(AddPlayerToWorldEvent.class, event -> {
    World world = event.getWorld();

    // Update world statistics
    incrementWorldPopulation(world);

    // Check if world is getting crowded
    if (getWorldPopulation(world) > getWorldCapacity(world) * 0.9) {
        notifyAdmins("World " + world.getName() + " is nearly full!");
    }
});
```

## Common Use Cases

- Customizing or suppressing join messages
- World-specific player setup
- Tracking world population
- Applying world-specific permissions or effects
- Teleporting players to spawn points
- Loading world-specific player data
- Initializing world-specific UI elements

## Related Events

- [PlayerConnectEvent](./player-connect-event.md) - Fired when player first connects to server
- [DrainPlayerFromWorldEvent](./drain-player-from-world-event.md) - Fired when player is removed from a world
- [PlayerReadyEvent](./player-ready-event.md) - Fired when player client is fully ready
- [StartWorldEvent](../world/start-world-event.md) - Fired when a world starts

## Event Order

When a player joins the server and is placed in a world:

1. **PlayerSetupConnectEvent** - Early validation
2. **PlayerConnectEvent** - Player entity created, world may be set
3. **AddPlayerToWorldEvent** - Player added to the world
4. **PlayerReadyEvent** - Client fully loaded

When a player transfers between worlds:

1. **DrainPlayerFromWorldEvent** - Player removed from old world
2. **AddPlayerToWorldEvent** - Player added to new world

## Notes

This event cannot be cancelled, but you can control the join message broadcast through `setBroadcastJoinMessage()`. To prevent a player from entering a world entirely, you would need to handle this in an earlier event like `PlayerConnectEvent` when setting the initial world.

The `holder` provides access to the player's entity store, which contains all components and data associated with the player entity.

## Source Reference

`decompiled/com/hypixel/hytale/server/core/event/events/player/AddPlayerToWorldEvent.java:9`
