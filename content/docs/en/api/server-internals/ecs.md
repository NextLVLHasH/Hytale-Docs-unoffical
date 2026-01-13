---
id: ecs
title: ECS (Entity Component System)
sidebar_label: ECS
sidebar_position: 6
description: Complete documentation of the Hytale server ECS system
---

# Entity Component System (ECS)

:::caution v1 Documentation
This documentation is a first version based on decompiled code analysis. It will be updated regularly.
:::

## What is an ECS?

An **Entity Component System** is a software architecture pattern commonly used in game development. It's fundamentally different from traditional object-oriented programming and offers significant performance and flexibility benefits.

### The Problem with Traditional OOP

In traditional object-oriented programming, you might create a class hierarchy like this:

```
GameObject
├── Character
│   ├── Player
│   ├── NPC
│   └── Enemy
├── Item
│   ├── Weapon
│   └── Consumable
└── Vehicle
```

This seems logical, but problems arise quickly:
- What if a Player can become a Vehicle (like a mount)?
- What if an Item needs health and can be attacked?
- Adding new behaviors requires modifying the class hierarchy

### The ECS Solution

ECS breaks everything into three simple concepts:

| Concept | What it is | Example |
|---------|------------|---------|
| **Entity** | Just an ID number | Entity #42 |
| **Component** | Pure data attached to entities | `Position(x: 10, y: 5, z: 20)`, `Health(current: 80, max: 100)` |
| **System** | Logic that processes entities with specific components | "Every tick, reduce hunger for entities with Hunger component" |

**Think of it like a spreadsheet:**

| Entity ID | Position | Health | Inventory | AI | Player |
|-----------|----------|--------|-----------|----|----|
| 1 | (10, 5, 20) | 100/100 | 64 items | - | Yes |
| 2 | (50, 10, 30) | 50/80 | - | Hostile | - |
| 3 | (0, 0, 0) | - | 10 items | - | - |

- Entity 1 is a Player with position, health, and inventory
- Entity 2 is an Enemy with position, health, and AI
- Entity 3 is a Chest with just position and inventory

### Why Hytale Uses ECS

1. **Performance**: Entities with the same components are stored together in memory (cache-friendly)
2. **Flexibility**: Add/remove behaviors at runtime by adding/removing components
3. **Parallelization**: Systems can run on different CPU cores simultaneously
4. **Modularity**: Systems are independent and can be added/removed easily

### Real-World Analogy

Imagine you're organizing a party and tracking guests:

- **OOP approach**: Create different classes for "VIP Guest", "Regular Guest", "Staff", etc. What about a VIP who is also Staff?
- **ECS approach**: Each person (entity) has tags/components: "HasVIPBadge", "IsStaff", "NeedsParking", etc. You can mix and match freely.

---

## Hytale's ECS Implementation

This documentation describes the Entity Component System (ECS) used by the Hytale server. This system is responsible for managing entities, their components, and the systems that process them.

## General Architecture

```
+-----------------------------------------------------------------------------------+
|                              ComponentRegistry                                     |
|  +-------------+  +-------------+  +-------------+  +-------------+               |
|  | ComponentType|  | SystemType  |  | SystemGroup |  | ResourceType|               |
|  +-------------+  +-------------+  +-------------+  +-------------+               |
+-----------------------------------------------------------------------------------+
                                    |
                                    v
+-----------------------------------------------------------------------------------+
|                                  Store                                             |
|  +-----------------+  +-----------------+  +-----------------+                     |
|  | ArchetypeChunk  |  | ArchetypeChunk  |  | ArchetypeChunk  |  (entity groups)    |
|  | [Entity,Entity] |  | [Entity,Entity] |  | [Entity,Entity] |                     |
|  +-----------------+  +-----------------+  +-----------------+                     |
|                                                                                    |
|  +-----------------+  +-----------------+  +-----------------+                     |
|  |    Resource     |  |    Resource     |  |    Resource     |  (global data)      |
|  +-----------------+  +-----------------+  +-----------------+                     |
+-----------------------------------------------------------------------------------+
                                    |
                                    v
+-----------------------------------------------------------------------------------+
|                                 Systems                                            |
|  +-----------------+  +-----------------+  +-----------------+                     |
|  | TickingSystem   |  | RefSystem       |  | EventSystem     |                     |
|  +-----------------+  +-----------------+  +-----------------+                     |
+-----------------------------------------------------------------------------------+
```

## Core Concepts

### 1. Component

