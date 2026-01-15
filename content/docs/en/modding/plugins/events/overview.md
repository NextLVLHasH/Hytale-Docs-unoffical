---
id: overview
title: Events Reference
sidebar_label: Overview
sidebar_position: 0
description: Complete reference for all Hytale server events
---

# Events Reference

The Hytale server uses a sophisticated event system that allows plugins to listen for and respond to various game actions. This reference provides comprehensive documentation for all available events, their interfaces, and how to use them effectively.

## Event System Architecture

Hytale's event system is built on two parallel hierarchies:

1. **IEvent Hierarchy** - Traditional event dispatch for general server events (player connections, world changes, permissions)
2. **EcsEvent Hierarchy** - Entity Component System events for gameplay mechanics (block interactions, inventory changes, combat)

Both systems support event priorities, cancellation (where applicable), and flexible registration patterns.

## Core Interfaces

### IBaseEvent

The root interface for all events in the Hytale event system. The generic `KeyType` parameter allows events to be keyed for selective dispatch.

```java
public interface IBaseEvent<KeyType> {
}
```

### IEvent

Interface for synchronous events that execute immediately on the main thread.

```java
public interface IEvent<KeyType> extends IBaseEvent<KeyType> {
}
```

### IAsyncEvent

Interface for asynchronous events that return `CompletableFuture` and can execute off the main thread.

```java
public interface IAsyncEvent<KeyType> extends IBaseEvent<KeyType> {
}
```

### ICancellable

Interface for events that can be cancelled to prevent their default behavior.

```java
public interface ICancellable {
   boolean isCancelled();
   void setCancelled(boolean cancelled);
}
```

### IProcessedEvent

Interface for events that track post-processing by handlers.

```java
public interface IProcessedEvent {
   void processEvent(@Nonnull String handlerName);
}
```

### EcsEvent

Base class for Entity Component System events, separate from the `IEvent` hierarchy.

```java
public abstract class EcsEvent {
   public EcsEvent() {
   }
}
```

### CancellableEcsEvent

Base class for ECS events that support cancellation.

```java
public abstract class CancellableEcsEvent extends EcsEvent implements ICancellableEcsEvent {
   private boolean cancelled = false;

   public boolean isCancelled() { ... }
   public void setCancelled(boolean cancelled) { ... }
}
```

## Event Priorities

Events are dispatched to handlers in priority order. Lower values run first.

| Priority | Value | Description |
|----------|-------|-------------|
| `FIRST` | -21844 | Highest priority, runs first. Use for preprocessing. |
| `EARLY` | -10922 | High priority. Use for validation and early modifications. |
| `NORMAL` | 0 | Default priority. Use for standard event handling. |
| `LATE` | 10922 | Low priority. Use for reactions to modifications. |
| `LAST` | 21844 | Lowest priority, runs last. Use for logging and final processing. |

### Shutdown Event Constants

The `ShutdownEvent` also defines special priority constants for shutdown ordering:

| Constant | Value | Description |
|----------|-------|-------------|
| `DISCONNECT_PLAYERS` | -48 | Priority for disconnecting players during shutdown |
| `UNBIND_LISTENERS` | -40 | Priority for unbinding listeners during shutdown |
| `SHUTDOWN_WORLDS` | -32 | Priority for shutting down worlds during shutdown |

## Registration Methods

Events are registered via `EventBus.register()` methods. Registration returns an `EventRegistration` object that can be used to unregister later.

### Basic Registration

```java
// Register with default (NORMAL) priority
EventRegistration registration = eventBus.register(
    PlayerConnectEvent.class,
    event -> {
        Player player = event.getPlayer();
        // Handle connection
    }
);
```

### Registration with Priority

```java
// Using EventPriority enum
eventBus.register(
    EventPriority.EARLY,
    PlayerChatEvent.class,
    event -> {
        // Handle chat early in the chain
    }
);

// Using raw short value for custom priority
eventBus.register(
    (short) -5000,
    PlayerChatEvent.class,
    event -> {
        // Custom priority between EARLY and NORMAL
    }
);
```

### Key-Specific Registration

```java
// Register for events with a specific key
eventBus.register(
    PlayerReadyEvent.class,
    "my-ready-key",
    event -> {
        // Only handles PlayerReadyEvent with this specific key
    }
);
```

### Global Registration

```java
// Receive ALL events of a type, regardless of key
eventBus.registerGlobal(
    EventPriority.NORMAL,
    PlayerEvent.class,
    event -> {
        // Handles all PlayerEvent instances
    }
);
```

### Unhandled Registration

