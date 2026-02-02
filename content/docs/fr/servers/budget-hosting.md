---
id: hebergement-economique
title: Guide d'Hebergement Economique
sidebar_label: Hebergement Eco
sidebar_position: 5
description: Comment heberger un serveur Hytale avec un petit budget - options gratuites et economiques
---

# Guide d'Hebergement Economique

Heberger un serveur Hytale ne doit pas couter cher. Que vous souhaitiez jouer avec des amis ou gerer un petit serveur communautaire, plusieurs options gratuites et economiques sont disponibles.

:::info Partenariat a venir
Nous finalisons actuellement un **partenariat exclusif avec une societe d'hebergement francaise** pour vous proposer un hebergement de serveurs Hytale de qualite a des prix competitifs. Restez a l'ecoute pour l'annonce officielle !

Rejoignez notre [Discord](https://discord.gg/yAjaFBH4Y8) pour etre les premiers informes du lancement de ce partenariat.
:::

## Apercu des Options d'Hebergement

| Option | Cout mensuel | Joueurs max | Difficulte | Controle |
|--------|--------------|-------------|------------|----------|
| PC personnel | Gratuit | 5-10 | Facile | Total |
| Oracle Cloud Gratuit | Gratuit | 10-15 | Difficile | Total |
| Raspberry Pi 5 | ~100EUR (achat unique) | 5-8 | Moyen | Total |
| Hebergement Partenaire | Bientot disponible | TBA | Facile | TBA |

## Option 1 : Heberger sur votre PC

La solution la plus simple et la plus economique pour jouer avec des amis.

### Avantages

- **Gratuit** - Aucun cout mensuel
- **Controle total** - Acces complet a tous les parametres
- **Installation facile** - Pas de connaissances Linux requises
- **Faible latence** - Pour les joueurs locaux

### Inconvenients

- Le PC doit rester allume pendant que le serveur fonctionne
- Utilise la bande passante de votre connexion internet
- L'adresse IP peut changer (IP dynamique)
- Risques de securite si mal configure

### Etapes d'installation

1. **Telechargez** le serveur Hytale depuis [hytale.com](https://hytale.com)
2. **Installez Java 25** (Adoptium recommande)
3. **Configurez la redirection de port** sur votre routeur/box :
   - Protocole : **UDP**
   - Port : **5520**
   - Rediriger vers l'IP locale de votre PC

```bash
# Demarrer le serveur
java -Xms4G -Xmx4G -jar hytale-server.jar
```

### Quand choisir cette option

- Jouer avec des amis proches
- Tester des mods et configurations
- Utilisation temporaire ou occasionnelle
- Apprendre l'administration de serveur

:::tip DNS Dynamique
Si votre adresse IP change frequemment, utilisez un service DNS dynamique gratuit comme No-IP ou DuckDNS pour obtenir un nom d'hote constant.
:::

## Option 2 : Oracle Cloud Free Tier (GRATUIT)

Oracle Cloud offre un niveau gratuit genereux qui peut faire tourner un serveur Hytale indefiniment.

### Specifications du Niveau Gratuit

| Ressource | Quantite |
|-----------|----------|
| CPU ARM | 4 coeurs |
| RAM | 24 Go |
| Stockage | 200 Go |
| Bande passante | 10 To/mois |
| Duree | **Gratuit pour toujours** |

:::warning Verification du compte
Oracle necessite une carte bancaire pour la verification mais ne vous facturera pas pour les ressources du niveau gratuit. Certains utilisateurs signalent des difficultes pour etre approuves.
:::

### Guide d'Installation

#### Etape 1 : Creer un compte Oracle Cloud

1. Allez sur [cloud.oracle.com](https://cloud.oracle.com)
2. Inscrivez-vous pour un compte gratuit
3. Completez la verification d'identite
4. Attendez l'approbation du compte (peut prendre 24-48 heures)

#### Etape 2 : Creer une instance VM

1. Naviguez vers **Compute > Instances**
2. Cliquez sur **Create Instance**
3. Configurez :
   - **Shape** : VM.Standard.A1.Flex (ARM)
   - **OCPUs** : 4
   - **RAM** : 24 Go
   - **Image** : Ubuntu 24.04
   - **Stockage** : 100 Go (niveau gratuit)

4. Telechargez les cles SSH
5. Lancez l'instance

#### Etape 3 : Configurer le reseau

1. Allez dans **Networking > Virtual Cloud Networks**
2. Selectionnez votre VCN > Security Lists
3. Ajoutez une regle Ingress :
   - **Source** : 0.0.0.0/0
   - **Protocole** : UDP
   - **Port** : 5520

#### Etape 4 : Installer le serveur

```bash
# Connectez-vous via SSH
ssh -i votre-cle.pem ubuntu@ip-de-votre-instance

# Mise a jour et installation de Java
sudo apt update && sudo apt upgrade -y
sudo apt install -y openjdk-25-jdk

# Creation du repertoire serveur
mkdir -p ~/hytale-server
cd ~/hytale-server

# Telecharger et demarrer le serveur
# (Telechargez hytale-server.jar depuis hytale.com)
java -Xms4G -Xmx4G -jar hytale-server.jar
```

### Astuces pour Oracle Cloud

- **Disponibilite des instances** - Les instances ARM gratuites sont limitees ; essayez differentes regions si indisponibles
- **Always Free** - Assurez-vous de selectionner les ressources eligibles "Always Free"
- **Sauvegardez vos donnees** - Oracle peut fermer les comptes inactifs

## Option 3 : Raspberry Pi 5

Un achat unique qui fournit un hebergement gratuit pour toujours avec des couts d'electricite minimaux.

### Configuration Materielle Requise

| Composant | Recommandation | Cout estime |
|-----------|----------------|-------------|
| Raspberry Pi 5 (8Go) | Requis | 80EUR |
| Alimentation | Officielle 27W | 12EUR |
| Carte MicroSD (64Go+) | Haute endurance | 15EUR |
| Boitier avec refroidissement | Refroidissement actif recommande | 10EUR |
| **Total** | | **~117EUR** |

### Performances Attendues

- **Joueurs maximum** : 5-8
- **Distance de vue** : 6-8 chunks recommandes
- **Consommation electrique** : ~5-10W (tres faible)
- **Cout mensuel en electricite** : ~1-2EUR

### Guide d'Installation

```bash
# Installez Raspberry Pi OS (64-bit)
# Mise a jour du systeme
sudo apt update && sudo apt upgrade -y

# Installation de Java 25
sudo apt install -y openjdk-25-jdk

# Creation du repertoire serveur
mkdir ~/hytale-server
cd ~/hytale-server

# Creation du script de demarrage optimise pour Pi
cat > start.sh << 'EOF'
#!/bin/bash
java -Xms2G -Xmx3G \
  -XX:+UseG1GC \
  -XX:+ParallelRefProcEnabled \
  -XX:MaxGCPauseMillis=200 \
  -XX:+UnlockExperimentalVMOptions \
  -XX:+DisableExplicitGC \
  -jar hytale-server.jar
EOF
chmod +x start.sh
```

### Optimisations pour Raspberry Pi

```properties
# server.properties - Optimise pour Raspberry Pi
view-distance=6
max-players=8
simulation-distance=4
```

### Avantages

- Cout unique, pas de frais mensuels
- Tres faible consommation electrique
- Fonctionnement silencieux
- Bonne experience d'apprentissage

### Inconvenients

- Limite aux petits groupes (5-8 joueurs)
- Performance inferieure au VPS
- Complexite de l'installation initiale
- Peut necessiter un refroidissement dans les environnements chauds

## Configuration Minimale Requise

### Minimums Materiels

| Composant | Minimum | Recommande |
|-----------|---------|------------|
| RAM | 4 Go | 6-8 Go |
| CPU | 2 vCPU | 4 vCPU |
| Stockage | SSD obligatoire | NVMe prefere |
| Reseau | 100 Mbps | 1 Gbps |

### Configuration Reseau Requise

| Exigence | Valeur |
|----------|--------|
| Protocole | **UDP** |
| Port | **5520** |
| Latence | < 100ms pour une bonne experience |
| Bande passante | ~100 Ko/s par joueur |

:::warning SSD Obligatoire
Les serveurs Hytale necessitent un stockage SSD. Les disques durs traditionnels (HDD) causeront des lags severes et des problemes de chargement de chunks. Les SSD NVMe offrent les meilleures performances.
:::

## Besoins en RAM par Nombre de Joueurs

| Joueurs | RAM minimum | RAM recommandee |
|---------|-------------|-----------------|
| 1-5 | 2 Go | 4 Go |
| 5-10 | 4 Go | 6 Go |
| 10-20 | 6 Go | 8 Go |
| 20-30 | 8 Go | 12 Go |

## Prochaines Etapes

- [Guide d'installation du serveur](/docs/servers/setup/installation)
- [Configuration du serveur](/docs/servers/setup/configuration)
- [Developpement de plugins](/docs/modding/plugins/overview)
- [Administration du serveur](/docs/servers/administration/commands)
