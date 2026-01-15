---
id: break-block-event
title: BreakBlockEvent
sidebar_label: BreakBlockEvent
---

# BreakBlockEvent

Fired when a block is about to be broken (destroyed) in the world. This event allows plugins to intercept and cancel block breaking, modify the target block, or perform custom logic when blocks are destroyed.

## Event Information

| Property | Value |
|----------|-------|
| **Full Class Name** | `com.hypixel.hytale.server.core.event.events.ecs.BreakBlockEvent` |
| **Parent Class** | `CancellableEcsEvent` |
| **Cancellable** | Yes |
| **ECS Event** | Yes |
| **Source File** | `decompiled/com/hypixel/hytale/server/core/event/events/ecs/BreakBlockEvent.java:10` |

## Declaration

```java
public class BreakBlockEvent extends CancellableEcsEvent {
```

## Fields

| Field | Type | Accessor | Description |
|-------|------|----------|-------------|
| `itemInHand` | `@Nullable ItemStack` | `getItemInHand()` | The item the entity is holding when breaking the block (null if no item in hand) |
| `targetBlock` | `@Nonnull Vector3i` | `getTargetBlock()` | The position of the block being broken |
| `blockType` | `@Nonnull BlockType` | `getBlockType()` | The type of block being broken |

## Methods

| Method | Signature | Description |
|--------|-----------|-------------|
| `getItemInHand` | `@Nullable public ItemStack getItemInHand()` | Returns the item held by the entity breaking the block, or null if no item in hand |
| `getTargetBlock` | `@Nonnull public Vector3i getTargetBlock()` | Returns the world position of the target block |
| `setTargetBlock` | `public void setTargetBlock(@Nonnull Vector3i targetBlock)` | Changes the target block position (line 39) |
| `getBlockType` | `@Nonnull public BlockType getBlockType()` | Returns the type of block being broken |
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

Create a class that extends `EntityEventSystem<EntityStore, BreakBlockEvent>`:

```java
package com.example.myplugin.systems;

import com.hypixel.hytale.component.Archetype;
import com.hypixel.hytale.component.ArchetypeChunk;
import com.hypixel.hytale.component.CommandBuffer;
import com.hypixel.hytale.component.Store;
import com.hypixel.hytale.component.query.Query;
import com.hypixel.hytale.component.system.EntityEventSystem;
import com.hypixel.hytale.server.core.universe.world.storage.EntityStore;
import com.hypixel.hytale.server.core.event.events.ecs.BreakBlockEvent;

import javax.annotation.Nonnull;
import javax.annotation.Nullable;

public class BlockBreakSystem extends EntityEventSystem<EntityStore, BreakBlockEvent> {

    public BlockBreakSystem() {
        super(BreakBlockEvent.class);
    }

    @Override
    public void handle(
            int index,
            @Nonnull ArchetypeChunk<EntityStore> archetypeChunk,
            @Nonnull Store<EntityStore> store,
            @Nonnull CommandBuffer<EntityStore> commandBuffer,
            @Nonnull BreakBlockEvent event
    ) {
        // Get information about the block being broken
        int x = event.getTargetBlock().getX();
        int y = event.getTargetBlock().getY();
        int z = event.getTargetBlock().getZ();
        BlockType blockType = event.getBlockType();
        ItemStack toolUsed = event.getItemInHand();

        // Example: Prevent breaking protected blocks
        if (isProtectedBlock(blockType)) {
            event.setCancelled(true);
            return;
        }

        // Example: Log the block break
        System.out.println("Block broken at [" + x + "," + y + "," + z + "] type=" + blockType);
    }

    @Nullable
    @Override
    public Query<EntityStore> getQuery() {
        return Archetype.empty(); // Catch events from all entities
    }

    private boolean isProtectedBlock(BlockType blockType) {
        // Custom protection logic
        return false;
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
        getEntityStoreRegistry().registerSystem(new BlockBreakSystem());
    }
}
```

### Important Notes

- The `getQuery()` method determines which entities this system listens to. Return `Archetype.empty()` to catch events from all entities.
- ECS events are **not** registered via `EventBus.register()` - that approach will not work for these events.
- Each ECS event type requires its own `EntityEventSystem` class.

## When This Event Fires

The `BreakBlockEvent` is fired when:

1. **Player breaks a block** - When a player successfully mines/breaks a block after the damage threshold is reached
2. **Entity destroys a block** - When an entity (mob, projectile, etc.) causes a block to be destroyed
3. **Programmatic block removal** - When game systems remove blocks through normal breaking mechanics

The event fires **before** the block is actually removed from the world, allowing handlers to:
- Cancel the break entirely
- Modify which block gets broken
- Track block destruction for logging or gameplay purposes

## Cancellation Behavior

When the event is cancelled by calling `setCancelled(true)`:

- The block will **not** be removed from the world
- The block remains in its current state
- Any item drops that would have occurred are prevented
- Tool durability loss may still occur (implementation dependent)
- The player/entity receives feedback that the action was blocked

This is useful for:
- Block protection systems (claims, spawn protection)
- Permission-based building restrictions
- Custom game modes where certain blocks cannot be broken
- Anti-griefing measures

## Related Events

- [PlaceBlockEvent](./place-block-event) - Fired when a block is placed
- [DamageBlockEvent](./damage-block-event) - Fired when a block takes damage (before breaking)
- [UseBlockEvent](./use-block-event) - Fired when a block is interacted with

## Source Reference

`decompiled/com/hypixel/hytale/server/core/event/events/ecs/BreakBlockEvent.java:10`
