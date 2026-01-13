---
id: types
title: Types de Donnees
sidebar_label: Types
sidebar_position: 5
description: Documentation des types de donnees principaux du serveur Hytale (BlockType, Items, etc.)
---

# Types de Données Hytale

:::caution Documentation v1
Cette documentation est une premiere version basee sur l'analyse du code decompile. Elle sera mise a jour regulierement.
:::

## Que sont les types de donnees ?

Les **types de donnees** definissent la structure de chaque objet dans le monde d'Hytale. Tout comme un plan definit a quoi ressemble une maison, les types de donnees definissent a quoi "ressemble" un bloc, un item ou une entite pour le serveur.

### Pourquoi c'est important

Quand vous creez une epee personnalisee dans Hytale, vous n'ecrivez pas de code - vous remplissez une structure de donnees :

```json
{
  "id": "mon_epee",
  "maxStack": 1,
  "durability": 250,
  "weapon": {
    "damage": 15,
    "attackSpeed": 1.2
  }
}
```

Comprendre les types de donnees vous aide a :
- Savoir quelles proprietes sont disponibles
- Eviter les configurations invalides
- Comprendre comment le jeu interprete votre contenu

### Les types de donnees principaux

Le monde d'Hytale est construit a partir de quelques types fondamentaux :

| Type | Ce qu'il represente | Exemple |
|------|---------------------|---------|
| **BlockType** | Un type de bloc | Pierre, Herbe, Blocs personnalises |
| **ItemBase** | Un type d'item | Epee, Potion, Nourriture |
| **EntityEffect** | Un buff ou debuff | Poison, Boost de vitesse |
| **CraftingRecipe** | Comment fabriquer des choses | Combiner bois → planches |
| **Weather** | Conditions meteorologiques | Pluie, Neige, Clair |

### Comment les types se connectent

Ces types n'existent pas isolement - ils se referencent mutuellement :

```
BlockType (Minerai)
    └── drops → ItemBase (Diamant)
                    └── usedIn → CraftingRecipe (Epee en diamant)
                                      └── output → ItemBase (Epee en diamant)
                                                       └── applies → EntityEffect (Saignement)
```

### Analogie du monde reel : instructions LEGO

Pensez aux types de donnees comme des livrets d'instructions LEGO :

- **BlockType** = Instructions pour une brique specifique
- **Champs** = Proprietes comme couleur, taille, points de connexion
- **Enums** = Options predefinies (Rouge, Bleu, Vert)
- **References** = "Utilisez la piece #4207" - liens vers d'autres pieces

Tout comme les briques LEGO s'assemblent selon des regles, les types de donnees Hytale se connectent selon leurs schemas.

### Comprendre les tableaux ci-dessous

Chaque type de donnees est documente avec des tableaux montrant :

| Colonne | Ce que ca signifie |
|---------|-------------------|
| **Champ** | Le nom de la propriete |
| **Type** | Quel genre de donnees (string, number, enum, etc.) |
| **Description** | Ce que cette propriete fait |

**Types que vous verrez :**
- `String` - Texte comme "diamond_sword"
- `int` / `float` / `double` - Nombres (entiers ou decimaux)
- `boolean` - Vrai/faux
- `NomEnum` - Une valeur parmi un ensemble predefini
- `Type[]` - Une liste de valeurs
- `Map<Cle, Valeur>` - Un dictionnaire/table de recherche
- `Type?` - Optionnel (peut etre null/absent)

---

## Reference des types de donnees

Cette documentation décrit les types de données principaux utilisés dans le serveur Hytale, extraits du code décompilé.

---

## Table des Matières

