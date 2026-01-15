---
id: custom-ui
title: Systeme UI Personnalise
sidebar_label: UI Personnalisee
sidebar_position: 7
description: Guide complet pour creer des interfaces joueur interactives dans les plugins Hytale
---

# Systeme UI Personnalise

:::info Teste et Verifie
Cette documentation a ete testee avec un plugin fonctionnel. Les exemples sont confirmes comme fonctionnels.
:::

## Vue d'ensemble

Le systeme UI personnalise permet aux plugins de creer des interfaces joueur interactives. Le systeme utilise une **architecture client-serveur** :

- **Les fichiers de layout (`.ui`)** sont stockes sur le **client** - les plugins ne peuvent pas les creer
- **Le serveur envoie des commandes** pour manipuler les elements de ces layouts
- **Les evenements remontent** du client vers le serveur quand les joueurs interagissent

```
┌─────────────────────┐                    ┌─────────────────────┐
│   Plugin Serveur    │                    │       Client        │
│                     │                    │                     │
│  InteractiveCustom  │───── Commandes ───>│  Fichiers .ui       │
│    UIPage           │                    │  (Pages/*.ui)       │
│  UICommandBuilder   │<───── Evenements ──│                     │
│  UIEventBuilder     │                    │                     │
└─────────────────────┘                    └─────────────────────┘
```

:::danger Critique : Les fichiers de layout sont cote client
**Les fichiers de layout (`.ui`) sont des assets CLIENT.** Si vous referencez un layout qui n'existe pas sur le client, vous obtiendrez :
```
Could not find document Pages/MyPage.ui for Custom UI Append command
```
Le client sera deconnecte. **Utilisez uniquement des layouts garantis d'exister.**
:::

## Fichiers de Layout Disponibles

Tous les fichiers de layout ne sont pas disponibles sur chaque client. Utilisez ces layouts **garantis surs** :

### Layouts Core Serveur (Toujours Disponibles)

| Layout | Utilise Par | Description |
|--------|-------------|-------------|
| `Pages/PluginListPage.ui` | Commande `/plugins` | Liste avec checkboxes et panneau de detail |
| `Pages/CommandListPage.ui` | Commande `/commands` | Liste de commandes avec recherche |
| `Pages/BasicTextButton.ui` | Diverses pages | Composant bouton simple |
| `Pages/PluginListButton.ui` | Liste de plugins | Bouton avec checkbox |

### Layouts Adventure/Builtin (Peuvent Ne Pas Etre Disponibles)

Ces layouts peuvent ne fonctionner que lorsque des packs de contenu specifiques sont charges :

| Layout | Module | Risque |
|--------|--------|--------|
| `Pages/DialogPage.ui` | Adventure Objectives | Peut ne pas exister |
| `Pages/ShopPage.ui` | Adventure Shop | Peut ne pas exister |
| `Pages/BarterPage.ui` | Adventure Barter | Peut ne pas exister |
| `Pages/MemoriesPanel.ui` | Adventure Memories | Peut ne pas exister |

**Recommandation** : Utilisez `Pages/PluginListPage.ui` comme layout de base - c'est garanti de fonctionner.

## Exigences de Threading

:::warning Critique : World Thread
Les operations UI **doivent s'executer sur le world thread**. Ne pas le faire cause :
```
Assert not in thread: Expected WorldThread but was ForkJoinPool.commonPool-worker-X
```
:::

### Solution 1 : Etendre AbstractPlayerCommand (Recommande)

La facon la plus simple d'assurer un threading correct est d'etendre `AbstractPlayerCommand` :

