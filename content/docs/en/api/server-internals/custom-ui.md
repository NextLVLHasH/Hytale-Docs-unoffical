---
id: custom-ui
title: Custom UI System
sidebar_label: Custom UI
sidebar_position: 7
description: Complete guide to creating interactive player interfaces in Hytale plugins
---

# Custom UI System

:::info Tested & Verified
This documentation has been tested with a working plugin. Examples are confirmed to work.
:::

## Overview

The Custom UI system allows plugins to create interactive player interfaces. The system uses a **client-server architecture**:

- **Layout files (`.ui`)** are stored on the **client** - plugins cannot create them
- **Server sends commands** to manipulate elements in those layouts
- **Events flow back** from client to server when players interact

```
┌─────────────────────┐                    ┌─────────────────────┐
│    Server Plugin    │                    │       Client        │
│                     │                    │                     │
│  InteractiveCustom  │───── Commands ────>│  .ui Layout Files   │
│    UIPage           │                    │  (Pages/*.ui)       │
│  UICommandBuilder   │<───── Events ──────│                     │
│  UIEventBuilder     │                    │                     │
└─────────────────────┘                    └─────────────────────┘
```

:::danger Critical: Layout Files are Client-Side
**Layout files (`.ui`) are CLIENT assets.** If you reference a layout that doesn't exist on the client, you'll get:
```
Could not find document Pages/MyPage.ui for Custom UI Append command
```
The client will disconnect. **Only use layouts that are guaranteed to exist.**
:::

## Available Layout Files

Not all layout files are available on every client. Use these **guaranteed safe** layouts:

### Core Server Layouts (Always Available)

| Layout | Used By | Description |
|--------|---------|-------------|
| `Pages/PluginListPage.ui` | `/plugins` command | List with checkboxes and detail panel |
| `Pages/CommandListPage.ui` | `/commands` command | Searchable command list |
| `Pages/BasicTextButton.ui` | Various pages | Simple button component |
| `Pages/PluginListButton.ui` | Plugin list | Button with checkbox |

### Adventure/Builtin Layouts (May Not Be Available)

These layouts may only work when specific content packs are loaded:

| Layout | Module | Risk |
|--------|--------|------|
| `Pages/DialogPage.ui` | Adventure Objectives | May not exist |
| `Pages/ShopPage.ui` | Adventure Shop | May not exist |
| `Pages/BarterPage.ui` | Adventure Barter | May not exist |
| `Pages/MemoriesPanel.ui` | Adventure Memories | May not exist |

**Recommendation**: Use `Pages/PluginListPage.ui` as your base layout - it's guaranteed to work.

## Threading Requirements

:::warning Critical: World Thread
UI operations **must run on the world thread**. Failure to do so causes:
```
Assert not in thread: Expected WorldThread but was ForkJoinPool.commonPool-worker-X
```
:::

### Solution 1: Extend AbstractPlayerCommand (Recommended)

The easiest way to ensure proper threading is to extend `AbstractPlayerCommand`:

```java
import com.hypixel.hytale.server.core.command.system.basecommands.AbstractPlayerCommand;

public class MyUICommand extends AbstractPlayerCommand {

    public MyUICommand() {
        super("myui", "Opens my custom UI");
    }

    @Override
    protected void execute(
        @Nonnull CommandContext context,
        @Nonnull Store<EntityStore> store,
        @Nonnull Ref<EntityStore> ref,
        @Nonnull PlayerRef playerRef,
        @Nonnull World world
    ) {
        // Already on world thread - safe to open UI
        Player player = store.getComponent(ref, Player.getComponentType());
        MyCustomPage page = new MyCustomPage(playerRef);
        player.getPageManager().openCustomPage(ref, store, page);
    }
}
```

### Solution 2: Schedule on World Thread

If not using `AbstractPlayerCommand`, schedule execution on the world thread:

```java
World world = store.getExternalData().getWorld();
world.execute(() -> {
    // Safe to perform UI operations here
    Player player = store.getComponent(ref, Player.getComponentType());
    player.getPageManager().openCustomPage(ref, store, page);
});
```

## Creating a Custom UI Page

