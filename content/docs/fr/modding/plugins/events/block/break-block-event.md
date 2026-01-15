---
id: break-block-event
title: BreakBlockEvent
sidebar_label: BreakBlockEvent
---

# BreakBlockEvent

Déclenché lorsqu'un bloc est sur le point d'etre casse (detruit) dans le monde. Cet événement permet aux plugins d'intercepter et d'annuler la destruction de blocs, de modifier le bloc cible, ou d'executer une logique personnalisee lorsque des blocs sont detruits.

## Informations sur l'événement

| Propriété | Valeur |
|-----------|--------|
| **Nom complet de la classe** | `com.hypixel.hytale.server.core.event.events.ecs.BreakBlockEvent` |
| **Classe parente** | `CancellableEcsEvent` |
| **Annulable** | Oui |
| **Evenement ECS** | Oui |
| **Fichier source** | `decompiled/com/hypixel/hytale/server/core/event/events/ecs/BreakBlockEvent.java:10` |

## Declaration

```java
public class BreakBlockEvent extends CancellableEcsEvent {
```

## Champs

| Champ | Type | Accesseur | Description |
|-------|------|-----------|-------------|
| `itemInHand` | `@Nullable ItemStack` | `getItemInHand()` | L'objet que l'entite tient lorsqu'elle casse le bloc (null si aucun objet en main) |
| `targetBlock` | `@Nonnull Vector3i` | `getTargetBlock()` | La position du bloc en cours de destruction |
| `blockType` | `@Nonnull BlockType` | `getBlockType()` | Le type de bloc en cours de destruction |

## Méthodes

| Méthode | Signature | Description |
|---------|-----------|-------------|
| `getItemInHand` | `@Nullable public ItemStack getItemInHand()` | Retourne l'objet tenu par l'entite qui casse le bloc, ou null si aucun objet en main |
| `getTargetBlock` | `@Nonnull public Vector3i getTargetBlock()` | Retourne la position dans le monde du bloc cible |
| `setTargetBlock` | `public void setTargetBlock(@Nonnull Vector3i targetBlock)` | Change la position du bloc cible (ligne 39) |
| `getBlockType` | `@Nonnull public BlockType getBlockType()` | Retourne le type de bloc en cours de destruction |
| `isCancelled` | `public boolean isCancelled()` | Retourne si l'événement a ete annule (hérité) |
| `setCancelled` | `public void setCancelled(boolean cancelled)` | Definit l'etat d'annulation de l'événement (hérité) |

## Comprendre les événements ECS

**Important :** Les événements ECS (Entity Component System) fonctionnent différemment des événements `IEvent` classiques. Ils n'utilisent **pas** l'EventBus - ils nécessitent une classe `EntityEventSystem` dédiée enregistrée via `getEntityStoreRegistry().registerSystem()`.

Différences clés :
- Les événements ECS étendent `EcsEvent` ou `CancellableEcsEvent` au lieu d'implémenter `IEvent`
- Ils sont dispatchés via `entityStore.invoke()` dans le framework ECS
- Vous devez créer une sous-classe d'`EntityEventSystem` pour écouter ces événements
- Les systèmes sont enregistrés via `getEntityStoreRegistry().registerSystem()`

## Exemple d'utilisation

### Étape 1 : Créer l'EntityEventSystem

Créez une classe qui étend `EntityEventSystem<EntityStore, BreakBlockEvent>` :

```java
package com.example.monplugin.systems;

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
        // Obtenir des informations sur le bloc en cours de destruction
        int x = event.getTargetBlock().getX();
        int y = event.getTargetBlock().getY();
        int z = event.getTargetBlock().getZ();
        BlockType blockType = event.getBlockType();
        ItemStack toolUsed = event.getItemInHand();

        // Exemple : Empêcher la destruction de blocs protégés
        if (isProtectedBlock(blockType)) {
            event.setCancelled(true);
            return;
        }

        // Exemple : Logger la destruction du bloc
        System.out.println("Bloc cassé à [" + x + "," + y + "," + z + "] type=" + blockType);
    }

    @Nullable
    @Override
    public Query<EntityStore> getQuery() {
        return Archetype.empty(); // Attraper les événements de toutes les entités
    }

    private boolean isProtectedBlock(BlockType blockType) {
        // Logique de protection personnalisée
        return false;
    }
}
```

### Étape 2 : Enregistrer le système dans votre plugin

Dans la méthode `setup()` de votre plugin, enregistrez le système :

```java
public class MonPlugin extends JavaPlugin {

    public MonPlugin(@Nonnull JavaPluginInit init) {
        super(init);
    }

    @Override
    protected void setup() {
        // Enregistrer le système d'événement ECS
        getEntityStoreRegistry().registerSystem(new BlockBreakSystem());
    }
}
```

### Notes importantes

- La méthode `getQuery()` détermine quelles entités ce système écoute. Retournez `Archetype.empty()` pour attraper les événements de toutes les entités.
- Les événements ECS ne sont **pas** enregistrés via `EventBus.register()` - cette approche ne fonctionnera pas pour ces événements.
- Chaque type d'événement ECS nécessite sa propre classe `EntityEventSystem`.

## Quand cet événement se déclenché

Le `BreakBlockEvent` est déclenché lorsque :

1. **Un joueur casse un bloc** - Quand un joueur reussit a miner/casser un bloc apres que le seuil de degats est atteint
2. **Une entite detruit un bloc** - Quand une entite (mob, projectile, etc.) provoque la destruction d'un bloc
3. **Suppression de bloc programmatique** - Quand les systemes de jeu suppriment des blocs via les mecaniques de destruction normales

L'événement se déclenché **avant** que le bloc soit reellement retire du monde, permettant aux gestionnaires de :
- Annuler complètement la destruction
- Modifier quel bloc est detruit
- Suivre la destruction des blocs a des fins de journalisation ou de gameplay

## Comportement de l'annulation

Lorsque l'événement est annule en appelant `setCancelled(true)` :

- Le bloc ne sera **pas** retire du monde
- Le bloc reste dans son etat actuel
- Tout drop d'objet qui aurait eu lieu est empêché
- La perte de durabilite de l'outil peut toujours se produire (selon l'implementation)
- Le joueur/l'entite recoit un retour indiquant que l'action a ete bloquee

Ceci est utile pour :
- Les systemes de protection de blocs (claims, protection du spawn)
- Les restrictions de construction basees sur les permissions
- Les modes de jeu personnalises ou certains blocs ne peuvent pas etre casses
- Les mesures anti-grief

## Événements lies

- [PlaceBlockEvent](./place-block-event) - Déclenché lorsqu'un bloc est place
- [DamageBlockEvent](./damage-block-event) - Déclenché lorsqu'un bloc subit des degats (avant la destruction)
- [UseBlockEvent](./use-block-event) - Déclenché lorsqu'un bloc fait l'objet d'une interaction

## Référence source

`decompiled/com/hypixel/hytale/server/core/event/events/ecs/BreakBlockEvent.java:10`
