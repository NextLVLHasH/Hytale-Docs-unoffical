---
id: craft-recipe-event
title: CraftRecipeEvent
sidebar_label: CraftRecipeEvent
sidebar_position: 4
---

# CraftRecipeEvent

Une classe de base abstraite pour les événements lies a la fabrication. Cet événement se déclenché lorsqu'un joueur fabrique des objets en utilisant une recette, et fournit l'acces a la recette utilisee et a la quantite fabriquee. Il a deux implementations concretes : `Pre` (avant la fabrication) et `Post` (apres la fabrication).

## Informations sur l'événement

| Propriété | Valeur |
|-----------|--------|
| **Nom complet de la classe** | `com.hypixel.hytale.server.core.event.events.ecs.CraftRecipeEvent` |
| **Classe parente** | `CancellableEcsEvent` |
| **Annulable** | Oui |
| **Événement ECS** | Oui |
| **Abstraite** | Oui |
| **Fichier source** | `com/hypixel/hytale/server/core/event/events/ecs/CraftRecipeEvent.java:7` |

## Declaration

```java
public abstract class CraftRecipeEvent extends CancellableEcsEvent {
    @Nonnull
    private final CraftingRecipe craftedRecipe;
    private final int quantity;

    // Constructeur et methodes...
}
```

## Champs

| Champ | Type | Ligne | Description |
|-------|------|-------|-------------|
| `craftedRecipe` | `CraftingRecipe` | 9 | La recette en cours de fabrication |
| `quantity` | `int` | 10 | Le nombre de fois que la recette est fabriquee |

## Méthodes

| Méthode | Type de retour | Description |
|---------|----------------|-------------|
| `getCraftedRecipe()` | `@Nonnull CraftingRecipe` | Obtient la recette en cours d'execution |
| `getQuantity()` | `int` | Obtient la quantite de fabrication (taille du lot) |
| `isCancelled()` | `boolean` | Retourne si l'événement a ete annulé |
| `setCancelled(boolean)` | `void` | Définit l'etat d'annulation de l'événement |

## Classes internes

### CraftRecipeEvent.Pre

Déclenché **avant** que l'operation de fabrication soit exécutée. Annuler cet événement empêché la fabrication de se produire. Utilisez-le pour valider ou bloquer les tentatives de fabrication.

**Source :** Ligne 32

```java
public static final class Pre extends CraftRecipeEvent {
    public Pre(@Nonnull CraftingRecipe craftedRecipe, int quantity) {
        super(craftedRecipe, quantity);
    }
}
```

**Cas d'utilisation :**
- Valider les permissions du joueur pour des recettes spécifiques
- Bloquer la fabrication dans certaines zones ou conditions
- Implémenter des temps de recharge de fabrication
- Verifier les ressources ou conditions requises

### CraftRecipeEvent.Post

Déclenché **apres** que l'operation de fabrication a ete complétée avec succès. Cet événement est informatif - bien que techniquement annulable (il herite de la classe abstraite), l'annulér n'annulé pas la fabrication.

**Source :** Ligne 26

```java
public static final class Post extends CraftRecipeEvent {
    public Post(@Nonnull CraftingRecipe craftedRecipe, int quantity) {
        super(craftedRecipe, quantity);
    }
}
```

**Cas d'utilisation :**
- Journaliser l'activite de fabrication
- Accorder des succès ou de l'XP
- Déclenchér des effets secondaires apres des fabrications reussies
- Mettre a jour les statistiques ou l'analytique

## Exemple d'utilisation

### Ecouter les événements Pre-Fabrication

```java
import com.hypixel.hytale.server.core.event.events.ecs.CraftRecipeEvent;
import com.hypixel.hytale.event.EventPriority;

public class CraftingListener extends PluginBase {

    @Override
    public void onEnable() {
        // Ecouter les événements pre-fabrication pour valider/bloquer
        getServer().getEventBus().register(
            EventPriority.FIRST,
            CraftRecipeEvent.Pre.class,
            this::onPreCraft
        );

        // Ecouter les événements post-fabrication pour la journalisation/recompenses
        getServer().getEventBus().register(
            EventPriority.NORMAL,
            CraftRecipeEvent.Post.class,
            this::onPostCraft
        );
    }

    private void onPreCraft(CraftRecipeEvent.Pre event) {
        CraftingRecipe recipe = event.getCraftedRecipe();
        int quantity = event.getQuantity();

        getLogger().info("Le joueur tente de fabriquer " + quantity + " objets");

        // Exemple: Bloquer certaines recettes
        // if (isRestrictedRecipe(recipe)) {
        //     event.setCancelled(true);
        // }
    }

    private void onPostCraft(CraftRecipeEvent.Post event) {
        CraftingRecipe recipe = event.getCraftedRecipe();
        int quantity = event.getQuantity();

        getLogger().info("Fabrication reussie de " + quantity + " objets");

        // Accorder XP, succès, etc.
    }
}
```

