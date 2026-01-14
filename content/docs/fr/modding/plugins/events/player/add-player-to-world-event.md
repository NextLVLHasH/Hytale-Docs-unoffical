---
id: add-player-to-world-event
title: AddPlayerToWorldEvent
sidebar_label: AddPlayerToWorldEvent
---

# AddPlayerToWorldEvent

Déclenché lorsqu'un joueur est en cours d'ajout a un monde. Cet événement permet aux plugins de controler si un message de connexion doit etre diffuse et d'effectuer des operations de configuration quand un joueur entre dans un monde.

## Informations sur l'événement

| Propriété | Valeur |
|-----------|--------|
| **Nom complet de la classe** | `com.hypixel.hytale.server.core.event.events.player.AddPlayerToWorldEvent` |
| **Classe parente** | `IEvent<String>` |
| **Annulable** | Non |
| **Asynchrone** | Non |
| **Fichier source** | `decompiled/com/hypixel/hytale/server/core/event/events/player/AddPlayerToWorldEvent.java:9` |

## Declaration

```java
public class AddPlayerToWorldEvent implements IEvent<String> {
   @Nonnull
   private final Holder<EntityStore> holder;
   @Nonnull
   private final World world;
   private boolean broadcastJoinMessage = true;
```

## Champs

| Champ | Type | Accesseur | Description |
|-------|------|-----------|-------------|
| `holder` | `Holder<EntityStore>` | `getHolder()` | Le conteneur d'entite contenant le magasin d'entite du joueur |
| `world` | `World` | `getWorld()` | Le monde auquel le joueur est ajoute |
| `broadcastJoinMessage` | `boolean` | `shouldBroadcastJoinMessage()` | Indique si un message de connexion doit etre diffuse aux autres joueurs |

## Méthodes

| Méthode | Signature | Description |
|---------|-----------|-------------|
| `getHolder` | `@Nonnull public Holder<EntityStore> getHolder()` | Retourne le conteneur d'entite du joueur |
| `getWorld` | `@Nonnull public World getWorld()` | Retourne le monde rejoint |
| `shouldBroadcastJoinMessage` | `public boolean shouldBroadcastJoinMessage()` | Retourne si un message de connexion sera diffuse |
| `setBroadcastJoinMessage` | `public void setBroadcastJoinMessage(boolean broadcastJoinMessage)` | Definit s'il faut diffuser un message de connexion |
| `toString` | `@Nonnull public String toString()` | Retourne une representation textuelle de cet evenement |

## Exemple d'utilisation

```java
// Enregistrer un handler pour quand les joueurs sont ajoutes aux mondes
eventBus.register(AddPlayerToWorldEvent.class, event -> {
    World world = event.getWorld();
    Holder<EntityStore> holder = event.getHolder();

    // Obtenir les informations du joueur depuis le conteneur
    logger.info("Player being added to world: " + world.getName());

    // Supprimer conditionnellement le message de connexion
    if (world.getName().equals("minigame_lobby")) {
        // Ne pas diffuser dans les lobbies de mini-jeux
        event.setBroadcastJoinMessage(false);
    }

    // Effectuer une configuration spécifique au monde
    setupPlayerForWorld(holder, world);
});

// Connexions silencieuses pour le staff
eventBus.register(EventPriority.EARLY, AddPlayerToWorldEvent.class, event -> {
    Holder<EntityStore> holder = event.getHolder();

    // Verifier si le joueur est staff avec mode invisible active
    if (isStaffWithVanish(holder)) {
        event.setBroadcastJoinMessage(false);
    }
});

// Messages de bienvenue spécifiques au monde
eventBus.register(AddPlayerToWorldEvent.class, event -> {
    World world = event.getWorld();
    Holder<EntityStore> holder = event.getHolder();

    // Supprimer le message par defaut et envoyer un personnalise
    event.setBroadcastJoinMessage(false);

    String worldType = getWorldType(world);
    switch (worldType) {
        case "survival":
            broadcastToWorld(world, "A new adventurer has entered the realm!");
            break;
        case "creative":
            broadcastToWorld(world, "A builder has joined the creative world!");
            break;
        case "minigame":
            // Pas d'annonce pour les mini-jeux
            break;
        default:
            // Utiliser l'annonce par defaut
            event.setBroadcastJoinMessage(true);
    }
});

// Suivre la population des mondes
eventBus.register(AddPlayerToWorldEvent.class, event -> {
    World world = event.getWorld();

    // Mettre a jour les statistiques du monde
    incrementWorldPopulation(world);

    // Verifier si le monde devient surpeuple
    if (getWorldPopulation(world) > getWorldCapacity(world) * 0.9) {
        notifyAdmins("World " + world.getName() + " is nearly full!");
    }
});
```

## Cas d'utilisation courants

- Personnalisation ou suppression des messages de connexion
- Configuration spécifique au monde pour les joueurs
- Suivi de la population des mondes
- Application de permissions ou effets spécifiques au monde
- Teleportation des joueurs aux points d'apparition
- Chargement des donnees de joueur spécifiques au monde
- Initialisation des elements UI spécifiques au monde

## Événements lies

- [PlayerConnectEvent](./player-connect-event.md) - Déclenché quand le joueur se connecte au serveur
- [DrainPlayerFromWorldEvent](./drain-player-from-world-event.md) - Déclenché quand le joueur est retire d'un monde
- [PlayerReadyEvent](./player-ready-event.md) - Déclenché quand le client du joueur est complètement pret
- [StartWorldEvent](../world/start-world-event.md) - Déclenché quand un monde demarre

## Ordre des événements

Quand un joueur rejoint le serveur et est place dans un monde :

1. **PlayerSetupConnectEvent** - Validation initiale
2. **PlayerConnectEvent** - Entite du joueur créée, monde peut etre defini
3. **AddPlayerToWorldEvent** - Joueur ajoute au monde
4. **PlayerReadyEvent** - Client complètement charge

Quand un joueur est transfere entre mondes :

1. **DrainPlayerFromWorldEvent** - Joueur retire de l'ancien monde
2. **AddPlayerToWorldEvent** - Joueur ajoute au nouveau monde

## Notes

Cet événement ne peut pas etre annule, mais vous pouvez controler la diffusion du message de connexion via `setBroadcastJoinMessage()`. Pour empecher un joueur d'entrer complètement dans un monde, vous devriez gerer cela dans un événement anterieur comme `PlayerConnectEvent` lors de la definition du monde initial.

Le `holder` fournit l'acces au magasin d'entite du joueur, qui contient tous les composants et donnees associes a l'entite du joueur.

## Référence source

`decompiled/com/hypixel/hytale/server/core/event/events/player/AddPlayerToWorldEvent.java:9`