```java
import com.hypixel.hytale.server.core.command.system.basecommands.AbstractPlayerCommand;

public class MyUICommand extends AbstractPlayerCommand {

    public MyUICommand() {
        super("myui", "Ouvre mon UI personnalisee");
    }

    @Override
    protected void execute(
        @Nonnull CommandContext context,
        @Nonnull Store<EntityStore> store,
        @Nonnull Ref<EntityStore> ref,
        @Nonnull PlayerRef playerRef,
        @Nonnull World world
    ) {
        // Deja sur le world thread - sur d'ouvrir l'UI
        Player player = store.getComponent(ref, Player.getComponentType());
        MyCustomPage page = new MyCustomPage(playerRef);
        player.getPageManager().openCustomPage(ref, store, page);
    }
}
```

### Solution 2 : Planifier sur le World Thread

Si vous n'utilisez pas `AbstractPlayerCommand`, planifiez l'execution sur le world thread :

```java
World world = store.getExternalData().getWorld();
world.execute(() -> {
    // Sur de faire des operations UI ici
    Player player = store.getComponent(ref, Player.getComponentType());
    player.getPageManager().openCustomPage(ref, store, page);
});
```

## Creer une Page UI Personnalisee

### Etape 1 : Etendre InteractiveCustomUIPage

```java
import com.hypixel.hytale.codec.Codec;
import com.hypixel.hytale.codec.KeyedCodec;
import com.hypixel.hytale.codec.builder.BuilderCodec;
import com.hypixel.hytale.component.Ref;
import com.hypixel.hytale.component.Store;
import com.hypixel.hytale.protocol.packets.interface_.CustomPageLifetime;
import com.hypixel.hytale.protocol.packets.interface_.CustomUIEventBindingType;
import com.hypixel.hytale.protocol.packets.interface_.Page;
import com.hypixel.hytale.server.core.Message;
import com.hypixel.hytale.server.core.entity.entities.Player;
import com.hypixel.hytale.server.core.entity.entities.player.pages.InteractiveCustomUIPage;
import com.hypixel.hytale.server.core.ui.Value;
import com.hypixel.hytale.server.core.ui.builder.EventData;
import com.hypixel.hytale.server.core.ui.builder.UICommandBuilder;
import com.hypixel.hytale.server.core.ui.builder.UIEventBuilder;
import com.hypixel.hytale.server.core.universe.PlayerRef;
import com.hypixel.hytale.server.core.universe.world.storage.EntityStore;

public class MyDashboardPage extends InteractiveCustomUIPage<MyDashboardPage.MyEventData> {

    // Utiliser un layout SUR qui existe sur tous les clients
    public static final String LAYOUT = "Pages/PluginListPage.ui";

    public MyDashboardPage(@Nonnull PlayerRef playerRef) {
        super(playerRef, CustomPageLifetime.CanDismiss, MyEventData.CODEC);
    }

    @Override
    public void build(
        @Nonnull Ref<EntityStore> ref,
        @Nonnull UICommandBuilder commandBuilder,
        @Nonnull UIEventBuilder eventBuilder,
        @Nonnull Store<EntityStore> store
    ) {
        // Charger le layout
        commandBuilder.append(LAYOUT);

        // Cacher les elements dont on n'a pas besoin
        commandBuilder.set("#DescriptiveOnlyOption.Visible", false);

        // Definir le contenu du panneau d'info
        commandBuilder.set("#PluginName.Text", "Mon Tableau de Bord");
        commandBuilder.set("#PluginIdentifier.Text", "Statut: En ligne");
        commandBuilder.set("#PluginVersion.Text", "v1.0.0");
        commandBuilder.set("#PluginDescription.Text", "Bienvenue sur mon tableau de bord!");

        // Vider et remplir la liste
        commandBuilder.clear("#PluginList");

        // Ajouter des elements a la liste
        String[] items = {"Option A", "Option B", "Option C"};
        for (int i = 0; i < items.length; i++) {
            String selector = "#PluginList[" + i + "]";

            // Ajouter un bouton depuis le template
            commandBuilder.append("#PluginList", "Pages/PluginListButton.ui");

            // Definir le texte du bouton
            commandBuilder.set(selector + " #Button.Text", items[i]);

            // Cacher la checkbox (on l'utilise juste pour l'affichage)
            commandBuilder.set(selector + " #CheckBox.Visible", false);

            // Enregistrer l'evenement de clic avec des donnees
            eventBuilder.addEventBinding(
                CustomUIEventBindingType.Activating,
                selector + " #Button",
                new EventData().append("Item", items[i]).append("Index", String.valueOf(i)),
                false
            );
        }
    }

    @Override
    public void handleDataEvent(
        @Nonnull Ref<EntityStore> ref,
        @Nonnull Store<EntityStore> store,
        @Nonnull MyEventData data
    ) {
        if (data.item != null) {
            // Gerer la selection d'element
            UICommandBuilder commandBuilder = new UICommandBuilder();
            commandBuilder.set("#PluginDescription.Text", "Vous avez selectionne: " + data.item);
            this.sendUpdate(commandBuilder, false);
        }
    }

    // Classe de donnees d'evenement - doit avoir un BuilderCodec
    public static class MyEventData {
        public static final BuilderCodec<MyEventData> CODEC = BuilderCodec.builder(
            MyEventData.class, MyEventData::new
        )
        .append(new KeyedCodec<>("Item", Codec.STRING), (e, v) -> e.item = v, e -> e.item)
        .add()
        .append(new KeyedCodec<>("Index", Codec.STRING), (e, v) -> e.index = v, e -> e.index)
        .add()
        .build();

        private String item;
        private String index;

        public MyEventData() {}
    }
}
```