A `Component` is a unit of data attached to an entity. It contains no logic, only data.

```java
public interface Component<ECS_TYPE> extends Cloneable {
    @Nullable
    Component<ECS_TYPE> clone();

    @Nullable
    default Component<ECS_TYPE> cloneSerializable() {
        return this.clone();
    }
}
```

**Example of a simple component:**

```java
public class TransformComponent implements Component<EntityStore> {
    private final Vector3d position = new Vector3d();
    private final Vector3f rotation = new Vector3f();

    public static final BuilderCodec<TransformComponent> CODEC =
        BuilderCodec.builder(TransformComponent.class, TransformComponent::new)
            .append(new KeyedCodec<>("Position", Vector3d.CODEC),
                    (o, i) -> o.position.assign(i), o -> o.position)
            .add()
            .append(new KeyedCodec<>("Rotation", Vector3f.ROTATION),
                    (o, i) -> o.rotation.assign(i), o -> o.rotation)
            .add()
            .build();

    @Nonnull
    public Vector3d getPosition() {
        return this.position;
    }

    @Nonnull
    @Override
    public Component<EntityStore> clone() {
        return new TransformComponent(this.position, this.rotation);
    }
}
```

### 2. ComponentType

A `ComponentType` is a unique identifier for a component type within the registry.

```java
public class ComponentType<ECS_TYPE, T extends Component<ECS_TYPE>>
    implements Comparable<ComponentType<ECS_TYPE, ?>>, Query<ECS_TYPE> {

    private ComponentRegistry<ECS_TYPE> registry;
    private Class<? super T> tClass;
    private int index;  // Unique index in the registry

    public int getIndex() { return this.index; }
    public Class<? super T> getTypeClass() { return this.tClass; }
}
```

### 3. Archetype

An `Archetype` represents a unique set of component types. All entities sharing the same archetype are stored together to optimize performance.

```java
public class Archetype<ECS_TYPE> implements Query<ECS_TYPE> {
    private final int minIndex;
    private final int count;
    private final ComponentType<ECS_TYPE, ?>[] componentTypes;

    // Create an archetype
    public static <ECS_TYPE> Archetype<ECS_TYPE> of(ComponentType<ECS_TYPE, ?>... componentTypes);

    // Add a component to the archetype
    public static <ECS_TYPE, T extends Component<ECS_TYPE>> Archetype<ECS_TYPE> add(
        Archetype<ECS_TYPE> archetype, ComponentType<ECS_TYPE, T> componentType);

    // Remove a component from the archetype
    public static <ECS_TYPE, T extends Component<ECS_TYPE>> Archetype<ECS_TYPE> remove(
        Archetype<ECS_TYPE> archetype, ComponentType<ECS_TYPE, T> componentType);

    // Check if the archetype contains a component type
    public boolean contains(ComponentType<ECS_TYPE, ?> componentType);
}
```

### 4. ArchetypeChunk

An `ArchetypeChunk` stores all entities that share the same archetype. It is a data structure optimized for cache access.

```java
public class ArchetypeChunk<ECS_TYPE> {
    protected final Store<ECS_TYPE> store;
    protected final Archetype<ECS_TYPE> archetype;
    protected int entitiesSize;
    protected Ref<ECS_TYPE>[] refs;           // Entity references
    protected Component<ECS_TYPE>[][] components;  // Component data

    // Get a component for an entity at a given index
    public <T extends Component<ECS_TYPE>> T getComponent(
        int index, ComponentType<ECS_TYPE, T> componentType);

    // Set a component
    public <T extends Component<ECS_TYPE>> void setComponent(
        int index, ComponentType<ECS_TYPE, T> componentType, T component);

    // Add an entity
    public int addEntity(Ref<ECS_TYPE> ref, Holder<ECS_TYPE> holder);

    // Remove an entity
    public Holder<ECS_TYPE> removeEntity(int entityIndex, Holder<ECS_TYPE> target);
}
```

### 5. Holder (EntityHolder)

A `Holder` is a temporary container for an entity's components before it is added to the Store.

```java
public class Holder<ECS_TYPE> {
    private Archetype<ECS_TYPE> archetype;
    private Component<ECS_TYPE>[] components;

    // Add a component
    public <T extends Component<ECS_TYPE>> void addComponent(
        ComponentType<ECS_TYPE, T> componentType, T component);

    // Get a component
    public <T extends Component<ECS_TYPE>> T getComponent(
        ComponentType<ECS_TYPE, T> componentType);

    // Remove a component
    public <T extends Component<ECS_TYPE>> void removeComponent(
        ComponentType<ECS_TYPE, T> componentType);

    // Ensure a component exists (create it if absent)
    public <T extends Component<ECS_TYPE>> void ensureComponent(
        ComponentType<ECS_TYPE, T> componentType);
}
```