### Step 1: Extend InteractiveCustomUIPage

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

    // Use a SAFE layout that exists on all clients
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
        // Load the layout
        commandBuilder.append(LAYOUT);

        // Hide elements we don't need
        commandBuilder.set("#DescriptiveOnlyOption.Visible", false);

        // Set info panel content
        commandBuilder.set("#PluginName.Text", "My Dashboard");
        commandBuilder.set("#PluginIdentifier.Text", "Status: Online");
        commandBuilder.set("#PluginVersion.Text", "v1.0.0");
        commandBuilder.set("#PluginDescription.Text", "Welcome to my custom dashboard!");

        // Clear and populate the list
        commandBuilder.clear("#PluginList");

        // Add list items
        String[] items = {"Option A", "Option B", "Option C"};
        for (int i = 0; i < items.length; i++) {
            String selector = "#PluginList[" + i + "]";

            // Append a button from the button template
            commandBuilder.append("#PluginList", "Pages/PluginListButton.ui");

            // Set the button text
            commandBuilder.set(selector + " #Button.Text", items[i]);

            // Disable the checkbox (we're using this for display only)
            commandBuilder.set(selector + " #CheckBox.Visible", false);

            // Register click event with data
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
            // Handle item selection
            UICommandBuilder commandBuilder = new UICommandBuilder();
            commandBuilder.set("#PluginDescription.Text", "You selected: " + data.item);
            this.sendUpdate(commandBuilder, false);
        }
    }

    // Event data class - must have a BuilderCodec
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

### Step 2: Create the Command

```java
import com.hypixel.hytale.server.core.command.system.basecommands.AbstractPlayerCommand;

public class DashboardCommand extends AbstractPlayerCommand {

    public DashboardCommand() {
        super("dashboard", "Opens the dashboard UI");
    }

    @Override
    protected boolean canGeneratePermission() {
        return false; // No permission required
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
            context.sendMessage(Message.raw("Error: Could not get player"));
            return;
        }

        MyDashboardPage page = new MyDashboardPage(playerRef);
        player.getPageManager().openCustomPage(ref, store, page);
        context.sendMessage(Message.raw("Dashboard opened!"));
    }
}
```

### Step 3: Register in Plugin

```java
public class MyPlugin extends JavaPlugin {

    @Override
    public void onEnable() {
        CommandRegistry commandRegistry = getCommandRegistry();
        commandRegistry.register(new DashboardCommand());
    }
}
```

## UICommandBuilder Reference

The `UICommandBuilder` sends commands to manipulate UI elements.

### Loading Layouts

```java
// Load a layout file (MUST exist on client)
commandBuilder.append("Pages/PluginListPage.ui");

// Append a layout to a container
commandBuilder.append("#ListContainer", "Pages/PluginListButton.ui");
```

### Setting Values

```java
// Set text content
commandBuilder.set("#Title.Text", "Hello World");
commandBuilder.set("#Title.Text", Message.raw("Hello World"));
commandBuilder.set("#Title.Text", Message.translation("my.translation.key"));

// Set boolean properties
commandBuilder.set("#Panel.Visible", true);
commandBuilder.set("#Button.Disabled", false);

// Set numeric values
commandBuilder.set("#HealthBar.Value", 0.75f);

// Set styles using Value.ref
commandBuilder.set("#Button.Style", Value.ref("Pages/BasicTextButton.ui", "SelectedLabelStyle"));
```

### Managing Elements

```java
// Clear all children from a container
commandBuilder.clear("#PluginList");

// Remove a specific element
commandBuilder.remove("#OldItem");

// Set value to null
commandBuilder.setNull("#OptionalField");
```

### Inline UI (Requires Container)

```java
// Append inline UI markup to an existing container
commandBuilder.appendInline("#Container", "Label { Text: No items; Style: (Alignment: Center); }");
```

:::warning appendInline Limitations
`appendInline()` requires a **selector to an existing container**. You cannot create a full page with inline markup alone - you must first load a layout file.
:::

## Selector Syntax

Elements are targeted using CSS-like selectors:

| Syntax | Example | Description |
|--------|---------|-------------|
| `#ID` | `#Button` | Element by ID |
| `#ID[n]` | `#List[0]` | Array element by index |
| `#ID.Property` | `#Button.Text` | Element property |
| `#Parent #Child` | `#Panel #Title` | Nested element |
| Combined | `#List[2] #Button.Text` | Array item's child property |

## UIEventBuilder Reference

Register event bindings to handle player interactions.

### Event Types

| Type | Triggered When |
|------|---------------|
| `Activating` | Element clicked or Enter pressed |
| `RightClicking` | Right mouse button clicked |
| `DoubleClicking` | Double click |
| `ValueChanged` | Value changed (inputs, sliders, checkboxes) |
| `MouseEntered` | Mouse entered element |
| `MouseExited` | Mouse left element |
| `FocusGained` | Element gained focus |
| `FocusLost` | Element lost focus |

### Registering Events

```java
// Simple event (triggers handleDataEvent with empty data)
eventBuilder.addEventBinding(CustomUIEventBindingType.Activating, "#CloseButton");

// Event with custom data
eventBuilder.addEventBinding(
    CustomUIEventBindingType.Activating,
    "#SaveButton",
    new EventData().append("Action", "Save").append("Tab", "Settings")
);

// Non-locking event (UI stays responsive)
eventBuilder.addEventBinding(
    CustomUIEventBindingType.ValueChanged,
    "#Slider",
    new EventData().append("Type", "Volume"),
    false  // locksInterface = false
);

// Capture UI element value (prefix key with @)
eventBuilder.addEventBinding(
    CustomUIEventBindingType.Activating,
    "#SearchButton",
    EventData.of("@Query", "#SearchInput.Value")
);
```

