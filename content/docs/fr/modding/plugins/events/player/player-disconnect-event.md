---
id: player-disconnect-event
title: PlayerDisconnectEvent
sidebar_label: PlayerDisconnectEvent
---

# PlayerDisconnectEvent

Déclenché lorsqu'un joueur se deconnecte du serveur. Cet événement fournit des informations sur la raison de la deconnexion du joueur et permet aux plugins d'effectuer des operations de nettoyage.

## Informations sur l'événement

| Propriété | Valeur |
|-----------|--------|
| **Nom complet de la classe** | `com.hypixel.hytale.server.core.event.events.player.PlayerDisconnectEvent` |
| **Classe parente** | `PlayerRefEvent<Void>` |
| **Annulable** | Non |
| **Asynchrone** | Non |
| **Fichier source** | `decompiled/com/hypixel/hytale/server/core/event/events/player/PlayerDisconnectEvent.java:7` |

## Declaration

```java
public class PlayerDisconnectEvent extends PlayerRefEvent<Void> {
   public PlayerDisconnectEvent(@Nonnull PlayerRef playerRef) {
      super(playerRef);
   }
```

## Champs

| Champ | Type | Accesseur | Description |
|-------|------|-----------|-------------|
| `playerRef` | `PlayerRef` | `getPlayerRef()` | Référence vers le joueur qui se deconnecte (hérité de PlayerRefEvent) |

## Méthodes

| Méthode | Signature | Description |
|---------|-----------|-------------|
| `getPlayerRef` | `@Nonnull public PlayerRef getPlayerRef()` | Retourne la reference du joueur qui se deconnecte (hérité) |
| `getDisconnectReason` | `@Nonnull public PacketHandler.DisconnectReason getDisconnectReason()` | Retourne la raison pour laquelle le joueur s'est deconnecte |
| `toString` | `@Nonnull public String toString()` | Retourne une representation textuelle de cet evenement |

## Exemple d'utilisation

```java
// Enregistrer un handler pour quand les joueurs se deconnectent
eventBus.register(PlayerDisconnectEvent.class, event -> {
    PlayerRef player = event.getPlayerRef();
    PacketHandler.DisconnectReason reason = event.getDisconnectReason();

    // Journaliser la deconnexion
    logger.info("Player " + player.getUsername() + " disconnected: " + reason);

    // Sauvegarder les donnees du joueur
    savePlayerData(player);

    // Notifier les autres joueurs
    broadcastMessage(player.getUsername() + " has left the server");
});

// Enregistrer avec une priorite tardive pour le nettoyage apres les autres handlers
eventBus.register(EventPriority.LATE, PlayerDisconnectEvent.class, event -> {
    // Effectuer le nettoyage final
    cleanupPlayerResources(event.getPlayerRef());
});
```

## Cas d'utilisation courants

- Sauvegarder les donnees du joueur avant qu'il ne se deconnecte complètement
- Diffuser des messages de depart aux autres joueurs
- Nettoyer les ressources et donnees specifiques au joueur
- Journaliser les événements de deconnexion pour les analyses
- Mettre a jour les systemes de presence ou de statut du joueur
- Retirer les joueurs des equipes, groupes ou autres formations

## Événements lies

- [PlayerConnectEvent](./player-connect-event.md) - Déclenché quand un joueur se connecte
- [PlayerSetupDisconnectEvent](./player-setup-disconnect-event.md) - Déclenché pendant la phase de deconnexion anticipee
- [DrainPlayerFromWorldEvent](./drain-player-from-world-event.md) - Déclenché lors du retrait d'un joueur d'un monde

## Référence source

`decompiled/com/hypixel/hytale/server/core/event/events/player/PlayerDisconnectEvent.java:7`