### 6. Ref (Entity Reference)

A `Ref` is a reference to an entity in the Store. It contains the entity's index and can be invalidated.

```java
public class Ref<ECS_TYPE> {
    private final Store<ECS_TYPE> store;
    private volatile int index;

    public Store<ECS_TYPE> getStore() { return this.store; }
    public int getIndex() { return this.index; }

    public boolean isValid() { return this.index != Integer.MIN_VALUE; }
    public void validate() {
        if (!isValid()) throw new IllegalStateException("Invalid entity reference!");
    }
}
```

### 7. Store

The `Store` is the main container that manages all entities and their components.

```java
public class Store<ECS_TYPE> implements ComponentAccessor<ECS_TYPE> {
    private final ComponentRegistry<ECS_TYPE> registry;
    private final ECS_TYPE externalData;
    private Ref<ECS_TYPE>[] refs;
    private ArchetypeChunk<ECS_TYPE>[] archetypeChunks;
    private Resource<ECS_TYPE>[] resources;

    // Add an entity
    public Ref<ECS_TYPE> addEntity(Holder<ECS_TYPE> holder, AddReason reason);

    // Remove an entity
    public void removeEntity(Ref<ECS_TYPE> ref, RemoveReason reason);

    // Get a component
    public <T extends Component<ECS_TYPE>> T getComponent(
        Ref<ECS_TYPE> ref, ComponentType<ECS_TYPE, T> componentType);

    // Get an entity's archetype
    public Archetype<ECS_TYPE> getArchetype(Ref<ECS_TYPE> ref);

    // Get a global resource
    public <T extends Resource<ECS_TYPE>> T getResource(ResourceType<ECS_TYPE, T> resourceType);
}
```

### 8. Resource

A `Resource` is global data shared across the entire Store (unlike Components, which are per-entity).

```java
public interface Resource<ECS_TYPE> extends Cloneable {
    Resource<ECS_TYPE> clone();
}
```

---

## ComponentRegistry

The `ComponentRegistry` is the central registry that manages all component types, systems, and resources.

```
+------------------------------------------------------------------+
|                        ComponentRegistry                          |
|                                                                   |
|  Components:                                                      |
|  +------------------+  +------------------+  +------------------+ |
|  | ComponentType[0] |  | ComponentType[1] |  | ComponentType[2] | |
|  | TransformComp    |  | BoundingBox      |  | UUIDComponent    | |
|  +------------------+  +------------------+  +------------------+ |
|                                                                   |
|  Resources:                                                       |
|  +------------------+  +------------------+                       |
|  | ResourceType[0]  |  | ResourceType[1]  |                       |
|  | SpatialResource  |  | WorldResource    |                       |
|  +------------------+  +------------------+                       |
|                                                                   |
|  SystemTypes:                                                     |
|  +------------------+  +------------------+  +------------------+ |
|  | TickingSystem    |  | RefSystem        |  | QuerySystem      | |
|  +------------------+  +------------------+  +------------------+ |
|                                                                   |
|  Systems (sorted by dependency):                                  |
|  +------------------+  +------------------+  +------------------+ |
|  | System[0]        |  | System[1]        |  | System[2]        | |
|  +------------------+  +------------------+  +------------------+ |
+------------------------------------------------------------------+
```

### Registering Components

```java
// Component without serialization
ComponentType<EntityStore, MyComponent> MY_COMPONENT =
    registry.registerComponent(MyComponent.class, MyComponent::new);

// Component with serialization (Codec)
ComponentType<EntityStore, TransformComponent> TRANSFORM =
    registry.registerComponent(TransformComponent.class, "Transform", TransformComponent.CODEC);
```

### Registering Resources

```java
// Resource without serialization
ResourceType<EntityStore, MyResource> MY_RESOURCE =
    registry.registerResource(MyResource.class, MyResource::new);

// Resource with serialization
ResourceType<EntityStore, MyResource> MY_RESOURCE =
    registry.registerResource(MyResource.class, "MyResource", MyResource.CODEC);
```

### Special Built-in Components

