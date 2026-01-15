---
id: place-block-event
title: PlaceBlockEvent
sidebar_label: PlaceBlockEvent
---

# PlaceBlockEvent

Déclenché lorsqu'un bloc est sur le point d'etre place dans le monde. Cet événement permet aux plugins d'intercepter et d'annuler le placement de blocs, de modifier la position cible ou la rotation, ou d'executer une logique personnalisee lorsque des blocs sont places.

## Informations sur l'événement

| Propriété | Valeur |
|-----------|--------|
| **Nom complet de la classe** | `com.hypixel.hytale.server.core.event.events.ecs.PlaceBlockEvent` |
| **Classe parente** | `CancellableEcsEvent` |
| **Annulable** | Oui |
| **Evenement ECS** | Oui |
| **Fichier source** | `decompiled/com/hypixel/hytale/server/core/event/events/ecs/PlaceBlockEvent.java:11` |

## Declaration

```java
public class PlaceBlockEvent extends CancellableEcsEvent {
```

## Champs

| Champ | Type | Accesseur | Description |
|-------|------|-----------|-------------|
| `itemInHand` | `@Nullable ItemStack` | `getItemInHand()` | L'objet (bloc) en cours de placement depuis la main de l'entite (null si aucun objet en main) |
| `targetBlock` | `@Nonnull Vector3i` | `getTargetBlock()` | La position ou le bloc sera place |
| `rotation` | `@Nonnull RotationTuple` | `getRotation()` | La rotation/orientation du bloc place |

## Méthodes

| Méthode | Signature | Description |
|---------|-----------|-------------|
| `getItemInHand` | `@Nullable public ItemStack getItemInHand()` | Retourne la pile d'objets utilisee pour placer le bloc, ou null si aucun objet en main |
| `getTargetBlock` | `@Nonnull public Vector3i getTargetBlock()` | Retourne la position dans le monde ou le bloc sera place |
| `setTargetBlock` | `public void setTargetBlock(@Nonnull Vector3i targetBlock)` | Change la position de placement cible (ligne 35) |
| `getRotation` | `@Nonnull public RotationTuple getRotation()` | Retourne le tuple de rotation pour l'orientation du bloc |
| `setRotation` | `public void setRotation(@Nonnull RotationTuple rotation)` | Change la rotation/orientation du bloc (ligne 45) |
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

Créez une classe qui étend `EntityEventSystem<EntityStore, PlaceBlockEvent>` :

```java
package com.example.monplugin.systems;

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
        // Obtenir des informations sur le bloc en cours de placement
        int x = event.getTargetBlock().getX();
        int y = event.getTargetBlock().getY();
        int z = event.getTargetBlock().getZ();
        ItemStack blockItem = event.getItemInHand();
        RotationTuple rotation = event.getRotation();

        // Exemple : Appliquer les limites de hauteur de placement
        if (y > MAX_BUILD_HEIGHT) {
            event.setCancelled(true);
            return;
        }

        // Exemple : Logger le placement du bloc
        System.out.println("Bloc placé à [" + x + "," + y + "," + z + "]");
    }

    @Nullable
    @Override
    public Query<EntityStore> getQuery() {
        return Archetype.empty(); // Attraper les événements de toutes les entités
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
        getEntityStoreRegistry().registerSystem(new BlockPlaceSystem());
    }
}
```

### Notes importantes

- La méthode `getQuery()` détermine quelles entités ce système écoute. Retournez `Archetype.empty()` pour attraper les événements de toutes les entités.
- Les événements ECS ne sont **pas** enregistrés via `EventBus.register()` - cette approche ne fonctionnera pas pour ces événements.
- Chaque type d'événement ECS nécessite sa propre classe `EntityEventSystem`.

## Quand cet événement se déclenché

Le `PlaceBlockEvent` est déclenché lorsque :

1. **Un joueur place un bloc** - Quand un joueur fait un clic droit pour placer un bloc depuis son inventaire
2. **Une entite place un bloc** - Quand une entite (comme un mob de type enderman) place un bloc
3. **Placement programmatique** - Quand les systemes de jeu placent des blocs via les mecaniques de placement normales

L'événement se déclenché **avant** que le bloc soit reellement ajoute au monde, permettant aux gestionnaires de :
- Annuler complètement le placement
- Modifier la position cible
- Changer la rotation/orientation du bloc
- Suivre les placements de blocs a des fins de journalisation ou de gameplay

## Comportement de l'annulation

Lorsque l'événement est annule en appelant `setCancelled(true)` :

- Le bloc ne sera **pas** place dans le monde
- L'objet reste dans la main du joueur/de l'entite (non consomme)
- Aucun changement d'etat de bloc ne se produit a la position cible
- Le joueur/l'entite recoit un retour indiquant que l'action a ete bloquee

Ceci est utile pour :
- Les systemes de permissions de construction (claims, protection de parcelles)
- L'application des limites de hauteur
- La restriction de types de blocs spécifiques dans certaines zones
- L'anti-grief et la protection du monde
- Les modes de jeu personnalises avec des restrictions de construction

## Rotation des blocs

Le `RotationTuple` controle comment le bloc est oriente lorsqu'il est place. Ceci est particulierement important pour :

- Les blocs directionnels (escaliers, buches, piliers)
- Les blocs avec des directions de face (fours, coffres)
- Les blocs decoratifs avec plusieurs orientations

Vous pouvez utiliser `setRotation()` pour :
- Forcer les blocs a faire face a une direction spécifique
- Implementer des fonctionnalites de rotation automatique
- Creer des outils d'assistance a la construction

## Événements lies

- [BreakBlockEvent](./break-block-event) - Déclenché lorsqu'un bloc est casse
- [DamageBlockEvent](./damage-block-event) - Déclenché lorsqu'un bloc subit des degats
- [UseBlockEvent](./use-block-event) - Déclenché lorsqu'un bloc fait l'objet d'une interaction

## Référence source

`decompiled/com/hypixel/hytale/server/core/event/events/ecs/PlaceBlockEvent.java:11`