## EventData Codec

To receive event data, create a class with a `BuilderCodec`:

```java
public static class MyEventData {
    public static final BuilderCodec<MyEventData> CODEC = BuilderCodec.builder(
        MyEventData.class, MyEventData::new
    )
    // String field
    .append(new KeyedCodec<>("Action", Codec.STRING),
        (data, value) -> data.action = value,
        data -> data.action)
    .add()
    // Another string field
    .append(new KeyedCodec<>("ItemId", Codec.STRING),
        (data, value) -> data.itemId = value,
        data -> data.itemId)
    .add()
    .build();

    private String action;
    private String itemId;

    public MyEventData() {}

    // Getters if needed
    public String getAction() { return action; }
    public String getItemId() { return itemId; }
}
```

## Updating the UI

To update the UI after initial build, use `sendUpdate()`:

```java
@Override
public void handleDataEvent(Ref<EntityStore> ref, Store<EntityStore> store, MyEventData data) {
    // Create a new command builder for the update
    UICommandBuilder commandBuilder = new UICommandBuilder();

    // Make changes
    commandBuilder.set("#StatusText.Text", "Updated!");
    commandBuilder.set("#Counter.Text", String.valueOf(++counter));

    // Send the update (false = don't rebuild events)
    this.sendUpdate(commandBuilder, false);
}
```

## Closing the Page

```java
// From handleDataEvent
Player player = store.getComponent(ref, Player.getComponentType());
player.getPageManager().setPage(ref, store, Page.None);

// Or use the close() helper
this.close();
```

## CustomPageLifetime

Controls how the page can be closed:

| Lifetime | Behavior |
|----------|----------|
| `CantClose` | User cannot close the page (must be closed programmatically) |
| `CanDismiss` | User can press ESC to dismiss |
| `CanDismissOrCloseThroughInteraction` | ESC or close button interaction |

## Alternative: NotificationUtil

For simple messages without custom pages, use notifications:

```java
import com.hypixel.hytale.server.core.util.NotificationUtil;
import com.hypixel.hytale.protocol.packets.interface_.NotificationStyle;

NotificationUtil.sendNotification(
    playerRef.getPacketHandler(),
    Message.raw("Title"),
    Message.raw("Subtitle"),
    NotificationStyle.Success
);
```

### Notification Styles

| Style | Appearance |
|-------|------------|
| `Default` | Standard notification |
| `Success` | Green/positive |
| `Warning` | Yellow/caution |
| `Error` | Red/negative |

## Common Mistakes

### 1. Using Non-Existent Layout Files

```java
// BAD - DialogPage.ui may not exist on all clients
commandBuilder.append("Pages/DialogPage.ui");

// GOOD - PluginListPage.ui is always available
commandBuilder.append("Pages/PluginListPage.ui");
```

### 2. Not Running on World Thread

```java
// BAD - Extending CommandBase doesn't guarantee world thread
public class MyCommand extends CommandBase { ... }

// GOOD - AbstractPlayerCommand handles threading
public class MyCommand extends AbstractPlayerCommand { ... }
```

### 3. Missing Codec Fields

```java
// BAD - Field "Action" sent by UI but not in codec
eventBuilder.addEventBinding(..., new EventData().append("Action", "Save"));
// handleDataEvent receives null for missing fields

// GOOD - All fields declared in codec
.append(new KeyedCodec<>("Action", Codec.STRING), ...)
```

### 4. Using appendInline Without Base Layout

```java
// BAD - No base layout loaded first
commandBuilder.appendInline("", "<panel>...</panel>");

// GOOD - Load layout first, then append inline to container
commandBuilder.append("Pages/PluginListPage.ui");
commandBuilder.appendInline("#SomeContainer", "Label { Text: Extra; }");
```

## Source Classes

| Class | Package |
|-------|---------|
| `CustomUIPage` | `com.hypixel.hytale.server.core.entity.entities.player.pages` |
| `InteractiveCustomUIPage` | `com.hypixel.hytale.server.core.entity.entities.player.pages` |
| `UICommandBuilder` | `com.hypixel.hytale.server.core.ui.builder` |
| `UIEventBuilder` | `com.hypixel.hytale.server.core.ui.builder` |
| `EventData` | `com.hypixel.hytale.server.core.ui.builder` |
| `PageManager` | `com.hypixel.hytale.server.core.entity.entities.player.pages` |
| `AbstractPlayerCommand` | `com.hypixel.hytale.server.core.command.system.basecommands` |
| `NotificationUtil` | `com.hypixel.hytale.server.core.util` |