```java
// Marks an entity as not being ticked
ComponentType<ECS_TYPE, NonTicking<ECS_TYPE>> nonTickingComponentType;

// Marks an entity as not being serialized
ComponentType<ECS_TYPE, NonSerialized<ECS_TYPE>> nonSerializedComponentType;

// Stores unknown components during deserialization
ComponentType<ECS_TYPE, UnknownComponents<ECS_TYPE>> unknownComponentType;
```

---

## Creating a Custom Component

### Step 1: Define the Component Class

```java
public class HealthComponent implements Component<EntityStore> {

    // Codec for serialization
    public static final BuilderCodec<HealthComponent> CODEC =
        BuilderCodec.builder(HealthComponent.class, HealthComponent::new)
            .append(new KeyedCodec<>("MaxHealth", Codec.FLOAT),
                    (c, v) -> c.maxHealth = v, c -> c.maxHealth)
            .add()
            .append(new KeyedCodec<>("CurrentHealth", Codec.FLOAT),
                    (c, v) -> c.currentHealth = v, c -> c.currentHealth)
            .add()
            .build();

    private float maxHealth = 100.0f;
    private float currentHealth = 100.0f;

    public HealthComponent() {}

    public HealthComponent(float maxHealth, float currentHealth) {
        this.maxHealth = maxHealth;
        this.currentHealth = currentHealth;
    }

    // Getters and setters
    public float getMaxHealth() { return maxHealth; }
    public void setMaxHealth(float maxHealth) { this.maxHealth = maxHealth; }
    public float getCurrentHealth() { return currentHealth; }
    public void setCurrentHealth(float currentHealth) { this.currentHealth = currentHealth; }

    public void damage(float amount) {
        this.currentHealth = Math.max(0, this.currentHealth - amount);
    }

    public void heal(float amount) {
        this.currentHealth = Math.min(this.maxHealth, this.currentHealth + amount);
    }

    public boolean isDead() {
        return this.currentHealth <= 0;
    }

    // REQUIRED: Implementation of clone()
    @Override
    public Component<EntityStore> clone() {
        return new HealthComponent(this.maxHealth, this.currentHealth);
    }
}
```

### Step 2: Register the Component

```java
// In your module or initialization system
public class MyModule {
    private static ComponentType<EntityStore, HealthComponent> HEALTH_COMPONENT_TYPE;

    public static void init(ComponentRegistry<EntityStore> registry) {
        // Registration with serialization
        HEALTH_COMPONENT_TYPE = registry.registerComponent(
            HealthComponent.class,
            "Health",           // Unique ID for serialization
            HealthComponent.CODEC
        );
    }

    public static ComponentType<EntityStore, HealthComponent> getHealthComponentType() {
        return HEALTH_COMPONENT_TYPE;
    }
}
```

### Step 3: Use the Component

```java
// Create an entity with the component
Holder<EntityStore> holder = registry.newHolder();
holder.addComponent(MyModule.getHealthComponentType(), new HealthComponent(100, 100));
Ref<EntityStore> entityRef = store.addEntity(holder, AddReason.SPAWN);

// Access the component
HealthComponent health = store.getComponent(entityRef, MyModule.getHealthComponentType());
health.damage(25);

// Check if the entity has the component
Archetype<EntityStore> archetype = store.getArchetype(entityRef);
if (archetype.contains(MyModule.getHealthComponentType())) {
    // The entity has a Health component
}
```

---

## Query System

Queries allow you to filter entities based on their components.

### Query Interface

```java
public interface Query<ECS_TYPE> {
    // Tests whether an archetype matches the query
    boolean test(Archetype<ECS_TYPE> archetype);

    // Checks if the query depends on a specific component type
    boolean requiresComponentType(ComponentType<ECS_TYPE, ?> componentType);

    // Factory methods
    static <ECS_TYPE> AnyQuery<ECS_TYPE> any();           // Matches everything
    static <ECS_TYPE> NotQuery<ECS_TYPE> not(Query<ECS_TYPE> query);  // Negation
    static <ECS_TYPE> AndQuery<ECS_TYPE> and(Query<ECS_TYPE>... queries);  // Logical AND
    static <ECS_TYPE> OrQuery<ECS_TYPE> or(Query<ECS_TYPE>... queries);   // Logical OR
}
```

### Query Types