### Etape 2 : Creer la Commande

```java
import com.hypixel.hytale.server.core.command.system.basecommands.AbstractPlayerCommand;

public class DashboardCommand extends AbstractPlayerCommand {

    public DashboardCommand() {
        super("dashboard", "Ouvre l'UI du tableau de bord");
    }

    @Override
    protected boolean canGeneratePermission() {
        return false; // Pas de permission requise
    }

    @Override
    protected void execute(
        @Nonnull CommandContext context,
        @Nonnull Store<EntityStore> store,
        @Nonnull Ref<EntityStore> ref,
        @Nonnull PlayerRef playerRef,
        @Nonnull World world
    ) {
        Player player = store.getComponent(ref, Player.getComponentType());
        if (player == null) {
            context.sendMessage(Message.raw("Erreur: Impossible d'obtenir le joueur"));
            return;
        }

        MyDashboardPage page = new MyDashboardPage(playerRef);
        player.getPageManager().openCustomPage(ref, store, page);
        context.sendMessage(Message.raw("Tableau de bord ouvert!"));
    }
}
```

### Etape 3 : Enregistrer dans le Plugin

```java
public class MyPlugin extends JavaPlugin {

    @Override
    public void onEnable() {
        CommandRegistry commandRegistry = getCommandRegistry();
        commandRegistry.register(new DashboardCommand());
    }
}
```

## Reference UICommandBuilder

Le `UICommandBuilder` envoie des commandes pour manipuler les elements UI.

### Charger des Layouts

```java
// Charger un fichier layout (DOIT exister sur le client)
commandBuilder.append("Pages/PluginListPage.ui");

// Ajouter un layout a un conteneur
commandBuilder.append("#ListContainer", "Pages/PluginListButton.ui");
```

### Definir des Valeurs

```java
// Definir le contenu textuel
commandBuilder.set("#Title.Text", "Bonjour le monde");
commandBuilder.set("#Title.Text", Message.raw("Bonjour le monde"));
commandBuilder.set("#Title.Text", Message.translation("ma.cle.traduction"));

// Definir des proprietes booleennes
commandBuilder.set("#Panel.Visible", true);
commandBuilder.set("#Button.Disabled", false);

// Definir des valeurs numeriques
commandBuilder.set("#HealthBar.Value", 0.75f);

// Definir des styles avec Value.ref
commandBuilder.set("#Button.Style", Value.ref("Pages/BasicTextButton.ui", "SelectedLabelStyle"));
```

### Gerer les Elements

