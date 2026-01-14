---
id: player-interact-event
title: PlayerInteractEvent
sidebar_label: PlayerInteractEvent
---

# PlayerInteractEvent

:::warning Deprecated
This event is deprecated. Consider using [PlayerMouseButtonEvent](./player-mouse-button-event.md) for mouse interactions instead.
:::

Fired when a player interacts with the world (blocks, entities, or items). This is a cancellable event that allows plugins to prevent or modify interactions.

## Event Information

| Property | Value |
|----------|-------|
| **Full Class Name** | `com.hypixel.hytale.server.core.event.events.player.PlayerInteractEvent` |
| **Parent Class** | `PlayerEvent<String>` |
| **Cancellable** | Yes |
| **Async** | No |
| **Deprecated** | Yes |
| **Source File** | `decompiled/com/hypixel/hytale/server/core/event/events/player/PlayerInteractEvent.java:14` |

## Declaration

```java
@Deprecated
public class PlayerInteractEvent extends PlayerEvent<String> implements ICancellable {
```

## Fields

| Field | Type | Accessor | Description |
|-------|------|----------|-------------|
| `playerRef` | `Ref<EntityStore>` | `getPlayerRef()` | Reference to the player's entity store (inherited from PlayerEvent) |
| `player` | `Player` | `getPlayer()` | The player object (inherited from PlayerEvent) |
| `actionType` | `InteractionType` | `getActionType()` | The type of interaction being performed |
| `clientUseTime` | `long` | `getClientUseTime()` | Client-side timestamp of the interaction |
| `itemInHand` | `ItemStack` | `getItemInHand()` | The item the player is holding |
| `targetBlock` | `Vector3i` | `getTargetBlock()` | The block position being targeted (if any) |
| `targetRef` | `Ref<EntityStore>` | `getTargetRef()` | Reference to the target entity's store (if any) |
| `targetEntity` | `Entity` | `getTargetEntity()` | The entity being targeted (if any) |
| `cancelled` | `boolean` | `isCancelled()` | Whether the interaction has been cancelled |

## Methods

| Method | Signature | Description |
|--------|-----------|-------------|
| `getPlayerRef` | `public Ref<EntityStore> getPlayerRef()` | Returns the player's entity store reference (inherited) |
| `getPlayer` | `public Player getPlayer()` | Returns the player object (inherited) |
| `getActionType` | `public InteractionType getActionType()` | Returns the type of interaction |
| `getClientUseTime` | `public long getClientUseTime()` | Returns the client timestamp |
| `getItemInHand` | `public ItemStack getItemInHand()` | Returns the item being held |
| `getTargetBlock` | `public Vector3i getTargetBlock()` | Returns the targeted block position |
| `getTargetRef` | `public Ref<EntityStore> getTargetRef()` | Returns the target entity reference |
| `getTargetEntity` | `public Entity getTargetEntity()` | Returns the targeted entity |
| `isCancelled` | `public boolean isCancelled()` | Returns whether the event is cancelled |
| `setCancelled` | `public void setCancelled(boolean cancelled)` | Cancels or uncancels the event |
| `toString` | `@Nonnull public String toString()` | Returns a string representation of this event |

## Usage Example

```java
// Register a handler for player interactions
eventBus.register(PlayerInteractEvent.class, event -> {
    Player player = event.getPlayer();
    InteractionType action = event.getActionType();

    // Check if targeting a block
    Vector3i targetBlock = event.getTargetBlock();
    if (targetBlock != null) {
        // Handle block interaction
        logger.info(player.getName() + " interacted with block at " + targetBlock);

        // Prevent interaction in protected areas
        if (isProtectedArea(targetBlock)) {
            event.setCancelled(true);
            player.sendMessage("You cannot interact here!");
            return;
        }
    }

    // Check if targeting an entity
    Entity targetEntity = event.getTargetEntity();
    if (targetEntity != null) {
        // Handle entity interaction
        logger.info(player.getName() + " interacted with entity: " + targetEntity);
    }

    // Check the item being used
    ItemStack item = event.getItemInHand();
    if (item != null) {
        // Custom item interactions
        handleCustomItemUse(player, item, action);
    }
});
```

## Common Use Cases

- Protecting regions from player interactions
- Custom item behaviors on use
- Entity interaction systems (NPCs, shops)
- Block interaction logging
- Custom crafting station interactions
- Permission-based interaction restrictions

## Related Events

- [PlayerMouseButtonEvent](./player-mouse-button-event.md) - Modern replacement for mouse-based interactions
- [PlayerMouseMotionEvent](./player-mouse-motion-event.md) - For tracking mouse movement
- [BreakBlockEvent](../ecs/break-block-event.md) - Specifically for block breaking
- [PlaceBlockEvent](../ecs/place-block-event.md) - Specifically for block placement
- [UseBlockEvent](../ecs/use-block-event.md) - For block usage interactions

## Migration Notice

This event is deprecated and may be removed in future versions. For mouse button interactions, migrate to [PlayerMouseButtonEvent](./player-mouse-button-event.md) which provides more detailed information about mouse input.

## Source Reference

`decompiled/com/hypixel/hytale/server/core/event/events/player/PlayerInteractEvent.java:14`