```java
// Receive events that had no other handlers
eventBus.registerUnhandled(
    PlayerConnectEvent.class,
    event -> {
        // Fallback handler when no others matched
    }
);
```

### Async Registration

```java
// Register async handler returning CompletableFuture
eventBus.registerAsync(
    PlayerChatEvent.class,
    event -> CompletableFuture.supplyAsync(() -> {
        // Async processing
        return event;
    })
);
```

### Unregistering

```java
// Store the registration
EventRegistration registration = eventBus.register(...);

// Later, unregister
registration.unregister();
```

## ECS Event Registration

**Important:** ECS events (extending `EcsEvent` or `CancellableEcsEvent`) do **not** use the EventBus. They require a dedicated `EntityEventSystem` class registered via `getEntityStoreRegistry().registerSystem()`.

### Creating an ECS Event System

To listen to ECS events like `BreakBlockEvent`, `PlaceBlockEvent`, or inventory events, create a class extending `EntityEventSystem`:

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
        // Handle the event here
        int x = event.getTargetBlock().getX();
        int y = event.getTargetBlock().getY();
        int z = event.getTargetBlock().getZ();

        // Cancel if needed
        // event.setCancelled(true);
    }

    @Nullable
    @Override
    public Query<EntityStore> getQuery() {
        return Archetype.empty(); // Catch all entities
    }
}
```

### Registering the System

In your plugin's `setup()` method, register the system:

```java
@Override
protected void setup() {
    // Register ECS event systems
    getEntityStoreRegistry().registerSystem(new BlockBreakSystem());
    getEntityStoreRegistry().registerSystem(new BlockPlaceSystem());
    // ... other ECS systems
}
```

### ECS Events List

The following events require `EntityEventSystem` registration (NOT EventBus):

| Event | Description |
|-------|-------------|
| `BreakBlockEvent` | Block breaking |
| `PlaceBlockEvent` | Block placement |
| `DamageBlockEvent` | Block damage |
| `UseBlockEvent.Pre/Post` | Block interaction |
| `DropItemEvent` | Item dropping |
| `SwitchActiveSlotEvent` | Hotbar slot change |
| `InteractivelyPickupItemEvent` | Item pickup |
| `CraftRecipeEvent` | Recipe crafting |
| `ChangeGameModeEvent` | Game mode change |
| `ChunkSaveEvent` | Chunk saving |
| `ChunkUnloadEvent` | Chunk unloading |
| `MoonPhaseChangeEvent` | Moon phase change |
| `PrefabPasteEvent` | Prefab pasting |
| `KillFeedEvent.*` | Kill feed messages |
| `DiscoverZoneEvent` | Zone discovery |
| `DiscoverInstanceEvent` | Instance discovery |

## Event Categories

### Player Events (14 events)

Events related to player actions and lifecycle.

| Event | Description |
|-------|-------------|
| [PlayerEvent](./player-events#playerevent) | Abstract base class for player-related events |
| [PlayerRefEvent](./player-events#playerefevent) | Abstract base class using PlayerRef |
| [PlayerConnectEvent](./player-events#playerconnectevent) | Fired when a player connects to the server |
| [PlayerDisconnectEvent](./player-events#playerdisconnectevent) | Fired when a player disconnects |
| [PlayerChatEvent](./player-events#playerchatevent) | Fired when a player sends a chat message (async, cancellable) |
| [PlayerInteractEvent](./player-events#playerinteractevent) | Fired on player interactions (deprecated, cancellable) |
| [PlayerMouseButtonEvent](./player-events#playermousebuttonevent) | Fired on mouse button actions (cancellable) |
| [PlayerMouseMotionEvent](./player-events#playermousemotionevent) | Fired on mouse movement (cancellable) |
| [PlayerSetupConnectEvent](./player-events#playersetupconnectevent) | Fired during connection setup (cancellable) |
| [PlayerSetupDisconnectEvent](./player-events#playersetupdisconnectevent) | Fired during disconnect setup |
| [PlayerReadyEvent](./player-events#playerreadyevent) | Fired when a player is ready |
| [PlayerCraftEvent](./player-events#playercraftevent) | Fired on crafting (deprecated) |
| [AddPlayerToWorldEvent](./player-events#addplayertoworldevent) | Fired when adding a player to a world |
| [DrainPlayerFromWorldEvent](./player-events#drainplayerfromworldevent) | Fired when removing a player from a world |

[View all Player Events](./player-events)

### Block Events (5 events)

Events related to block interactions.

| Event | Description |
|-------|-------------|
| [BreakBlockEvent](./block-events#breakblockevent) | Fired when a block is broken (cancellable) |
| [PlaceBlockEvent](./block-events#placeblockevent) | Fired when a block is placed (cancellable) |
| [DamageBlockEvent](./block-events#damageblockevent) | Fired when a block takes damage (cancellable) |
| [UseBlockEvent](./block-events#useblockevent) | Abstract base for block use events |
| [UseBlockEvent.Pre](./block-events#useblockevenpre) | Fired before block use (cancellable) |

[View all Block Events](./block-events)

### Entity Events (3 events)

Events related to entities.

| Event | Description |
|-------|-------------|
| [EntityEvent](./entity-events#entityevent) | Abstract base class for entity events |
| [EntityRemoveEvent](./entity-events#entityremoveevent) | Fired when an entity is removed |
| [LivingEntityInventoryChangeEvent](./entity-events#livingentityinventorychangeevent) | Fired on inventory changes |

[View all Entity Events](./entity-events)

### World Events (4 events)

Events related to world management.

| Event | Description |
|-------|-------------|
| [WorldEvent](./world-events#worldevent) | Abstract base class for world events |
| [AddWorldEvent](./world-events#addworldevent) | Fired when a world is added (cancellable) |
| [RemoveWorldEvent](./world-events#removeworldevent) | Fired when a world is removed (cancellable) |
| [StartWorldEvent](./world-events#startworldevent) | Fired when a world starts |

[View all World Events](./world-events)

### Chunk Events (4 events)

Events related to chunk loading and management.

| Event | Description |
|-------|-------------|
| [ChunkEvent](./chunk-events#chunkevent) | Abstract base class for chunk events |
| [ChunkPreLoadProcessEvent](./chunk-events#chunkpreloadprocessevent) | Fired before chunk load processing |
| [ChunkSaveEvent](./chunk-events#chunksaveevent) | Fired when a chunk is saved (cancellable) |
| [ChunkUnloadEvent](./chunk-events#chunkunloadevent) | Fired when a chunk is unloaded (cancellable) |

[View all Chunk Events](./chunk-events)

### Server Events (3 events)

Events related to server lifecycle.

| Event | Description |
|-------|-------------|
| [BootEvent](./server-events#bootevent) | Fired when the server boots |
| [ShutdownEvent](./server-events#shutdownevent) | Fired when the server shuts down |
| [PrepareUniverseEvent](./server-events#prepareuniverseevent) | Fired during universe preparation (deprecated) |

[View all Server Events](./server-events)

### Permission Events (4 events)

Events related to permission changes.

| Event | Description |
|-------|-------------|
| [PlayerPermissionChangeEvent](./permission-events#playerpermissionchangeevent) | Abstract base for player permission changes |
| [GroupPermissionChangeEvent](./permission-events#grouppermissionchangeevent) | Abstract base for group permission changes |
| [PlayerGroupEvent](./permission-events#playergroupevent) | Fired on player group changes |
| [PluginEvent](./permission-events#pluginevent) | Abstract base for plugin events |

[View all Permission Events](./permission-events)

### Inventory Events (4 events)

Events related to inventory interactions.

| Event | Description |
|-------|-------------|
| [DropItemEvent](./inventory-events#dropitemevent) | Fired when an item is dropped (cancellable) |
| [SwitchActiveSlotEvent](./inventory-events#switchactiveslotevent) | Fired on hotbar slot change (cancellable) |
| [InteractivelyPickupItemEvent](./inventory-events#interactivelypickupitemevent) | Fired on item pickup (cancellable) |
| [CraftRecipeEvent](./inventory-events#craftrecipeevent) | Fired on recipe crafting (cancellable) |

[View all Inventory Events](./inventory-events)

## Event Hierarchy

```
IBaseEvent<KeyType>
├── IEvent<KeyType>
│   ├── PlayerEvent<KeyType>
│   │   ├── PlayerInteractEvent (cancellable, @Deprecated)
│   │   ├── PlayerMouseButtonEvent (cancellable)
│   │   ├── PlayerMouseMotionEvent (cancellable)
│   │   ├── PlayerReadyEvent
│   │   └── PlayerCraftEvent (@Deprecated)
│   ├── PlayerRefEvent<KeyType>
│   │   └── PlayerDisconnectEvent
│   ├── PlayerConnectEvent
│   ├── PlayerSetupConnectEvent (cancellable)
│   ├── PlayerSetupDisconnectEvent
│   ├── AddPlayerToWorldEvent
│   ├── DrainPlayerFromWorldEvent
│   ├── EntityEvent<EntityType, KeyType>
│   │   ├── EntityRemoveEvent
│   │   └── LivingEntityInventoryChangeEvent
│   ├── WorldEvent
│   │   ├── AddWorldEvent (cancellable)
│   │   ├── RemoveWorldEvent (cancellable)
│   │   └── StartWorldEvent
│   ├── ChunkEvent
│   │   └── ChunkPreLoadProcessEvent (IProcessedEvent)
│   ├── BootEvent
│   ├── ShutdownEvent
│   ├── PrepareUniverseEvent (@Deprecated)
│   ├── AllWorldsLoadedEvent
│   ├── PlayerPermissionChangeEvent
│   │   ├── PlayerGroupEvent
│   │   │   ├── PlayerGroupEvent.Added
│   │   │   └── PlayerGroupEvent.Removed
│   │   ├── PlayerPermissionChangeEvent.GroupAdded
│   │   ├── PlayerPermissionChangeEvent.GroupRemoved
│   │   ├── PlayerPermissionChangeEvent.PermissionsAdded
│   │   └── PlayerPermissionChangeEvent.PermissionsRemoved
│   ├── GroupPermissionChangeEvent
│   │   ├── GroupPermissionChangeEvent.Added
│   │   └── GroupPermissionChangeEvent.Removed
│   ├── PluginEvent
│   │   └── PluginSetupEvent
│   ├── MessagesUpdated
│   ├── GenerateDefaultLanguageEvent
│   ├── TreasureChestOpeningEvent
│   └── LivingEntityUseBlockEvent (@Deprecated)
│
└── IAsyncEvent<KeyType>
    └── PlayerChatEvent (cancellable)