### Implémenter des restrictions de fabrication

```java
// Exemple: Systeme de permission de recettes
getServer().getEventBus().register(
    EventPriority.FIRST,
    CraftRecipeEvent.Pre.class,
    event -> {
        CraftingRecipe recipe = event.getCraftedRecipe();

        // Verifier si le joueur a la permission pour cette recette
        // String recipeId = recipe.getId();
        // if (!hasRecipeUnlocked(player, recipeId)) {
        //     event.setCancelled(true);
        //     // Envoyer le message "Recette non débloquée"
        // }
    }
);
```

### Implémenter des bonus de fabrication

```java
// Exemple: Suivre la fabrication pour des recompenses bonus
getServer().getEventBus().register(
    EventPriority.LAST,
    CraftRecipeEvent.Post.class,
    event -> {
        if (!event.isCancelled()) {
            CraftingRecipe recipe = event.getCraftedRecipe();
            int quantity = event.getQuantity();

            // Accorder de l'XP de fabrication
            // int xp = calculateCraftingXP(recipe, quantity);
            // awardXP(player, xp);

            // Verifier les succès
            // checkCraftingAchievements(player, recipe);
        }
    }
);
```

## Quand cet événement se déclenché

Le `CraftRecipeEvent` se déclenché dans les scenarios suivants :

### CraftRecipeEvent.Pre
1. **Fabrication manuelle** : Lorsqu'un joueur initie une fabrication depuis l'interface de fabrication
2. **Fabrication rapide** : Lors de l'utilisation des fonctionnalites de fabrication rapide pour fabriquer en lot
3. **Fabrication automatique** : Lorsque des systemes de fabrication automatises tentent de fabriquer

### CraftRecipeEvent.Post
1. **Fabrication reussie** : Apres que les objets ont ete créés avec succès
2. **Completion de lot** : Apres que tous les objets d'une fabrication en lot ont ete créés

**Note** : Le `PlayerCraftEvent` déprécié existe pour la compatibilite legacy mais `CraftRecipeEvent` est l'événement préféré pour les nouvelles implementations.

## Comportement d'annulation

### CraftRecipeEvent.Pre

Lorsque l'événement `Pre` est annulé :
- L'operation de fabrication est **complètement annulée**
- Aucun ingredient n'est consommé
- Aucun objet de sortie n'est créé
- L'inventaire du joueur reste inchangé
- Aucun événement `Post` ne sera déclenché

```java
// Exemple: Systeme de temps de recharge de fabrication
private Map<UUID, Long> craftCooldowns = new HashMap<>();

getServer().getEventBus().register(
    EventPriority.FIRST,
    CraftRecipeEvent.Pre.class,
    event -> {
        // Verifier le temps de recharge
        // UUID playerId = getPlayerId(event);
        // long lastCraft = craftCooldowns.getOrDefault(playerId, 0L);
        // long now = System.currentTimeMillis();

        // if (now - lastCraft < 1000) { // 1 seconde de temps de recharge
        //     event.setCancelled(true);
        //     return;
        // }

        // craftCooldowns.put(playerId, now);
    }
);
```

### CraftRecipeEvent.Post

Bien que techniquement annulable (en raison de l'héritage), annulér l'événement `Post` :
- N'annulé **pas** la fabrication (les objets sont deja créés)
- Peut empêchér l'execution des hooks post-fabrication
- Ne devrait generalement pas etre annulé

## Flux des événements Pre vs Post

```
Le joueur initie la fabrication
         |
         v
+------------------+
| CraftRecipeEvent |
|       Pre        |
+------------------+
         |
    [annulé?]---Oui---> Fabrication annulée (aucun objet créé)
         |
        Non
         |
         v
   Ingredients consommés
   Objets de sortie créés
         |
         v
+------------------+
| CraftRecipeEvent |
|       Post       |
+------------------+
         |
         v
   Fabrication terminée
```

## Événements lies

- **[DropItemEvent](./drop-item-event.md)** - Déclenché lorsque des objets sont lâchés
- **[InteractivelyPickupItemEvent](./interactively-pickup-item-event.md)** - Déclenché lorsque des objets sont ramassés
- **LivingEntityInventoryChangeEvent** - Déclenché lors de changements d'inventaire
- **PlayerCraftEvent** - Événement de fabrication legacy déprécié

## Référence source

- **Classe** : `com.hypixel.hytale.server.core.event.events.ecs.CraftRecipeEvent`
- **Source** : `decompiled/com/hypixel/hytale/server/core/event/events/ecs/CraftRecipeEvent.java`
- **Ligne** : 7
- **Parent** : `CancellableEcsEvent` (`com.hypixel.hytale.component.system.CancellableEcsEvent`)
- **Classes internes** :
  - `CraftRecipeEvent.Pre` (Ligne 32) - Événement de validation pre-fabrication
  - `CraftRecipeEvent.Post` (Ligne 26) - Événement de notification post-fabrication
