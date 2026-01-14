---
id: drain-player-from-world-event
title: DrainPlayerFromWorldEvent
sidebar_label: DrainPlayerFromWorldEvent
---

# DrainPlayerFromWorldEvent

Déclenché lorsqu'un joueur est en cours de retrait d'un monde. Cet événement permet aux plugins de modifier le monde de destination du joueur et sa transformation (position/rotation) quand il quitte le monde actuel.

## Informations sur l'événement

| Propriété | Valeur |
|-----------|--------|
| **Nom complet de la classe** | `com.hypixel.hytale.server.core.event.events.player.DrainPlayerFromWorldEvent` |
| **Classe parente** | `IEvent<String>` |
| **Annulable** | Non |
| **Asynchrone** | Non |
| **Fichier source** | `decompiled/com/hypixel/hytale/server/core/event/events/player/DrainPlayerFromWorldEvent.java:10` |

## Declaration

```java
public class DrainPlayerFromWorldEvent implements IEvent<String> {
```

## Champs

| Champ | Type | Accesseur | Description |
|-------|------|-----------|-------------|
| `holder` | `Holder<EntityStore>` | `getHolder()` | Le conteneur d'entite contenant le magasin d'entite du joueur |
| `world` | `World` | `getWorld()` | Le monde duquel le joueur est retire |
| `transform` | `Transform` | `getTransform()` | La transformation du joueur (position/rotation) pour la destination |

## Méthodes

| Méthode | Signature | Description |
|---------|-----------|-------------|
| `getHolder` | `public Holder<EntityStore> getHolder()` | Retourne le conteneur d'entite du joueur |
| `getWorld` | `public World getWorld()` | Retourne le monde actuel (en cours de quitter) |
| `getTransform` | `public Transform getTransform()` | Retourne la transformation de destination |
| `setWorld` | `public void setWorld(World world)` | Definit le monde de destination |
| `setTransform` | `public void setTransform(Transform transform)` | Definit la transformation de destination |
| `toString` | `@Nonnull public String toString()` | Retourne une representation textuelle de cet evenement |

## Exemple d'utilisation

```java
// Enregistrer un handler pour quand les joueurs quittent des mondes
eventBus.register(DrainPlayerFromWorldEvent.class, event -> {
    World currentWorld = event.getWorld();
    Holder<EntityStore> holder = event.getHolder();

    // Journaliser la sortie du monde
    logger.info("Player leaving world: " + currentWorld.getName());

    // Sauvegarder les donnees specifiques au monde avant de partir
    saveWorldProgress(holder, currentWorld);
});

// Rediriger les joueurs vers des points d'apparition specifiques
eventBus.register(DrainPlayerFromWorldEvent.class, event -> {
    World currentWorld = event.getWorld();

    // Verifier s'il quitte un donjon
    if (isDungeonWorld(currentWorld)) {
        // Renvoyer le joueur au hub
        World hubWorld = getHubWorld();
        Transform hubSpawn = getHubSpawnPoint();

        event.setWorld(hubWorld);
        event.setTransform(hubSpawn);
    }
});

// Gerer les sorties de mini-jeux
eventBus.register(DrainPlayerFromWorldEvent.class, event -> {
    World currentWorld = event.getWorld();
    Holder<EntityStore> holder = event.getHolder();

    if (isMinigameWorld(currentWorld)) {
        // Enregistrer les statistiques du mini-jeu
        recordMinigameStats(holder, currentWorld);

        // Retourner le joueur au lobby
        World lobbyWorld = getMinigameLobby();
        Transform lobbySpawn = getLobbySpawnForPlayer(holder);

        event.setWorld(lobbyWorld);
        event.setTransform(lobbySpawn);
    }
});

// Logique personnalisee de transfert de monde
eventBus.register(DrainPlayerFromWorldEvent.class, event -> {
    Holder<EntityStore> holder = event.getHolder();
    Transform currentTransform = event.getTransform();

    // Verifier si le joueur a une position sauvegardee dans le monde de destination
    World destinationWorld = getPlayerSavedWorld(holder);
    if (destinationWorld != null) {
        Transform savedPosition = getPlayerSavedPosition(holder, destinationWorld);
        if (savedPosition != null) {
            event.setWorld(destinationWorld);
            event.setTransform(savedPosition);
        }
    }
});

// Nettoyage et gestion des ressources
eventBus.register(EventPriority.LATE, DrainPlayerFromWorldEvent.class, event -> {
    World world = event.getWorld();
    Holder<EntityStore> holder = event.getHolder();

    // Retirer le joueur des systemes specifiques au monde
    removeFromWorldParty(holder, world);
    removeFromWorldTeam(holder, world);
    cleanupWorldResources(holder, world);

    // Mettre a jour le suivi de population du monde
    decrementWorldPopulation(world);
});
```

## Cas d'utilisation courants

- Sauvegarde de la progression specifique au monde avant de partir
- Redirection des joueurs vers des destinations specifiques
- Gestion des sorties de mini-jeux ou donjons
- Nettoyage des donnees et ressources specifiques au monde
- Suivi des changements de population des mondes
- Logique personnalisee de teleportation et points d'apparition
- Gestion des groupes ou equipes basees sur les mondes

## Événements lies

- [AddPlayerToWorldEvent](./add-player-to-world-event.md) - Déclenché quand le joueur est ajoute a un monde
- [PlayerDisconnectEvent](./player-disconnect-event.md) - Déclenché quand le joueur se deconnecte
- [RemoveWorldEvent](../world/remove-world-event.md) - Déclenché quand un monde est supprime

## Ordre des événements

Quand un joueur est transfere entre mondes :

1. **DrainPlayerFromWorldEvent** - Joueur retire de l'ancien monde (cet événement)
2. **AddPlayerToWorldEvent** - Joueur ajoute au nouveau monde

Quand un joueur se deconnecte :

1. **DrainPlayerFromWorldEvent** - Joueur retire de son monde actuel
2. **PlayerDisconnectEvent** - Joueur completement deconnecte

## Notes

Cet événement ne peut pas etre annule, mais vous pouvez controler ou le joueur va en utilisant `setWorld()` et `setTransform()`. La destination peut etre :
- Un autre monde sur le serveur
- Une position specifique dans le nouveau monde
- Un point d'apparition base sur une logique personnalisee

La `transform` inclut les donnees de position et de rotation, vous permettant de controler exactement ou et comment le joueur apparait a sa destination.

Si le joueur se deconnecte plutot que de transferer de monde, le monde et la transformation peuvent etre definis pour gerer ou le joueur apparaitra s'il se reconnecte.

## Référence source

`decompiled/com/hypixel/hytale/server/core/event/events/player/DrainPlayerFromWorldEvent.java:10`
