---
id: place-block-event
title: PlaceBlockEvent
sidebar_label: PlaceBlockEvent
---

# PlaceBlockEvent

Fired when a block is about to be placed in the world. This event allows plugins to intercept and cancel block placement, modify the target position or rotation, or perform custom logic when blocks are placed.

## Event Information

| Property | Value |
|----------|-------|
| **Full Class Name** | `com.hypixel.hytale.server.core.event.events.ecs.PlaceBlockEvent` |
| **Parent Class** | `CancellableEcsEvent` |
| **Cancellable** | Yes |
| **ECS Event** | Yes |
| **Source File** | `decompiled/com/hypixel/hytale/server/core/event/events/ecs/PlaceBlockEvent.java:11` |

## Declaration

```java
public class PlaceBlockEvent extends CancellableEcsEvent {
```

## Fields

| Field | Type | Accessor | Description |
|-------|------|----------|-------------|
| `itemInHand` | `@Nullable ItemStack` | `getItemInHand()` | The item (block) being placed from the entity's hand (null if no item in hand) |
| `targetBlock` | `@Nonnull Vector3i` | `getTargetBlock()` | The position where the block will be placed |
| `rotation` | `@Nonnull RotationTuple` | `getRotation()` | The rotation/orientation of the placed block |

## Methods

| Method | Signature | Description |
|--------|-----------|-------------|
| `getItemInHand` | `@Nullable public ItemStack getItemInHand()` | Returns the item stack being used to place the block, or null if no item in hand |
| `getTargetBlock` | `@Nonnull public Vector3i getTargetBlock()` | Returns the world position where the block will be placed |
| `setTargetBlock` | `public void setTargetBlock(@Nonnull Vector3i targetBlock)` | Changes the target placement position (line 35) |
| `getRotation` | `@Nonnull public RotationTuple getRotation()` | Returns the rotation tuple for block orientation |
| `setRotation` | `public void setRotation(@Nonnull RotationTuple rotation)` | Changes the block's rotation/orientation (line 45) |
| `isCancelled` | `public boolean isCancelled()` | Returns whether the event has been cancelled (inherited) |
| `setCancelled` | `public void setCancelled(boolean cancelled)` | Sets the cancelled state of the event (inherited) |

## Understanding ECS Events

**Important:** ECS events (Entity Component System events) work differently from regular `IEvent` events. They do **not** use the EventBus - instead, they require a dedicated `EntityEventSystem` class registered via `getEntityStoreRegistry().registerSystem()`.

Key differences:
- ECS events extend `EcsEvent` or `CancellableEcsEvent` instead of implementing `IEvent`
- They are dispatched via `entityStore.invoke()` within the ECS framework
- You must create an `EntityEventSystem` subclass to listen to these events
- Systems are registered through `getEntityStoreRegistry().registerSystem()`

## Usage Example

### Step 1: Create the EntityEventSystem

Create a class that extends `EntityEventSystem<EntityStore, PlaceBlockEvent>`:

```java
package com.example.myplugin.systems;

import com.hypixel.hytale.component.Archetype;
import com.hypixel.hytale.component.ArchetypeChunk;
import com.hypixel.hytale.component.CommandBuffer;
import com.hypixel.hytale.component.Store;
import com.hypixel.hytale.component.query.Query;
import com.hypixel.hytale.component.system.EntityEventSystem;
import com.hypixel.hytale.server.core.universe.world.storage.EntityStore;
import com.hypixel.hytale.server.core.event.events.ecs.PlaceBlockEvent;

import javax.annotation.Nonnull;
import javax.annotation.Nullable;

public class BlockPlaceSystem extends EntityEventSystem<EntityStore, PlaceBlockEvent> {

    private static final int MAX_BUILD_HEIGHT = 256;

    public BlockPlaceSystem() {
        super(PlaceBlockEvent.class);
    }

    @Override
    public void handle(
            int index,
            @Nonnull ArchetypeChunk<EntityStore> archetypeChunk,
            @Nonnull Store<EntityStore> store,
            @Nonnull CommandBuffer<EntityStore> commandBuffer,
            @Nonnull PlaceBlockEvent event
    ) {
        // Get information about the block being placed
        int x = event.getTargetBlock().getX();
        int y = event.getTargetBlock().getY();
        int z = event.getTargetBlock().getZ();
        ItemStack blockItem = event.getItemInHand();
        RotationTuple rotation = event.getRotation();

        // Example: Enforce block placement height limits
        if (y > MAX_BUILD_HEIGHT) {
            event.setCancelled(true);
            return;
        }

        // Example: Log the block placement
        System.out.println("Block placed at [" + x + "," + y + "," + z + "]");
    }

    @Nullable
    @Override
    public Query<EntityStore> getQuery() {
        return Archetype.empty(); // Catch events from all entities
    }
}
```

### Step 2: Register the System in Your Plugin

In your plugin's `setup()` method, register the system:

```java
public class MyPlugin extends JavaPlugin {

    public MyPlugin(@Nonnull JavaPluginInit init) {
        super(init);
    }

    @Override
    protected void setup() {
        // Register the ECS event system
        getEntityStoreRegistry().registerSystem(new BlockPlaceSystem());
    }
}
```

### Important Notes

- The `getQuery()` method determines which entities this system listens to. Return `Archetype.empty()` to catch events from all entities.
- ECS events are **not** registered via `EventBus.register()` - that approach will not work for these events.
- Each ECS event type requires its own `EntityEventSystem` class.

## When This Event Fires

The `PlaceBlockEvent` is fired when:

1. **Player places a block** - When a player right-clicks to place a block from their inventory
2. **Entity places a block** - When an entity (such as an enderman-like mob) places a block
3. **Programmatic placement** - When game systems place blocks through normal placement mechanics

The event fires **before** the block is actually added to the world, allowing handlers to:
- Cancel the placement entirely
- Modify the target position
- Change the block's rotation/orientation
- Track block placements for logging or gameplay purposes

## Cancellation Behavior

When the event is cancelled by calling `setCancelled(true)`:

- The block will **not** be placed in the world
- The item remains in the player's/entity's hand (not consumed)
- No block state changes occur at the target position
- The player/entity receives feedback that the action was blocked

This is useful for:
- Build permission systems (claims, plot protection)
- Height limit enforcement
- Restricting specific block types in areas
- Anti-griefing and world protection
- Custom game modes with building restrictions

## Block Rotation

The `RotationTuple` controls how the block is oriented when placed. This is particularly important for:

- Directional blocks (stairs, logs, pillars)
- Blocks with facing directions (furnaces, chests)
- Decorative blocks with multiple orientations

You can use `setRotation()` to:
- Force blocks to face a specific direction
- Implement auto-rotation features
- Create building assistance tools

## Related Events

- [BreakBlockEvent](./break-block-event) - Fired when a block is broken
- [DamageBlockEvent](./damage-block-event) - Fired when a block takes damage
- [UseBlockEvent](./use-block-event) - Fired when a block is interacted with

## Source Reference

`decompiled/com/hypixel/hytale/server/core/event/events/ecs/PlaceBlockEvent.java:11`