```java
// Vider tous les enfants d'un conteneur
commandBuilder.clear("#PluginList");

// Supprimer un element specifique
commandBuilder.remove("#OldItem");

// Mettre une valeur a null
commandBuilder.setNull("#OptionalField");
```

### UI Inline (Necessite un Conteneur)

```java
// Ajouter du markup UI inline a un conteneur existant
commandBuilder.appendInline("#Container", "Label { Text: Pas d'elements; Style: (Alignment: Center); }");
```

:::warning Limitations de appendInline
`appendInline()` necessite un **selecteur vers un conteneur existant**. Vous ne pouvez pas creer une page complete avec uniquement du markup inline - vous devez d'abord charger un fichier layout.
:::

## Syntaxe des Selecteurs

Les elements sont cibles avec des selecteurs de style CSS :

| Syntaxe | Exemple | Description |
|---------|---------|-------------|
| `#ID` | `#Button` | Element par ID |
| `#ID[n]` | `#List[0]` | Element de tableau par index |
| `#ID.Property` | `#Button.Text` | Propriete d'element |
| `#Parent #Child` | `#Panel #Title` | Element imbrique |
| Combine | `#List[2] #Button.Text` | Propriete enfant d'un element de tableau |

## Reference UIEventBuilder

Enregistre des bindings d'evenements pour gerer les interactions joueur.

### Types d'Evenements

| Type | Declenchement |
|------|---------------|
| `Activating` | Element clique ou Enter presse |
| `RightClicking` | Bouton droit de souris clique |
| `DoubleClicking` | Double clic |
| `ValueChanged` | Valeur modifiee (inputs, sliders, checkboxes) |
| `MouseEntered` | Souris entree dans l'element |
| `MouseExited` | Souris sortie de l'element |
| `FocusGained` | Element a obtenu le focus |
| `FocusLost` | Element a perdu le focus |

### Enregistrer des Evenements

```java
// Evenement simple (declenche handleDataEvent avec donnees vides)
eventBuilder.addEventBinding(CustomUIEventBindingType.Activating, "#CloseButton");

// Evenement avec donnees personnalisees
eventBuilder.addEventBinding(
    CustomUIEventBindingType.Activating,
    "#SaveButton",
    new EventData().append("Action", "Save").append("Tab", "Settings")
);

// Evenement non-bloquant (l'UI reste reactive)
eventBuilder.addEventBinding(
    CustomUIEventBindingType.ValueChanged,
    "#Slider",
    new EventData().append("Type", "Volume"),
    false  // locksInterface = false
);

// Capturer la valeur d'un element UI (prefixer la cle avec @)
eventBuilder.addEventBinding(
    CustomUIEventBindingType.Activating,
    "#SearchButton",
    EventData.of("@Query", "#SearchInput.Value")
);
```

## Codec EventData

Pour recevoir les donnees d'evenement, creez une classe avec un `BuilderCodec` :

```java
public static class MyEventData {
    public static final BuilderCodec<MyEventData> CODEC = BuilderCodec.builder(
        MyEventData.class, MyEventData::new
    )
    // Champ String
    .append(new KeyedCodec<>("Action", Codec.STRING),
        (data, value) -> data.action = value,
        data -> data.action)
    .add()
    // Autre champ String
    .append(new KeyedCodec<>("ItemId", Codec.STRING),
        (data, value) -> data.itemId = value,
        data -> data.itemId)
    .add()
    .build();

    private String action;
    private String itemId;

    public MyEventData() {}

    // Getters si necessaires
    public String getAction() { return action; }
    public String getItemId() { return itemId; }
}
```

## Mettre a jour l'UI

Pour mettre a jour l'UI apres le build initial, utilisez `sendUpdate()` :

