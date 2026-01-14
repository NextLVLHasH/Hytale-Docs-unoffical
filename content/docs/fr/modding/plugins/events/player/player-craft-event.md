---
id: player-craft-event
title: PlayerCraftEvent
sidebar_label: PlayerCraftEvent
---

# PlayerCraftEvent

:::warning Obsolete
Cet événement est obsolete et marque pour suppression. Envisagez d'utiliser [CraftRecipeEvent](../ecs/craft-recipe-event.md) dans le systeme d'événements ECS a la place.
:::

Déclenché lorsqu'un joueur fabrique un objet. Cet événement fournit des informations sur la recette en cours de fabrication et la quantite d'objets produits.

## Informations sur l'événement

| Propriété | Valeur |
|-----------|--------|
| **Nom complet de la classe** | `com.hypixel.hytale.server.core.event.events.player.PlayerCraftEvent` |
| **Classe parente** | `PlayerEvent<String>` |
| **Annulable** | Non |
| **Asynchrone** | Non |
| **Obsolete** | Oui (marque pour suppression) |
| **Fichier source** | `decompiled/com/hypixel/hytale/server/core/event/events/player/PlayerCraftEvent.java:12` |

## Declaration

```java
@Deprecated(
   forRemoval = true
)
public class PlayerCraftEvent extends PlayerEvent<String> {
```

## Champs

| Champ | Type | Accesseur | Description |
|-------|------|-----------|-------------|
| `playerRef` | `Ref<EntityStore>` | `getPlayerRef()` | Référence vers le magasin d'entite du joueur (hérité de PlayerEvent) |
| `player` | `Player` | `getPlayer()` | L'objet joueur (hérité de PlayerEvent) |
| `craftedRecipe` | `CraftingRecipe` | `getCraftedRecipe()` | La recette qui a ete fabriquee |
| `quantity` | `int` | `getQuantity()` | Le nombre d'objets fabriques |

## Méthodes

| Méthode | Signature | Description |
|---------|-----------|-------------|
| `getPlayerRef` | `@Nonnull public Ref<EntityStore> getPlayerRef()` | Retourne la reference du magasin d'entite du joueur (hérité) |
| `getPlayer` | `@Nonnull public Player getPlayer()` | Retourne l'objet joueur (hérité) |
| `getCraftedRecipe` | `public CraftingRecipe getCraftedRecipe()` | Retourne la recette qui a ete fabriquee |
| `getQuantity` | `public int getQuantity()` | Retourne le nombre d'objets produits |
| `toString` | `@Nonnull public String toString()` | Retourne une representation textuelle de cet evenement |

## Exemple d'utilisation

```java
// Enregistrer un handler pour les événements de fabrication (approche obsolete)
eventBus.register(PlayerCraftEvent.class, event -> {
    Player player = event.getPlayer();
    CraftingRecipe recipe = event.getCraftedRecipe();
    int quantity = event.getQuantity();

    // Journaliser l'action de fabrication
    logger.info(player.getName() + " crafted " + quantity + "x " + recipe.getOutputItem());

    // Suivre les statistiques de fabrication
    incrementCraftingStats(player, recipe, quantity);

    // Accorder de l'experience de fabrication
    awardCraftingXP(player, recipe);

    // Verifier les succes de fabrication
    checkCraftingAchievements(player, recipe);
});

// Systeme de tutoriel de fabrication
eventBus.register(PlayerCraftEvent.class, event -> {
    Player player = event.getPlayer();
    CraftingRecipe recipe = event.getCraftedRecipe();

    // Suivre les premieres fabrications pour les tutoriels
    if (isFirstTimeCrafting(player, recipe)) {
        showCraftingTutorial(player, recipe);
        markRecipeAsLearned(player, recipe);
    }
});

// Suivi des quetes
eventBus.register(PlayerCraftEvent.class, event -> {
    Player player = event.getPlayer();
    CraftingRecipe recipe = event.getCraftedRecipe();
    int quantity = event.getQuantity();

    // Mettre a jour la progression des quetes
    updateQuestProgress(player, "craft", recipe.getId(), quantity);
});
```

## Cas d'utilisation courants

- Suivi des statistiques de fabrication
- Attribution de points d'experience de fabrication
- Verification des succes de fabrication
- Suivi de progression des quetes
- Journalisation de l'activite de fabrication
- Systemes de tutoriel pour les premieres fabrications

## Guide de migration

Cet événement est obsolete et sera supprime dans une version future. Migrez vers l'utilisation de `CraftRecipeEvent` du systeme d'événements ECS :

```java
// Ancienne approche (obsolete)
eventBus.register(PlayerCraftEvent.class, event -> {
    Player player = event.getPlayer();
    CraftingRecipe recipe = event.getCraftedRecipe();
    // Gerer la fabrication
});

// Nouvelle approche utilisant les événements ECS
// CraftRecipeEvent.Pre - annulable, se declenche avant la fabrication
// CraftRecipeEvent.Post - se declenche apres la fin de la fabrication
```

## Événements lies

- [CraftRecipeEvent](../ecs/craft-recipe-event.md) - L'événement de fabrication base sur ECS de remplacement
- [LivingEntityInventoryChangeEvent](../entity/living-entity-inventory-change-event.md) - Pour suivre les changements d'inventaire

## Notes

Comme cet événement n'est pas annulable, vous ne pouvez pas empêcher la fabrication via cet événement. Si vous devez empêcher ou modifier le comportement de fabrication, utilisez `CraftRecipeEvent.Pre` du systeme ECS a la place, qui implemente `ICancellableEcsEvent`.

L'annotation de deprecation inclut `forRemoval = true`, indiquant que cet événement sera supprime dans une version future. Planifiez votre migration en consequence.

## Référence source

`decompiled/com/hypixel/hytale/server/core/event/events/player/PlayerCraftEvent.java:12`