EcsEvent
├── CancellableEcsEvent (ICancellableEcsEvent)
│   ├── BreakBlockEvent
│   ├── PlaceBlockEvent
│   ├── DamageBlockEvent
│   ├── DropItemEvent
│   ├── CraftRecipeEvent
│   │   ├── CraftRecipeEvent.Pre
│   │   └── CraftRecipeEvent.Post
│   ├── ChangeGameModeEvent
│   ├── SwitchActiveSlotEvent
│   ├── InteractivelyPickupItemEvent
│   ├── ChunkSaveEvent
│   ├── ChunkUnloadEvent
│   ├── PrefabPasteEvent
│   └── KillFeedEvent.*
│       ├── KillFeedEvent.DecedentMessage
│       ├── KillFeedEvent.Display
│       └── KillFeedEvent.KillerMessage
├── UseBlockEvent
│   ├── UseBlockEvent.Pre (ICancellableEcsEvent)
│   └── UseBlockEvent.Post
├── DiscoverZoneEvent
│   └── DiscoverZoneEvent.Display (ICancellableEcsEvent)
├── MoonPhaseChangeEvent
├── PrefabPlaceEntityEvent
└── DiscoverInstanceEvent
    └── DiscoverInstanceEvent.Display (ICancellableEcsEvent)
