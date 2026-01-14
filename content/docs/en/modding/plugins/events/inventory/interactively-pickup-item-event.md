---
id: interactively-pickup-item-event
title: InteractivelyPickupItemEvent
sidebar_label: InteractivelyPickupItemEvent
sidebar_position: 3
---

# InteractivelyPickupItemEvent

Fired when a player interactively picks up an item from the world. This event allows plugins to modify, replace, or prevent item pickups that occur through direct player interaction (as opposed to automatic collection).

## Event Information

| Property | Value |
|----------|-------|
| **Full Class Name** | `com.hypixel.hytale.server.core.event.events.ecs.InteractivelyPickupItemEvent` |
| **Parent Class** | `CancellableEcsEvent` |
| **Cancellable** | Yes |
| **ECS Event** | Yes |
| **Source File** | `com/hypixel/hytale/server/core/event/events/ecs/InteractivelyPickupItemEvent.java:7` |

## Declaration

```java
public class InteractivelyPickupItemEvent extends CancellableEcsEvent {
    @Nonnull
    private ItemStack itemStack;

    // Constructor and methods...
}
```

## Fields

| Field | Type | Line | Description |
|-------|------|------|-------------|
| `itemStack` | `ItemStack` | 9 | The item stack being picked up (mutable via setter) |

## Methods

| Method | Return Type | Line | Description |
|--------|-------------|------|-------------|
| `getItemStack()` | `@Nonnull ItemStack` | 16 | Gets the item stack being picked up |
| `setItemStack(@Nonnull ItemStack)` | `void` | 20 | Replaces the item stack (allows modification) |
| `isCancelled()` | `boolean` | - | Returns whether the event has been cancelled |
| `setCancelled(boolean)` | `void` | - | Sets the cancelled state of the event |

## Usage Example

```java
import com.hypixel.hytale.server.core.event.events.ecs.InteractivelyPickupItemEvent;
import com.hypixel.hytale.event.EventPriority;

public class PickupListener extends PluginBase {

    @Override
    public void onEnable() {
        getServer().getEventBus().register(
            EventPriority.NORMAL,
            InteractivelyPickupItemEvent.class,
            this::onItemPickup
        );
    }

    private void onItemPickup(InteractivelyPickupItemEvent event) {
        ItemStack item = event.getItemStack();

        getLogger().info("Player picking up: " + item.getAmount() + " items");

        // Access item properties
        // item.getItem() - Get the item type
        // item.getAmount() - Get the stack size
    }
}
```

### Modifying Picked Up Items

```java
// Example: Double all picked up items (bonus pickup)
getServer().getEventBus().register(
    EventPriority.NORMAL,
    InteractivelyPickupItemEvent.class,
    event -> {
        ItemStack original = event.getItemStack();

        // Create a new item stack with double the amount
        // ItemStack doubled = original.copy();
        // doubled.setAmount(original.getAmount() * 2);
        // event.setItemStack(doubled);

        getLogger().info("Applied pickup bonus!");
    }
);
```

### Filtering Pickups

```java
// Example: Prevent picking up certain items
getServer().getEventBus().register(
    EventPriority.FIRST,
    InteractivelyPickupItemEvent.class,
    event -> {
        ItemStack item = event.getItemStack();

        // Check if this is a restricted item
        // if (isRestrictedItem(item)) {
        //     event.setCancelled(true);
        //     // Item remains in the world
        // }
    }
);
```

### Logging Pickups

```java
// Example: Log all item pickups for analytics
getServer().getEventBus().register(
    EventPriority.LAST,
    InteractivelyPickupItemEvent.class,
    event -> {
        if (!event.isCancelled()) {
            ItemStack item = event.getItemStack();
            // Log the pickup
            // analyticsLogger.logPickup(player, item);
        }
    }
);
```

## When This Event Fires

The `InteractivelyPickupItemEvent` fires in the following scenarios:

1. **Direct Pickup**: When a player walks over an item entity and collects it
2. **Manual Collection**: When a player explicitly interacts to pick up an item
3. **Magnet Effects**: When items are pulled toward the player by game mechanics
4. **Loot Collection**: When picking up drops from defeated entities
5. **Ground Items**: When collecting items that have been dropped in the world

**Note**: This event specifically covers **interactive** pickups. Programmatic inventory insertions may use different event pathways.

## Cancellation Behavior

When this event is cancelled:

- The item will **not** be added to the player's inventory
- The item entity **remains in the world** at its current position
- The player receives no notification of the failed pickup
- Other players can still attempt to pick up the item

```java
// Example: Item ownership system - only original owner can pick up
getServer().getEventBus().register(
    EventPriority.FIRST,
    InteractivelyPickupItemEvent.class,
    event -> {
        ItemStack item = event.getItemStack();

        // Check if item has owner metadata and player is not owner
        // if (hasOwner(item) && !isOwner(player, item)) {
        //     event.setCancelled(true);
        //     // Optionally send "Not your item" message
        // }
    }
);
```

## Item Modification

The `setItemStack()` method allows you to modify what the player actually receives:

```java
// Example: Random bonus items
getServer().getEventBus().register(
    InteractivelyPickupItemEvent.class,
    event -> {
        ItemStack original = event.getItemStack();

        // 10% chance for bonus
        if (Math.random() < 0.1) {
            // Modify the item or add bonus
            // ItemStack bonus = createBonusItem(original);
            // event.setItemStack(bonus);
        }
    }
);
```

**Important**: When using `setItemStack()`:
- The new `ItemStack` must not be null (marked `@Nonnull`)
- The original item entity is consumed regardless of what you set
- You can change item type, amount, metadata, or any other property

## Related Events

- **[DropItemEvent](./drop-item-event.md)** - Fires when an item is dropped (opposite action)
- **[SwitchActiveSlotEvent](./switch-active-slot-event.md)** - Fires when switching hotbar slots
- **LivingEntityInventoryChangeEvent** - Fires on any inventory change
- **[CraftRecipeEvent](./craft-recipe-event.md)** - Fires when items are created via crafting

## Source Reference

- **Class**: `com.hypixel.hytale.server.core.event.events.ecs.InteractivelyPickupItemEvent`
- **Source**: `decompiled/com/hypixel/hytale/server/core/event/events/ecs/InteractivelyPickupItemEvent.java`
- **Line**: 7
- **Parent**: `CancellableEcsEvent` (`com.hypixel.hytale.component.system.CancellableEcsEvent`)