```java
@Override
public void handleDataEvent(Ref<EntityStore> ref, Store<EntityStore> store, MyEventData data) {
    // Creer un nouveau command builder pour la mise a jour
    UICommandBuilder commandBuilder = new UICommandBuilder();

    // Faire des changements
    commandBuilder.set("#StatusText.Text", "Mis a jour!");
    commandBuilder.set("#Counter.Text", String.valueOf(++counter));

    // Envoyer la mise a jour (false = ne pas reconstruire les evenements)
    this.sendUpdate(commandBuilder, false);
}
```

## Fermer la Page

```java
// Depuis handleDataEvent
Player player = store.getComponent(ref, Player.getComponentType());
player.getPageManager().setPage(ref, store, Page.None);

// Ou utiliser le helper close()
this.close();
```

## CustomPageLifetime

Controle comment la page peut etre fermee :

| Lifetime | Comportement |
|----------|--------------|
| `CantClose` | L'utilisateur ne peut pas fermer la page (doit etre fermee par le code) |
| `CanDismiss` | L'utilisateur peut appuyer sur ESC pour fermer |
| `CanDismissOrCloseThroughInteraction` | ESC ou interaction avec bouton de fermeture |

## Alternative : NotificationUtil

Pour des messages simples sans pages personnalisees, utilisez les notifications :

```java
import com.hypixel.hytale.server.core.util.NotificationUtil;
import com.hypixel.hytale.protocol.packets.interface_.NotificationStyle;

NotificationUtil.sendNotification(
    playerRef.getPacketHandler(),
    Message.raw("Titre"),
    Message.raw("Sous-titre"),
    NotificationStyle.Success
);
```

### Styles de Notification

| Style | Apparence |
|-------|-----------|
| `Default` | Notification standard |
| `Success` | Vert/positif |
| `Warning` | Jaune/attention |
| `Error` | Rouge/negatif |

## Erreurs Courantes

### 1. Utiliser des Fichiers Layout Inexistants

```java
// MAUVAIS - DialogPage.ui peut ne pas exister sur tous les clients
commandBuilder.append("Pages/DialogPage.ui");

// BON - PluginListPage.ui est toujours disponible
commandBuilder.append("Pages/PluginListPage.ui");
```

### 2. Ne Pas Executer sur le World Thread

```java
// MAUVAIS - Etendre CommandBase ne garantit pas le world thread
public class MyCommand extends CommandBase { ... }

// BON - AbstractPlayerCommand gere le threading
public class MyCommand extends AbstractPlayerCommand { ... }
```

### 3. Champs Codec Manquants

```java
// MAUVAIS - Champ "Action" envoye par l'UI mais pas dans le codec
eventBuilder.addEventBinding(..., new EventData().append("Action", "Save"));
// handleDataEvent recoit null pour les champs manquants

// BON - Tous les champs declares dans le codec
.append(new KeyedCodec<>("Action", Codec.STRING), ...)
```

### 4. Utiliser appendInline Sans Layout de Base

```java
// MAUVAIS - Pas de layout de base charge d'abord
commandBuilder.appendInline("", "<panel>...</panel>");

// BON - Charger le layout d'abord, puis ajouter inline au conteneur
commandBuilder.append("Pages/PluginListPage.ui");
commandBuilder.appendInline("#SomeContainer", "Label { Text: Extra; }");
```

## Classes Source

| Classe | Package |
|--------|---------|
| `CustomUIPage` | `com.hypixel.hytale.server.core.entity.entities.player.pages` |
| `InteractiveCustomUIPage` | `com.hypixel.hytale.server.core.entity.entities.player.pages` |
| `UICommandBuilder` | `com.hypixel.hytale.server.core.ui.builder` |
| `UIEventBuilder` | `com.hypixel.hytale.server.core.ui.builder` |
| `EventData` | `com.hypixel.hytale.server.core.ui.builder` |
| `PageManager` | `com.hypixel.hytale.server.core.entity.entities.player.pages` |
| `AbstractPlayerCommand` | `com.hypixel.hytale.server.core.command.system.basecommands` |
| `NotificationUtil` | `com.hypixel.hytale.server.core.util` |