```
Query (interface)
  |
  +-- Archetype (an archetype is also a query)
  |
  +-- ComponentType (a ComponentType is also a query)
  |
  +-- AnyQuery (matches everything)
  |
  +-- NotQuery (negation)
  |
  +-- AndQuery (logical AND)
  |
  +-- OrQuery (logical OR)
  |
  +-- ExactArchetypeQuery (exact archetype match)
  |
  +-- ReadWriteArchetypeQuery (interface)
       |
       +-- ReadWriteQuery (implementation)
```

### ReadWriteQuery

The `ReadWriteQuery` distinguishes between read-only components and modified components.

```java
public class ReadWriteQuery<ECS_TYPE> implements ReadWriteArchetypeQuery<ECS_TYPE> {
    private final Archetype<ECS_TYPE> read;   // Components being read
    private final Archetype<ECS_TYPE> write;  // Components being modified

    public ReadWriteQuery(Archetype<ECS_TYPE> read, Archetype<ECS_TYPE> write) {
        this.read = read;
        this.write = write;
    }

    @Override
    public boolean test(Archetype<ECS_TYPE> archetype) {
        return archetype.contains(this.read) && archetype.contains(this.write);
    }
}
```

### Usage Examples

```java
// Simple query: all entities with TransformComponent
Query<EntityStore> hasTransform = TransformComponent.getComponentType();

// Combined query: entities with Transform AND Health
Query<EntityStore> query = Query.and(
    TransformComponent.getComponentType(),
    MyModule.getHealthComponentType()
);

// Query with negation: entities with Transform but WITHOUT Health
Query<EntityStore> query = Query.and(
    TransformComponent.getComponentType(),
    Query.not(MyModule.getHealthComponentType())
);

// Archetype as query
Archetype<EntityStore> archetype = Archetype.of(
    TransformComponent.getComponentType(),
    BoundingBox.getComponentType()
);
// Tests if an entity has AT LEAST these components

// ReadWriteQuery for a system that reads Transform and modifies Health
ReadWriteQuery<EntityStore> query = new ReadWriteQuery<>(
    Archetype.of(TransformComponent.getComponentType()),  // Read
    Archetype.of(MyModule.getHealthComponentType())       // Write
);
```

---

## Systems and SystemGroups

### System Hierarchy

```
ISystem (interface)
  |
  +-- System (abstract base)
       |
       +-- QuerySystem (interface) - systems that filter by archetype
       |    |
       |    +-- RefSystem - callback on entity add/remove
       |    |
       |    +-- HolderSystem - callback on holder before add
       |    |
       |    +-- TickingSystem
       |         |
       |         +-- ArchetypeTickingSystem
       |              |
       |              +-- EntityTickingSystem
       |
       +-- EventSystem
            |
            +-- EntityEventSystem - events on entities
            |
            +-- WorldEventSystem - global events
```

### ISystem

Base interface for all systems.

```java
public interface ISystem<ECS_TYPE> {
    // Lifecycle callbacks
    default void onSystemRegistered() {}
    default void onSystemUnregistered() {}

    // Group this system belongs to
    default SystemGroup<ECS_TYPE> getGroup() { return null; }

    // Dependencies for execution order
    default Set<Dependency<ECS_TYPE>> getDependencies() {
        return Collections.emptySet();
    }
}
```

### System (Base Class)

```java
public abstract class System<ECS_TYPE> implements ISystem<ECS_TYPE> {

    // Register a component associated with this system
    protected <T extends Component<ECS_TYPE>> ComponentType<ECS_TYPE, T> registerComponent(
        Class<? super T> tClass, Supplier<T> supplier);

    protected <T extends Component<ECS_TYPE>> ComponentType<ECS_TYPE, T> registerComponent(
        Class<? super T> tClass, String id, BuilderCodec<T> codec);

    // Register a resource associated with this system
    public <T extends Resource<ECS_TYPE>> ResourceType<ECS_TYPE, T> registerResource(
        Class<? super T> tClass, Supplier<T> supplier);
}
```

### TickingSystem

A system that executes on every tick.

```java
public abstract class TickingSystem<ECS_TYPE> extends System<ECS_TYPE>
    implements TickableSystem<ECS_TYPE> {

    // dt = delta time, systemIndex = index of the system
    public abstract void tick(float dt, int systemIndex, Store<ECS_TYPE> store);
}
```

### ArchetypeTickingSystem

A ticking system that filters by archetype.

```java
public abstract class ArchetypeTickingSystem<ECS_TYPE> extends TickingSystem<ECS_TYPE>
    implements QuerySystem<ECS_TYPE> {

    // Query to filter entities
    public abstract Query<ECS_TYPE> getQuery();

    // Tick on each matching ArchetypeChunk
    public abstract void tick(
        float dt,
        ArchetypeChunk<ECS_TYPE> archetypeChunk,
        Store<ECS_TYPE> store,
        CommandBuffer<ECS_TYPE> commandBuffer
    );
}
```