```

## Quick Reference Table

### All Events

| Event Name | Parent Class | Cancellable | Async | Package |
|------------|--------------|:-----------:|:-----:|---------|
| **Player Events** |||||
| PlayerEvent | IEvent | No | No | player |
| PlayerRefEvent | IEvent | No | No | player |
| PlayerConnectEvent | IEvent | No | No | player |
| PlayerDisconnectEvent | PlayerRefEvent | No | No | player |
| PlayerChatEvent | IAsyncEvent | Yes | Yes | player |
| PlayerInteractEvent | PlayerEvent | Yes | No | player |
| PlayerMouseButtonEvent | PlayerEvent | Yes | No | player |
| PlayerMouseMotionEvent | PlayerEvent | Yes | No | player |
| PlayerSetupConnectEvent | IEvent | Yes | No | player |
| PlayerSetupDisconnectEvent | IEvent | No | No | player |
| PlayerReadyEvent | PlayerEvent | No | No | player |
| PlayerCraftEvent | PlayerEvent | No | No | player |
| AddPlayerToWorldEvent | IEvent | No | No | player |
| DrainPlayerFromWorldEvent | IEvent | No | No | player |
| **Entity Events** |||||
| EntityEvent | IEvent | No | No | entity |
| EntityRemoveEvent | EntityEvent | No | No | entity |
| LivingEntityInventoryChangeEvent | EntityEvent | No | No | entity |
| LivingEntityUseBlockEvent | IEvent | No | No | entity |
| **Block Events (ECS)** |||||
| BreakBlockEvent | CancellableEcsEvent | Yes | No | ecs |
| PlaceBlockEvent | CancellableEcsEvent | Yes | No | ecs |
| DamageBlockEvent | CancellableEcsEvent | Yes | No | ecs |
| UseBlockEvent | EcsEvent | No | No | ecs |
| UseBlockEvent.Pre | UseBlockEvent | Yes | No | ecs |
| UseBlockEvent.Post | UseBlockEvent | No | No | ecs |
| **World Events** |||||
| WorldEvent | IEvent | No | No | world.events |
| AddWorldEvent | WorldEvent | Yes | No | world.events |
| RemoveWorldEvent | WorldEvent | Yes | No | world.events |
| StartWorldEvent | WorldEvent | No | No | world.events |
| AllWorldsLoadedEvent | IEvent | No | No | world.events |
| **Chunk Events** |||||
| ChunkEvent | IEvent | No | No | world.events |
| ChunkPreLoadProcessEvent | ChunkEvent | No | No | world.events |
| ChunkSaveEvent | CancellableEcsEvent | Yes | No | world.events.ecs |
| ChunkUnloadEvent | CancellableEcsEvent | Yes | No | world.events.ecs |
| MoonPhaseChangeEvent | EcsEvent | No | No | world.events.ecs |
| **Server Events** |||||
| BootEvent | IEvent | No | No | events |
| ShutdownEvent | IEvent | No | No | events |
| PrepareUniverseEvent | IEvent | No | No | events |
| **Permission Events** |||||
| PlayerPermissionChangeEvent | IEvent | No | No | permissions |
| GroupPermissionChangeEvent | IEvent | No | No | permissions |
| PlayerGroupEvent | PlayerPermissionChangeEvent | No | No | permissions |
| **Inventory Events (ECS)** |||||
| DropItemEvent | CancellableEcsEvent | Yes | No | ecs |
| SwitchActiveSlotEvent | CancellableEcsEvent | Yes | No | ecs |
| InteractivelyPickupItemEvent | CancellableEcsEvent | Yes | No | ecs |
| CraftRecipeEvent | CancellableEcsEvent | Yes | No | ecs |
| ChangeGameModeEvent | CancellableEcsEvent | Yes | No | ecs |
| **Plugin Events** |||||
| PluginEvent | IEvent | No | No | plugin.event |
| PluginSetupEvent | PluginEvent | No | No | plugin.event |
| **Miscellaneous Events** |||||
| DiscoverZoneEvent | EcsEvent | No | No | ecs |
| DiscoverZoneEvent.Display | DiscoverZoneEvent | Yes | No | ecs |
| KillFeedEvent.DecedentMessage | CancellableEcsEvent | Yes | No | damage.event |
| KillFeedEvent.Display | CancellableEcsEvent | Yes | No | damage.event |
| KillFeedEvent.KillerMessage | CancellableEcsEvent | Yes | No | damage.event |
| MessagesUpdated | IEvent | No | No | i18n.event |
| GenerateDefaultLanguageEvent | IEvent | No | No | i18n.event |
| PrefabPasteEvent | CancellableEcsEvent | Yes | No | prefab.event |
| PrefabPlaceEntityEvent | EcsEvent | No | No | prefab.event |
| TreasureChestOpeningEvent | IEvent | No | No | objectives.events |
| DiscoverInstanceEvent | EcsEvent | No | No | instances.event |
| DiscoverInstanceEvent.Display | DiscoverInstanceEvent | Yes | No | instances.event |

## Best Practices

### Event Handler Guidelines

1. **Keep handlers fast** - Event handlers block the main thread (except async events). Offload heavy work to async tasks.

2. **Check cancellation** - Always check `isCancelled()` at the start of your handler if other plugins might cancel the event.

3. **Use appropriate priorities** - Use `FIRST` for validation, `NORMAL` for standard handling, `LAST` for logging.

4. **Unregister when done** - Store your `EventRegistration` and call `unregister()` when your plugin disables.

5. **Handle exceptions** - Wrap handler code in try-catch to prevent crashes from breaking other handlers.

### Cancellation Guidelines

1. **Cancel early** - Cancel events at `FIRST` or `EARLY` priority to prevent unnecessary processing.

2. **Respect cancellation** - Check `isCancelled()` and return early unless you have a specific reason to proceed.

3. **Document cancellation** - If your plugin cancels events, document why for server administrators.

4. **Don't uncancel without reason** - Avoid calling `setCancelled(false)` unless implementing override functionality.

## See Also

- [Plugin Development Guide](../getting-started)
- [EventBus API Reference](../api/eventbus)
- [ECS System Overview](../../ecs/overview)
