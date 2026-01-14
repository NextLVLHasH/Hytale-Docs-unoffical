---
id: player-ready-event
title: PlayerReadyEvent
sidebar_label: PlayerReadyEvent
---

# PlayerReadyEvent

Déclenché lorsque le client d'un joueur a complètement charge et est pret a jouer. Cet evenement se produit apres que le joueur s'est connecte et a recu toutes les donnees initiales necessaires, indiquant que le client est prepare a recevoir les mises a jour de gameplay.

## Informations sur l'evenement

| Propriété | Valeur |
|-----------|--------|
| **Nom complet de la classe** | `com.hypixel.hytale.server.core.event.events.player.PlayerReadyEvent` |
| **Classe parente** | `PlayerEvent<String>` |
| **Annulable** | Non |
| **Asynchrone** | Non |
| **Fichier source** | `decompiled/com/hypixel/hytale/server/core/event/events/player/PlayerReadyEvent.java:8` |

## Declaration

```java
public class PlayerReadyEvent extends PlayerEvent<String> {
```

## Champs

| Champ | Type | Accesseur | Description |
|-------|------|-----------|-------------|
| `playerRef` | `Ref<EntityStore>` | `getPlayerRef()` | Référence vers le magasin d'entite du joueur (hérité de PlayerEvent) |
| `player` | `Player` | `getPlayer()` | L'objet joueur (hérité de PlayerEvent) |
| `readyId` | `int` | `getReadyId()` | Un identifiant pour cet etat de preparation |

## Méthodes

| Méthode | Signature | Description |
|---------|-----------|-------------|
| `getPlayerRef` | `@Nonnull public Ref<EntityStore> getPlayerRef()` | Retourne la reference du magasin d'entite du joueur (hérité) |
| `getPlayer` | `@Nonnull public Player getPlayer()` | Retourne l'objet joueur (hérité) |
| `getReadyId` | `public int getReadyId()` | Retourne l'identifiant de preparation |
| `toString` | `@Nonnull public String toString()` | Retourne une representation textuelle de cet evenement |

## Exemple d'utilisation

```java
// Enregistrer un handler pour quand les joueurs sont complètement prets
eventBus.register(PlayerReadyEvent.class, event -> {
    Player player = event.getPlayer();
    int readyId = event.getReadyId();

    // Le joueur est maintenant pret a recevoir les donnees de gameplay
    logger.info("Player " + player.getName() + " is ready (readyId: " + readyId + ")");

    // Envoyer un message de bienvenue
    player.sendMessage("Welcome to the server!");

    // Initialiser les systemes spécifiques au joueur qui necessitent un client pret
    initializePlayerUI(player);
    sendInitialInventory(player);
    showTutorialIfFirstTime(player);
});

// Demarrer des minuteries spécifiques au joueur apres qu'il soit pret
eventBus.register(PlayerReadyEvent.class, event -> {
    Player player = event.getPlayer();

    // Demarrer le minuteur d'inactivite
    startAfkTimer(player);

    // Commencer les mises a jour periodiques des statistiques
    scheduleStatUpdates(player);
});

// Déclenchér une logique cote serveur qui depend de la preparation du client
eventBus.register(PlayerReadyEvent.class, event -> {
    Player player = event.getPlayer();

    // Maintenant sur de synchroniser un etat complexe vers le client
    syncPlayerQuests(player);
    syncPlayerAchievements(player);
    syncPlayerFriendsList(player);
});

// Gerer differents etats de preparation
eventBus.register(PlayerReadyEvent.class, event -> {
    int readyId = event.getReadyId();
    Player player = event.getPlayer();

    switch (readyId) {
        case 1:
            // Etat de preparation initial
            handleInitialReady(player);
            break;
        case 2:
            // Preparation subsequente (ex: apres changement de monde)
            handleWorldChangeReady(player);
            break;
        default:
            logger.debug("Unknown readyId: " + readyId);
    }
});
```

## Cas d'utilisation courants

- Envoi de messages de bienvenue apres que le client soit pret
- Initialisation des elements UI du joueur
- Demarrage de minuteries ou taches dependantes du client
- Synchronisation d'etats complexes qui necessitent un client charge
- Déclenchément de tutoriels ou experiences de premiere fois
- Demarrage des mises a jour en temps reel que le client peut traiter
- Chargement de ressources ou configurations spécifiques au joueur

## Événements lies

- [PlayerConnectEvent](./player-connect-event.md) - Déclenché plus tot quand le joueur se connecte
- [PlayerDisconnectEvent](./player-disconnect-event.md) - Déclenché quand le joueur se deconnecte
- [AddPlayerToWorldEvent](./add-player-to-world-event.md) - Déclenché quand le joueur est ajoute a un monde

## Ordre des evenements

L'ordre typique des evenements de connexion de joueur est :

1. **PlayerSetupConnectEvent** - Phase de validation initiale
2. **PlayerConnectEvent** - Entite du joueur créée
3. **AddPlayerToWorldEvent** - Joueur ajoute a un monde
4. **PlayerReadyEvent** - Client complètement charge et pret

## Notes

Le champ `readyId` peut etre utilise pour differencier differents types d'etats de preparation. Par exemple :
- Preparation a la connexion initiale
- Preparation apres un transfert de monde
- Preparation apres une reapparition

Cet evenement est ideal pour toutes les operations qui necessitent que le client soit complètement initialise et capable de traiter correctement les donnees du serveur.

## Référence source

`decompiled/com/hypixel/hytale/server/core/event/events/player/PlayerReadyEvent.java:8`