### EntityTickingSystem

A ticking system that iterates over each entity.

```java
public abstract class EntityTickingSystem<ECS_TYPE> extends ArchetypeTickingSystem<ECS_TYPE> {

    // Tick on a specific entity
    public abstract void tick(
        float dt,
        int index,                         // Index in the ArchetypeChunk
        ArchetypeChunk<ECS_TYPE> archetypeChunk,
        Store<ECS_TYPE> store,
        CommandBuffer<ECS_TYPE> commandBuffer
    );

    // Parallelism support
    public boolean isParallel(int archetypeChunkSize, int taskCount) {
        return false;
    }
}
```

### RefSystem

A system that reacts to entity addition and removal.

```java
public abstract class RefSystem<ECS_TYPE> extends System<ECS_TYPE>
    implements QuerySystem<ECS_TYPE> {

    // Query to filter relevant entities
    public abstract Query<ECS_TYPE> getQuery();

    // Called when an entity matching the query is added
    public abstract void onEntityAdded(
        Ref<ECS_TYPE> ref,
        AddReason reason,
        Store<ECS_TYPE> store,
        CommandBuffer<ECS_TYPE> commandBuffer
    );

    // Called when an entity matching the query is removed
    public abstract void onEntityRemove(
        Ref<ECS_TYPE> ref,
        RemoveReason reason,
        Store<ECS_TYPE> store,
        CommandBuffer<ECS_TYPE> commandBuffer
    );
}
```

### SystemGroup

A group of systems for organizing execution order.

```java
public class SystemGroup<ECS_TYPE> {
    private final ComponentRegistry<ECS_TYPE> registry;
    private final int index;
    private final Set<Dependency<ECS_TYPE>> dependencies;
}
```

### Dependencies (Execution Order)

```java
public enum Order {
    BEFORE,  // Execute before the dependency
    AFTER    // Execute after the dependency
}

public abstract class Dependency<ECS_TYPE> {
    protected final Order order;
    protected final int priority;

    public Dependency(Order order, int priority);
    public Dependency(Order order, OrderPriority priority);
}

// Dependency types
// - SystemDependency: dependency on a specific system
// - SystemTypeDependency: dependency on a system type
// - SystemGroupDependency: dependency on a system group
// - RootDependency: root dependency
```

---

## Complete Example: Creating a System

```java
public class HealthRegenSystem extends EntityTickingSystem<EntityStore> {

    private static ComponentType<EntityStore, HealthComponent> HEALTH;

    // Query: entities with Health
    private final Query<EntityStore> query;

    public HealthRegenSystem() {
        HEALTH = this.registerComponent(
            HealthComponent.class,
            "Health",
            HealthComponent.CODEC
        );
        this.query = HEALTH;
    }

    @Override
    public Query<EntityStore> getQuery() {
        return this.query;
    }

    @Override
    public Set<Dependency<EntityStore>> getDependencies() {
        // Execute after the damage system
        return Set.of(
            new SystemTypeDependency<>(Order.AFTER, DamageSystem.class)
        );
    }

    @Override
    public void tick(
        float dt,
        int index,
        ArchetypeChunk<EntityStore> chunk,
        Store<EntityStore> store,
        CommandBuffer<EntityStore> buffer
    ) {
        // Get the Health component for this entity
        HealthComponent health = chunk.getComponent(index, HEALTH);

        // Regenerate 1 HP per second
        if (!health.isDead()) {
            health.heal(dt * 1.0f);
        }
    }
}
```

---

## Entities: Entity, LivingEntity, Player

### Entity Hierarchy

```
Component<EntityStore> (interface)
  |
  +-- Entity (abstract)
       |
       +-- LivingEntity (abstract)
       |    |
       |    +-- Player
       |    |
       |    +-- (other living entities)
       |
       +-- BlockEntity
       |
       +-- (other entity types)
```

### Entity

The base class for all game entities.