1. [BlockType - Types de Blocs](#blocktype---types-de-blocs)
2. [Système d'Items](#système-ditems)
   - [ItemBase](#itembase)
   - [ItemWeapon](#itemweapon)
   - [ItemArmor](#itemarmor)
   - [ItemTool](#itemtool)
   - [ItemQuality](#itemquality)
3. [EntityEffect - Effets sur les Entités](#entityeffect---effets-sur-les-entités)
4. [CraftingRecipe - Recettes](#craftingrecipe---recettes)
5. [Environnement](#environnement)
   - [Weather](#weather)
   - [WorldEnvironment](#worldenvironment)
6. [Énumérations Importantes](#énumérations-importantes)
7. [Types Auxiliaires](#types-auxiliaires)

---

## BlockType - Types de Blocs

Le type `BlockType` définit les propriétés d'un bloc dans le monde Hytale.

### Champs Principaux

| Champ | Type | Description |
|-------|------|-------------|
| `item` | `String` | Identifiant de l'item associé au bloc |
| `name` | `String` | Nom du bloc |
| `unknown` | `boolean` | Indique si le bloc est inconnu ou non défini |
| `drawType` | `DrawType` | Mode de rendu du bloc (Empty, GizmoCube, Cube, Model, CubeWithModel) |
| `material` | `BlockMaterial` | Type de matériau (Empty, Solid) |
| `opacity` | `Opacity` | Opacité (Solid, Semitransparent, Cutout, Transparent) |
| `shaderEffect` | `ShaderType[]` | Effets de shader appliqués |
| `hitbox` | `int` | Index de la hitbox de collision |
| `interactionHitbox` | `int` | Index de la hitbox d'interaction |
| `model` | `String` | Chemin vers le modèle 3D |
| `modelTexture` | `ModelTexture[]` | Textures du modèle |
| `modelScale` | `float` | Échelle du modèle |
| `modelAnimation` | `String` | Animation du modèle |
| `looping` | `boolean` | Animation en boucle |

### Propriétés de Support

| Champ | Type | Description |
|-------|------|-------------|
| `maxSupportDistance` | `int` | Distance maximale de support |
| `blockSupportsRequiredFor` | `BlockSupportsRequiredForType` | Type de support requis |
| `support` | `Map<BlockNeighbor, RequiredBlockFaceSupport[]>` | Faces de support requises |
| `supporting` | `Map<BlockNeighbor, BlockFaceSupport[]>` | Faces de support fournies |
| `ignoreSupportWhenPlaced` | `boolean` | Ignorer le support lors du placement |

### Propriétés Visuelles

| Champ | Type | Description |
|-------|------|-------------|
| `requiresAlphaBlending` | `boolean` | Nécessite le mélange alpha |
| `cubeTextures` | `BlockTextures[]` | Textures pour le mode cube |
| `cubeSideMaskTexture` | `String` | Texture de masque latéral |
| `cubeShadingMode` | `ShadingMode` | Mode d'ombrage |
| `randomRotation` | `RandomRotation` | Rotation aléatoire |
| `variantRotation` | `VariantRotation` | Rotation de variante |
| `rotationYawPlacementOffset` | `Rotation` | Décalage de rotation lors du placement |
| `particleColor` | `Color` | Couleur des particules |
| `light` | `ColorLight` | Émission de lumière |
| `tint` | `Tint` | Teinte du bloc |
| `biomeTint` | `Tint` | Teinte dépendante du biome |

### Audio et Effets

| Champ | Type | Description |
|-------|------|-------------|
| `blockSoundSetIndex` | `int` | Index de l'ensemble de sons |
| `ambientSoundEventIndex` | `int` | Index du son ambiant |
| `particles` | `ModelParticle[]` | Particules émises |
| `blockParticleSetId` | `String` | Identifiant de l'ensemble de particules |
| `blockBreakingDecalId` | `String` | Identifiant du décal de cassure |

### Interactions et États

| Champ | Type | Description |
|-------|------|-------------|
| `interactions` | `Map<InteractionType, Integer>` | Interactions disponibles |
| `states` | `Map<String, Integer>` | États possibles |
| `flags` | `BlockFlags` | Drapeaux du bloc |
| `interactionHint` | `String` | Indication d'interaction |
| `gathering` | `BlockGathering` | Configuration de récolte |
| `placementSettings` | `BlockPlacementSettings` | Paramètres de placement |
| `bench` | `Bench` | Configuration d'établi (si applicable) |
| `rail` | `RailConfig` | Configuration de rail (si applicable) |
| `connectedBlockRuleSet` | `ConnectedBlockRuleSet` | Règles de connexion |
| `tagIndexes` | `int[]` | Tags associés |

---

## Système d'Items

### ItemBase

Type de base pour tous les items du jeu.

#### Identité et Apparence

| Champ | Type | Description |
|-------|------|-------------|
| `id` | `String` | Identifiant unique de l'item |
| `model` | `String` | Chemin vers le modèle 3D |
| `scale` | `float` | Échelle de l'item |
| `texture` | `String` | Texture principale |
| `animation` | `String` | Animation de l'item |
| `playerAnimationsId` | `String` | Identifiant des animations du joueur |
| `usePlayerAnimations` | `boolean` | Utiliser les animations du joueur |
| `icon` | `String` | Icône dans l'inventaire |
| `iconProperties` | `AssetIconProperties` | Propriétés de l'icône |

#### Propriétés de Base

| Champ | Type | Description |
|-------|------|-------------|
| `maxStack` | `int` | Taille maximale de la pile |
| `reticleIndex` | `int` | Index du réticule |
| `itemLevel` | `int` | Niveau de l'item |
| `qualityIndex` | `int` | Index de qualité |
| `resourceTypes` | `ItemResourceType[]` | Types de ressource |
| `consumable` | `boolean` | Item consommable |
| `variant` | `boolean` | Est une variante |
| `blockId` | `int` | Identifiant du bloc associé |
| `durability` | `double` | Durabilité de l'item |

#### Sous-Types Spécialisés

| Champ | Type | Description |
|-------|------|-------------|
| `tool` | `ItemTool` | Configuration d'outil |
| `weapon` | `ItemWeapon` | Configuration d'arme |
| `armor` | `ItemArmor` | Configuration d'armure |
| `gliderConfig` | `ItemGlider` | Configuration de planeur |
| `utility` | `ItemUtility` | Configuration utilitaire |
| `blockSelectorTool` | `BlockSelectorToolData` | Outil de sélection |
| `builderToolData` | `ItemBuilderToolData` | Outil de construction |

#### Interactions et Sons

| Champ | Type | Description |
|-------|------|-------------|
| `soundEventIndex` | `int` | Index de l'événement sonore |
| `itemSoundSetIndex` | `int` | Index de l'ensemble de sons |
| `interactions` | `Map<InteractionType, Integer>` | Interactions disponibles |
| `interactionVars` | `Map<String, Integer>` | Variables d'interaction |
| `interactionConfig` | `InteractionConfiguration` | Configuration d'interaction |

#### Effets Visuels

| Champ | Type | Description |
|-------|------|-------------|
| `particles` | `ModelParticle[]` | Particules en troisième personne |
| `firstPersonParticles` | `ModelParticle[]` | Particules en première personne |
| `trails` | `ModelTrail[]` | Traînées visuelles |
| `light` | `ColorLight` | Émission de lumière |
| `itemEntity` | `ItemEntityConfig` | Configuration de l'entité item |
| `droppedItemAnimation` | `String` | Animation au sol |

#### Catégorisation

| Champ | Type | Description |
|-------|------|-------------|
| `set` | `String` | Ensemble d'items |
| `categories` | `String[]` | Catégories |
| `tagIndexes` | `int[]` | Tags associés |

---

### ItemWeapon

Configuration spécifique aux armes.

| Champ | Type | Description |
|-------|------|-------------|
| `entityStatsToClear` | `int[]` | Statistiques d'entité à effacer |
| `statModifiers` | `Map<Integer, Modifier[]>` | Modificateurs de statistiques |
| `renderDualWielded` | `boolean` | Afficher en double maniement |

---

### ItemArmor

Configuration spécifique aux armures.

| Champ | Type | Description |
|-------|------|-------------|
| `armorSlot` | `ItemArmorSlot` | Emplacement (Head, Chest, Hands, Legs) |
| `cosmeticsToHide` | `Cosmetic[]` | Cosmétiques à masquer |
| `statModifiers` | `Map<Integer, Modifier[]>` | Modificateurs de statistiques |
| `baseDamageResistance` | `double` | Résistance aux dégâts de base |
| `damageResistance` | `Map<String, Modifier[]>` | Résistances par type de dégât |
| `damageEnhancement` | `Map<String, Modifier[]>` | Amélioration des dégâts |
| `damageClassEnhancement` | `Map<String, Modifier[]>` | Amélioration par classe de dégât |

---

### ItemTool

Configuration spécifique aux outils.

| Champ | Type | Description |
|-------|------|-------------|
| `specs` | `ItemToolSpec[]` | Spécifications de l'outil |
| `speed` | `float` | Vitesse d'utilisation |

---

### ItemQuality

Définit la qualité et la rareté d'un item.

| Champ | Type | Description |
|-------|------|-------------|
| `id` | `String` | Identifiant de qualité |
| `itemTooltipTexture` | `String` | Texture de l'infobulle |
| `itemTooltipArrowTexture` | `String` | Texture de la flèche de l'infobulle |
| `slotTexture` | `String` | Texture de l'emplacement |
| `blockSlotTexture` | `String` | Texture de l'emplacement de bloc |
| `specialSlotTexture` | `String` | Texture de l'emplacement spécial |
| `textColor` | `Color` | Couleur du texte |
| `localizationKey` | `String` | Clé de traduction |
| `visibleQualityLabel` | `boolean` | Afficher l'étiquette de qualité |
| `renderSpecialSlot` | `boolean` | Afficher l'emplacement spécial |
| `hideFromSearch` | `boolean` | Masquer de la recherche |

---

## EntityEffect - Effets sur les Entités

Représente un effet qui peut être appliqué à une entité (bonus ou malus).

### Propriétés Principales

| Champ | Type | Description |
|-------|------|-------------|
| `id` | `String` | Identifiant unique de l'effet |
| `name` | `String` | Nom affiché |
| `applicationEffects` | `ApplicationEffects` | Effets visuels et audio |
| `worldRemovalSoundEventIndex` | `int` | Son de retrait (monde) |
| `localRemovalSoundEventIndex` | `int` | Son de retrait (local) |
| `modelOverride` | `ModelOverride` | Remplacement de modèle |

### Temporalité

| Champ | Type | Description |
|-------|------|-------------|
| `duration` | `float` | Durée en secondes |
| `infinite` | `boolean` | Durée infinie |
| `overlapBehavior` | `OverlapBehavior` | Comportement en cas de chevauchement |
| `damageCalculatorCooldown` | `double` | Temps de recharge du calcul de dégâts |

### Caractéristiques

| Champ | Type | Description |
|-------|------|-------------|
| `debuff` | `boolean` | Est un malus (effet négatif) |
| `statusEffectIcon` | `String` | Icône de statut |
| `statModifiers` | `Map<Integer, Float>` | Modificateurs de statistiques |
| `valueType` | `ValueType` | Type de valeur (Percent, Absolute) |

---

## CraftingRecipe - Recettes

Définit une recette de fabrication.

| Champ | Type | Description |
|-------|------|-------------|
| `id` | `String` | Identifiant de la recette |
| `inputs` | `MaterialQuantity[]` | Ingrédients requis |
| `outputs` | `MaterialQuantity[]` | Résultats de la recette |
| `primaryOutput` | `MaterialQuantity` | Résultat principal |
| `benchRequirement` | `BenchRequirement[]` | Établis requis |
| `knowledgeRequired` | `boolean` | Connaissance requise |
| `timeSeconds` | `float` | Temps de fabrication |
| `requiredMemoriesLevel` | `int` | Niveau de souvenirs requis |

### MaterialQuantity

| Champ | Type | Description |
|-------|------|-------------|
| `itemId` | `String` | Identifiant de l'item |
| `itemTag` | `int` | Tag de l'item |
| `resourceTypeId` | `String` | Identifiant du type de ressource |
| `quantity` | `int` | Quantité |

### BenchRequirement

| Champ | Type | Description |
|-------|------|-------------|
| `type` | `BenchType` | Type d'établi |
| `id` | `String` | Identifiant spécifique |
| `categories` | `String[]` | Catégories acceptées |
| `requiredTierLevel` | `int` | Niveau requis |

---

## Environnement

### Weather

Définit un type de météo.

#### Ciel et Lumière

| Champ | Type | Description |
|-------|------|-------------|
| `id` | `String` | Identifiant de la météo |
| `tagIndexes` | `int[]` | Tags associés |
| `stars` | `String` | Configuration des étoiles |
| `moons` | `Map<Integer, String>` | Configuration des lunes |
| `clouds` | `Cloud[]` | Configuration des nuages |
| `sunlightDampingMultiplier` | `Map<Float, Float>` | Atténuation de la lumière solaire |
| `sunlightColors` | `Map<Float, Color>` | Couleurs du soleil |
| `skyTopColors` | `Map<Float, ColorAlpha>` | Couleurs du ciel (partie supérieure) |
| `skyBottomColors` | `Map<Float, ColorAlpha>` | Couleurs du ciel (partie inférieure) |
| `skySunsetColors` | `Map<Float, ColorAlpha>` | Couleurs du coucher de soleil |

#### Soleil et Lune

| Champ | Type | Description |
|-------|------|-------------|
| `sunColors` | `Map<Float, Color>` | Couleurs du soleil |
| `sunScales` | `Map<Float, Float>` | Échelle du soleil |
| `sunGlowColors` | `Map<Float, ColorAlpha>` | Couleurs du halo solaire |
| `moonColors` | `Map<Float, ColorAlpha>` | Couleurs de la lune |
| `moonScales` | `Map<Float, Float>` | Échelle de la lune |
| `moonGlowColors` | `Map<Float, ColorAlpha>` | Couleurs du halo lunaire |

#### Brouillard et Effets

| Champ | Type | Description |
|-------|------|-------------|
| `fogColors` | `Map<Float, Color>` | Couleurs du brouillard |
| `fogHeightFalloffs` | `Map<Float, Float>` | Atténuation du brouillard en hauteur |
| `fogDensities` | `Map<Float, Float>` | Densités du brouillard |
| `fog` | `NearFar` | Distance du brouillard |
| `fogOptions` | `FogOptions` | Options du brouillard |
| `screenEffect` | `String` | Effet d'écran |
| `screenEffectColors` | `Map<Float, ColorAlpha>` | Couleurs de l'effet d'écran |
| `colorFilters` | `Map<Float, Color>` | Filtres de couleur |
| `waterTints` | `Map<Float, Color>` | Teintes de l'eau |
| `particle` | `WeatherParticle` | Particules météorologiques |

---

### WorldEnvironment

Définit un environnement de monde.

| Champ | Type | Description |
|-------|------|-------------|
| `id` | `String` | Identifiant de l'environnement |
| `waterTint` | `Color` | Teinte de l'eau |
| `fluidParticles` | `Map<Integer, FluidParticle>` | Particules des fluides |
| `tagIndexes` | `int[]` | Tags associés |

---

## Énumérations Importantes

### GameMode

Modes de jeu disponibles.

```
Adventure (0)  - Mode aventure
Creative (1)   - Mode créatif
```

### ItemArmorSlot

Emplacements d'armure.

```
Head (0)   - Tête
Chest (1)  - Torse
Hands (2)  - Mains
Legs (3)   - Jambes
```

### BlockMaterial

Types de matériaux de bloc.

```
Empty (0)  - Vide (air)
Solid (1)  - Solide
```

### DrawType

Modes de rendu des blocs.

```
Empty (0)        - Pas de rendu
GizmoCube (1)    - Cube gizmo (débogage)
Cube (2)         - Rendu cube standard
Model (3)        - Modèle 3D
CubeWithModel (4)- Cube avec modèle
```

### Opacity

Niveaux d'opacité des blocs.

```
Solid (0)          - Complètement opaque
Semitransparent (1)- Semi-transparent
Cutout (2)         - Découpage (feuilles, etc.)
Transparent (3)    - Complètement transparent
```

### InteractionType

Types d'interactions possibles.

```
Primary (0)         - Action principale (clic gauche)
Secondary (1)       - Action secondaire (clic droit)
Ability1 (2)        - Capacité 1
Ability2 (3)        - Capacité 2
Ability3 (4)        - Capacité 3
Use (5)             - Utiliser
Pick (6)            - Ramasser
Pickup (7)          - Collecter
CollisionEnter (8)  - Entrée en collision
CollisionLeave (9)  - Sortie de collision
Collision (10)      - Collision
EntityStatEffect (11) - Effet de statistique d'entité
SwapTo (12)         - Passage à
SwapFrom (13)       - Passage depuis
Death (14)          - Mort
Wielding (15)       - Équipement
ProjectileSpawn (16)- Création de projectile
ProjectileHit (17)  - Impact de projectile
ProjectileMiss (18) - Projectile raté
ProjectileBounce (19) - Rebond de projectile
Held (20)           - Tenu en main
HeldOffhand (21)    - Tenu en main secondaire
Equipped (22)       - Équipé
Dodge (23)          - Esquive
GameModeSwap (24)   - Changement de mode de jeu
```

### BenchType

Types d'établis.

```
Crafting (0)           - Établi de fabrication
Processing (1)         - Établi de traitement
DiagramCrafting (2)    - Établi à diagramme
StructuralCrafting (3) - Établi structural
```

### BlockFace

Faces d'un bloc.

```
None (0)   - Aucune
Up (1)     - Haut
Down (2)   - Bas
North (3)  - Nord
South (4)  - Sud
East (5)   - Est
West (6)   - Ouest
```

### OverlapBehavior

Comportement lors du chevauchement d'effets.

```
Extend (0)    - Prolonger la durée
Overwrite (1) - Remplacer
Ignore (2)    - Ignorer le nouvel effet
```

### ValueType

Type de valeur pour les modificateurs.

```
Percent (0)  - Pourcentage
Absolute (1) - Valeur absolue
```

### CalculationType

Type de calcul pour les modificateurs.

```
Additive (0)       - Additif (+X)
Multiplicative (1) - Multiplicatif (*X)
```

### ModifierTarget

Cible du modificateur.

```
Min (0) - Valeur minimale
Max (1) - Valeur maximale
```

### Cosmetic

Types de cosmétiques (masquables par l'armure).

```
Haircut (0)        - Coupe de cheveux
FacialHair (1)     - Pilosité faciale
Undertop (2)       - Sous-vêtement haut
Overtop (3)        - Sur-vêtement haut
Pants (4)          - Pantalon
Overpants (5)      - Sur-pantalon
Shoes (6)          - Chaussures
Gloves (7)         - Gants
Cape (8)           - Cape
HeadAccessory (9)  - Accessoire de tête
FaceAccessory (10) - Accessoire de visage
EarAccessory (11)  - Accessoire d'oreille
Ear (12)           - Oreille
```

---

## Types Auxiliaires

### Modifier

Modificateur de statistique.

| Champ | Type | Description |
|-------|------|-------------|
| `target` | `ModifierTarget` | Cible (Min/Max) |
| `calculationType` | `CalculationType` | Type de calcul |
| `amount` | `float` | Montant |

### ApplicationEffects

Effets visuels et audio lors de l'application d'un effet.

| Champ | Type | Description |
|-------|------|-------------|
| `entityBottomTint` | `Color` | Teinte du bas de l'entité |
| `entityTopTint` | `Color` | Teinte du haut de l'entité |
| `entityAnimationId` | `String` | Animation à jouer |
| `particles` | `ModelParticle[]` | Particules |
| `firstPersonParticles` | `ModelParticle[]` | Particules en première personne |
| `screenEffect` | `String` | Effet d'écran |
| `horizontalSpeedMultiplier` | `float` | Multiplicateur de vitesse horizontale |
| `soundEventIndexLocal` | `int` | Son local |
| `soundEventIndexWorld` | `int` | Son monde |
| `modelVFXId` | `String` | Identifiant des effets visuels |
| `movementEffects` | `MovementEffects` | Effets de mouvement |
| `mouseSensitivityAdjustmentTarget` | `float` | Cible d'ajustement de la sensibilité de la souris |
| `mouseSensitivityAdjustmentDuration` | `float` | Durée de l'ajustement |
| `abilityEffects` | `AbilityEffects` | Effets de capacité |

### DamageCause

Cause de dégâts.

| Champ | Type | Description |
|-------|------|-------------|
| `id` | `String` | Identifiant de la cause |
| `damageTextColor` | `String` | Couleur du texte de dégâts |

### Color / ColorAlpha

Structure de couleur.

| Champ | Type | Description |
|-------|------|-------------|
| `r` | `byte` | Composante rouge (0-255) |
| `g` | `byte` | Composante verte (0-255) |
| `b` | `byte` | Composante bleue (0-255) |
| `a` | `byte` | Composante alpha (ColorAlpha uniquement) |

---

## Registres et Gestion

### Registry

Système de registre générique pour l'enregistrement des types.

| Méthode | Description |
|---------|-------------|
| `register(T)` | Enregistre un nouvel élément |
| `isEnabled()` | Vérifie si le registre est actif |
| `enable()` | Active le registre |
| `shutdown()` | Désactive le registre |

### BlockPhysics

Composant de physique de bloc (support et décoration).

| Champ | Type | Description |
|-------|------|-------------|
| `supportData` | `byte[]` | Données de support (16384 octets) |
| `IS_DECO_VALUE` | `int` | Valeur indiquant un bloc décoratif (15) |
| `NULL_SUPPORT` | `int` | Pas de support (0) |

| Méthode | Description |
|---------|-------------|
| `set(x, y, z, support)` | Définit la valeur de support |
| `get(x, y, z)` | Obtient la valeur de support |
| `isDeco(x, y, z)` | Vérifie si c'est un bloc décoratif |
| `markDeco(...)` | Marque comme décoratif |
| `clear(...)` | Efface les données |

---

## Notes Techniques

### Sérialisation

Tous les types utilisent un format de sérialisation binaire personnalisé basé sur :
- **VarInt** : Entiers de taille variable
- **Null bits** : Champs de bits indiquant les champs nullables présents
- **Fixed block** : Partie de taille fixe au début
- **Variable block** : Partie de taille variable pour les champs dynamiques

### Package Source

```
com.hypixel.hytale.protocol - Types de protocole et de données
com.hypixel.hytale.server.core.blocktype - Module de types de blocs
com.hypixel.hytale.registry - Système de registre
```

---

*Documentation générée à partir du code décompilé du serveur Hytale.*
