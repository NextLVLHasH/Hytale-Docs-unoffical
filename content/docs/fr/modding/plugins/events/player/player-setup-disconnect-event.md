---
id: player-setup-disconnect-event
title: PlayerSetupDisconnectEvent
sidebar_label: PlayerSetupDisconnectEvent
---

# PlayerSetupDisconnectEvent

Déclenché lorsqu'un joueur se deconnecte pendant la phase de configuration de connexion, avant d'etre complètement connecte au serveur. Cela se produit quand une tentative de connexion echoue ou est annulee pendant le processus initial d'authentification et de configuration.

## Informations sur l'evenement

| Propriété | Valeur |
|-----------|--------|
| **Nom complet de la classe** | `com.hypixel.hytale.server.core.event.events.player.PlayerSetupDisconnectEvent` |
| **Classe parente** | `IEvent<Void>` |
| **Annulable** | Non |
| **Asynchrone** | Non |
| **Fichier source** | `decompiled/com/hypixel/hytale/server/core/event/events/player/PlayerSetupDisconnectEvent.java:9` |

## Declaration

```java
public class PlayerSetupDisconnectEvent implements IEvent<Void> {
```

## Champs

| Champ | Type | Accesseur | Description |
|-------|------|-----------|-------------|
| `username` | `String` | `getUsername()` | Le nom d'utilisateur du joueur qui se deconnecte |
| `uuid` | `UUID` | `getUuid()` | L'UUID du joueur qui se deconnecte |
| `auth` | `PlayerAuthentication` | `getAuth()` | Les informations d'authentification du joueur |
| `disconnectReason` | `PacketHandler.DisconnectReason` | `getDisconnectReason()` | La raison de la deconnexion |

## Méthodes

| Méthode | Signature | Description |
|---------|-----------|-------------|
| `getUsername` | `public String getUsername()` | Retourne le nom d'utilisateur du joueur |
| `getUuid` | `public UUID getUuid()` | Retourne l'UUID du joueur |
| `getAuth` | `public PlayerAuthentication getAuth()` | Retourne les informations d'authentification |
| `getDisconnectReason` | `public PacketHandler.DisconnectReason getDisconnectReason()` | Retourne la raison de la deconnexion du joueur |
| `toString` | `@Nonnull public String toString()` | Retourne une representation textuelle de cet evenement |

## Exemple d'utilisation

```java
// Enregistrer un handler pour les deconnexions pendant la configuration
eventBus.register(PlayerSetupDisconnectEvent.class, event -> {
    String username = event.getUsername();
    UUID uuid = event.getUuid();
    PacketHandler.DisconnectReason reason = event.getDisconnectReason();

    // Journaliser la tentative de connexion echouee
    logger.info("Player " + username + " failed to connect: " + reason);

    // Suivre les connexions echouees pour la securite
    trackFailedConnection(uuid, reason);
});

// Surveiller les attaques potentielles
eventBus.register(PlayerSetupDisconnectEvent.class, event -> {
    PacketHandler.DisconnectReason reason = event.getDisconnectReason();

    // Verifier les activites suspectes
    if (reason == PacketHandler.DisconnectReason.AUTHENTICATION_FAILED) {
        incrementFailedAuthCount(event.getUuid());

        // Limiter le taux apres trop d'echecs
        if (getFailedAuthCount(event.getUuid()) > 5) {
            temporarilyBlockUuid(event.getUuid());
        }
    }
});

// Analyses et rapports
eventBus.register(PlayerSetupDisconnectEvent.class, event -> {
    // Enregistrer les statistiques de connexion
    analytics.recordConnectionFailure(
        event.getUsername(),
        event.getUuid(),
        event.getDisconnectReason()
    );
});
```

## Cas d'utilisation courants

- Journalisation des tentatives de connexion echouees
- Surveillance de la securite et detection d'intrusion
- Analyses et statistiques de connexion
- Debogage des problemes d'authentification
- Suivi des echecs de redirection/transfert de serveur
- Limitation du taux basee sur les connexions echouees

## Événements lies

- [PlayerSetupConnectEvent](./player-setup-connect-event.md) - Déclenché pendant une configuration de connexion reussie
- [PlayerConnectEvent](./player-connect-event.md) - Déclenché quand un joueur se connecte complètement
- [PlayerDisconnectEvent](./player-disconnect-event.md) - Déclenché quand un joueur connecte se deconnecte

## Notes

Cet evenement est spécifique aux deconnexions qui se produisent pendant la phase de configuration. Il n'est PAS déclenché quand des joueurs complètement connectes se deconnectent - utilisez [PlayerDisconnectEvent](./player-disconnect-event.md) pour cela.

Les raisons courantes de deconnexion pendant la configuration incluent :
- Echecs d'authentification
- Serveur plein (expulse avant la connexion)
- Rejets de liste blanche
- Application des bannissements
- Delais d'expiration de connexion
- Transferts de serveur (redirections vers un autre serveur)

Comme cet evenement n'est pas annulable, il est principalement utilise a des fins de journalisation et de surveillance.

## Référence source

`decompiled/com/hypixel/hytale/server/core/event/events/player/PlayerSetupDisconnectEvent.java:9`