```java
public abstract class Entity implements Component<EntityStore> {
    protected int networkId = -1;
    protected World world;
    protected Ref<EntityStore> reference;
    protected final AtomicBoolean wasRemoved = new AtomicBoolean();

    // Codec for serialization
    public static final BuilderCodec<Entity> CODEC =
        BuilderCodec.abstractBuilder(Entity.class)
            .legacyVersioned()
            .codecVersion(5)
            .append(DISPLAY_NAME, ...)
            .append(UUID, ...)
            .build();

    // Remove the entity from the world
    public boolean remove();

    // Load the entity into a world
    public void loadIntoWorld(World world);

    // Reference to the entity in the ECS
    public Ref<EntityStore> getReference();

    // Convert to Holder for serialization/copying
    public Holder<EntityStore> toHolder();
}
```

### LivingEntity

An entity with an inventory and stats.

```java
public abstract class LivingEntity extends Entity {
    private final StatModifiersManager statModifiersManager = new StatModifiersManager();
    private Inventory inventory;
    protected double currentFallDistance;

    public static final BuilderCodec<LivingEntity> CODEC =
        BuilderCodec.abstractBuilder(LivingEntity.class, Entity.CODEC)
            .append(new KeyedCodec<>("Inventory", Inventory.CODEC), ...)
            .build();

    // Create the default inventory
    protected abstract Inventory createDefaultInventory();

    // Inventory management
    public Inventory getInventory();
    public Inventory setInventory(Inventory inventory);

    // Fall damage management
    public double getCurrentFallDistance();

    // Stat modifiers
    public StatModifiersManager getStatModifiersManager();
}
```

### Player

The connected player.

```java
public class Player extends LivingEntity implements CommandSender, PermissionHolder {
    private PlayerRef playerRef;
    private PlayerConfigData data;
    private final WorldMapTracker worldMapTracker;
    private final WindowManager windowManager;
    private final PageManager pageManager;
    private final HudManager hudManager;
    private HotbarManager hotbarManager;
    private GameMode gameMode;

    public static final BuilderCodec<Player> CODEC =
        BuilderCodec.builder(Player.class, Player::new, LivingEntity.CODEC)
            .append(PLAYER_CONFIG_DATA, ...)
            .append(GameMode, ...)
            .build();

    // ComponentType to identify players
    public static ComponentType<EntityStore, Player> getComponentType() {
        return EntityModule.get().getPlayerComponentType();
    }

    // Player initialization
    public void init(UUID uuid, PlayerRef playerRef);

    // GameMode management
    public GameMode getGameMode();
    public void setGameMode(GameMode gameMode);

    // UI managers
    public WindowManager getWindowManager();
    public PageManager getPageManager();
    public HudManager getHudManager();
}
```

---

## Important Built-in Components

### TransformComponent

The position and rotation of an entity.

```java
public class TransformComponent implements Component<EntityStore> {
    private final Vector3d position = new Vector3d();
    private final Vector3f rotation = new Vector3f();

    public static ComponentType<EntityStore, TransformComponent> getComponentType();

    public Vector3d getPosition();
    public Vector3f getRotation();
    public Transform getTransform();
}
```

### BoundingBox

The collision box of an entity.

```java
public class BoundingBox implements Component<EntityStore> {
    private final Box boundingBox = new Box();

    public static ComponentType<EntityStore, BoundingBox> getComponentType();

    public Box getBoundingBox();
    public void setBoundingBox(Box boundingBox);
}
```

### UUIDComponent

The persistent unique identifier of an entity.

```java
public final class UUIDComponent implements Component<EntityStore> {
    private UUID uuid;

    public static ComponentType<EntityStore, UUIDComponent> getComponentType();

    public UUID getUuid();

    public static UUIDComponent generateVersion3UUID();
    public static UUIDComponent randomUUID();
}
```

### NonTicking

Marks an entity so that it is not processed by TickingSystems.

```java
public class NonTicking<ECS_TYPE> implements Component<ECS_TYPE> {
    private static final NonTicking<?> INSTANCE = new NonTicking();

    public static <ECS_TYPE> NonTicking<ECS_TYPE> get();
}

// Usage: add this component to disable ticking
holder.addComponent(registry.getNonTickingComponentType(), NonTicking.get());
```

### NonSerialized

Marks an entity so that it is not saved.

```java
public class NonSerialized<ECS_TYPE> implements Component<ECS_TYPE> {
    private static final NonSerialized<?> INSTANCE = new NonSerialized();

    public static <ECS_TYPE> NonSerialized<ECS_TYPE> get();
}

// Usage: add this component to prevent saving
holder.addComponent(registry.getNonSerializedComponentType(), NonSerialized.get());
```

### Other Important Components

| Component | Description |
|-----------|-------------|
| `Velocity` | Entity velocity |
| `CollisionResultComponent` | Collision results |
| `ModelComponent` | Entity 3D model |
| `DisplayNameComponent` | Display name |
| `MovementStatesComponent` | Movement states (on ground, flying, etc.) |
| `KnockbackComponent` | Knockback after a hit |
| `DamageDataComponent` | Damage data received |
| `ProjectileComponent` | Component for projectiles |
| `EffectControllerComponent` | Active effects on the entity |

---

## CommandBuffer

The `CommandBuffer` allows deferred (thread-safe) modifications to the Store.

```java
public class CommandBuffer<ECS_TYPE> implements ComponentAccessor<ECS_TYPE> {
    private final Store<ECS_TYPE> store;
    private final Deque<Consumer<Store<ECS_TYPE>>> queue;

    // Add an action to execute later
    public void run(Consumer<Store<ECS_TYPE>> consumer);

    // Add an entity
    public Ref<ECS_TYPE> addEntity(Holder<ECS_TYPE> holder, AddReason reason);

    // Remove an entity
    public void removeEntity(Ref<ECS_TYPE> ref, RemoveReason reason);

    // Read a component (immediate access)
    public <T extends Component<ECS_TYPE>> T getComponent(
        Ref<ECS_TYPE> ref, ComponentType<ECS_TYPE, T> componentType);

    // Add a component to an entity
    public <T extends Component<ECS_TYPE>> void addComponent(
        Ref<ECS_TYPE> ref, ComponentType<ECS_TYPE, T> componentType, T component);

    // Remove a component from an entity
    public <T extends Component<ECS_TYPE>> void removeComponent(
        Ref<ECS_TYPE> ref, ComponentType<ECS_TYPE, T> componentType);

    // Dispatch an event
    public <T extends EcsEvent> void dispatchEntityEvent(
        EntityEventType<ECS_TYPE, T> eventType, Ref<ECS_TYPE> ref, T event);

    public <T extends EcsEvent> void dispatchWorldEvent(
        WorldEventType<ECS_TYPE, T> eventType, T event);
}
```

---

## AddReason and RemoveReason

Enumerations indicating why an entity is added or removed.

```java
public enum AddReason {
    SPAWN,  // New entity created
    LOAD    // Entity loaded from save
}

public enum RemoveReason {
    REMOVE,  // Entity permanently removed
    UNLOAD   // Entity unloaded (saved)
}
```

---

## Data Flow

```
1. ENTITY CREATION
   +---------------+     +---------+     +--------+     +--------------+
   | Create Holder | --> | Add to  | --> | Store  | --> | RefSystems   |
   | with Components|     | Store   |     | assigns|     | onEntityAdded|
   +---------------+     +---------+     | Ref    |     +--------------+
                                          +--------+

2. TICK
   +--------+     +-----------------+     +------------------+
   | Store  | --> | For each System | --> | For each matching|
   | .tick()|     | (sorted)        |     | ArchetypeChunk   |
   +--------+     +-----------------+     +------------------+
                                                   |
                                                   v
                                          +------------------+
                                          | System.tick()    |
                                          | (with buffer)    |
                                          +------------------+

3. ARCHETYPE MODIFICATION (component add/remove)
   +-------------+     +------------------+     +------------------+
   | CommandBuffer| --> | Remove from old  | --> | Add to new       |
   | .addComponent|     | ArchetypeChunk   |     | ArchetypeChunk   |
   +-------------+     +------------------+     +------------------+

4. ENTITY REMOVAL
   +-------------+     +--------------+     +------------------+
   | CommandBuffer| --> | RefSystems   | --> | Remove from      |
   | .removeEntity|     | onEntityRemove|     | ArchetypeChunk   |
   +-------------+     +--------------+     +------------------+
```

---

## Best Practices

1. **Keep components simple**: Components should be simple data containers without complex logic.

2. **One responsibility per system**: Each system should have a single, clear responsibility.

3. **Use the CommandBuffer**: Never modify the Store directly during a tick. Always use the CommandBuffer.

4. **Efficient queries**: Use Archetypes rather than complex queries when possible.

5. **NonTicking for static entities**: Add `NonTicking` to entities that do not need to be updated.

6. **NonSerialized for temporary entities**: Add `NonSerialized` to entities that should not be saved.

7. **Explicit dependencies**: Always declare dependencies between systems to ensure correct execution order.

8. **Mandatory clone()**: Always implement `clone()` correctly for components that need to be copied.
