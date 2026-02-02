---
id: budget-hosting
title: Budget Server Hosting Guide
sidebar_label: Budget Hosting
sidebar_position: 5
description: How to host a Hytale server on a budget - free and low-cost options
---

# Budget Server Hosting Guide

Hosting a Hytale server does not have to be expensive. Whether you want to play with friends or run a small community server, there are several free and low-cost options available.

:::info Partnership Coming Soon
We are currently finalizing an **exclusive partnership with a French hosting company** to offer you quality Hytale server hosting at competitive prices. Stay tuned for the official announcement!

Join our [Discord](https://discord.gg/yAjaFBH4Y8) to be the first to know when this partnership launches.
:::

## Hosting Options Overview

| Option | Monthly Cost | Max Players | Difficulty | Control |
|--------|--------------|-------------|------------|---------|
| Personal PC | Free | 5-10 | Easy | Full |
| Oracle Cloud Free | Free | 10-15 | Hard | Full |
| Raspberry Pi 5 | ~$100 (one-time) | 5-8 | Medium | Full |
| Partner Hosting | Coming Soon | TBA | Easy | TBA |

## Option 1: Host on Your PC

The simplest and most cost-effective solution for playing with friends.

### Advantages

- **Free** - No monthly costs
- **Full control** - Complete access to all settings
- **Easy setup** - No Linux knowledge required
- **Low latency** - For local players

### Disadvantages

- PC must stay on while the server runs
- Uses your home internet bandwidth
- IP address may change (dynamic IP)
- Security risks if not properly configured

### Setup Steps

1. **Download** the Hytale server from [hytale.com](https://hytale.com)
2. **Install Java 25** (Adoptium recommended)
3. **Configure port forwarding** on your router:
   - Protocol: **UDP**
   - Port: **5520**
   - Forward to your PC's local IP

```bash
# Start the server
java -Xms4G -Xmx4G -jar hytale-server.jar
```

### When to Choose This Option

- Playing with close friends
- Testing mods and configurations
- Temporary or occasional use
- Learning server administration

:::tip Dynamic DNS
If your IP address changes frequently, use a free Dynamic DNS service like No-IP or DuckDNS to get a consistent hostname.
:::

## Option 2: Oracle Cloud Free Tier (FREE)

Oracle Cloud offers a generous free tier that can run a Hytale server indefinitely.

### Free Tier Specifications

| Resource | Amount |
|----------|--------|
| ARM CPUs | 4 cores |
| RAM | 24 GB |
| Storage | 200 GB |
| Bandwidth | 10 TB/month |
| Duration | **Forever free** |

:::warning Account Verification
Oracle requires a credit card for verification but will not charge you for free tier resources. Some users report difficulty getting approved.
:::

### Setup Guide

#### Step 1: Create Oracle Cloud Account

1. Go to [cloud.oracle.com](https://cloud.oracle.com)
2. Sign up for a free account
3. Complete identity verification
4. Wait for account approval (can take 24-48 hours)

#### Step 2: Create VM Instance

1. Navigate to **Compute > Instances**
2. Click **Create Instance**
3. Configure:
   - **Shape**: VM.Standard.A1.Flex (ARM)
   - **OCPUs**: 4
   - **RAM**: 24 GB
   - **Image**: Ubuntu 24.04
   - **Storage**: 100 GB (free tier)

4. Download SSH keys
5. Launch instance

#### Step 3: Configure Networking

1. Go to **Networking > Virtual Cloud Networks**
2. Select your VCN > Security Lists
3. Add Ingress Rule:
   - **Source**: 0.0.0.0/0
   - **Protocol**: UDP
   - **Port**: 5520

#### Step 4: Install Server

```bash
# Connect via SSH
ssh -i your-key.pem ubuntu@your-instance-ip

# Update and install Java
sudo apt update && sudo apt upgrade -y
sudo apt install -y openjdk-25-jdk

# Create server directory
mkdir -p ~/hytale-server
cd ~/hytale-server

# Download and start the server
# (Download hytale-server.jar from hytale.com)
java -Xms4G -Xmx4G -jar hytale-server.jar
```

### Tips for Oracle Cloud

- **Instance availability** - Free ARM instances are limited; try different regions if unavailable
- **Always Free** - Ensure you select "Always Free" eligible resources
- **Backup your data** - Oracle may terminate inactive accounts

## Option 3: Raspberry Pi 5

A one-time purchase that provides free hosting forever with minimal electricity costs.

### Hardware Requirements

| Component | Recommendation | Estimated Cost |
|-----------|---------------|----------------|
| Raspberry Pi 5 (8GB) | Required | $80 |
| Power Supply | Official 27W | $12 |
| MicroSD Card (64GB+) | High endurance | $15 |
| Case with Cooling | Active cooling recommended | $10 |
| **Total** | | **~$117** |

### Performance Expectations

- **Maximum players**: 5-8
- **View distance**: 6-8 chunks recommended
- **Power consumption**: ~5-10W (very low)
- **Monthly electricity cost**: ~$1-2

### Installation Guide

```bash
# Install Raspberry Pi OS (64-bit)
# Update system
sudo apt update && sudo apt upgrade -y

# Install Java 25
sudo apt install -y openjdk-25-jdk

# Create server directory
mkdir ~/hytale-server
cd ~/hytale-server

# Create optimized start script for Pi
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

### Optimizations for Raspberry Pi

```properties
# server.properties - Optimized for Raspberry Pi
view-distance=6
max-players=8
simulation-distance=4
```

### Advantages

- One-time cost, no monthly fees
- Very low power consumption
- Silent operation
- Good learning experience

### Disadvantages

- Limited to small groups (5-8 players)
- Lower performance than VPS
- Initial setup complexity
- May need cooling in warm environments

## Minimum Server Requirements

### Hardware Minimums

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| RAM | 4 GB | 6-8 GB |
| CPU | 2 vCPU | 4 vCPU |
| Storage | SSD required | NVMe preferred |
| Network | 100 Mbps | 1 Gbps |

### Network Requirements

| Requirement | Value |
|-------------|-------|
| Protocol | **UDP** |
| Port | **5520** |
| Latency | < 100ms for good experience |
| Bandwidth | ~100 KB/s per player |

:::warning SSD Required
Hytale servers require SSD storage. Traditional hard drives (HDD) will cause severe lag and chunk loading issues. NVMe SSDs provide the best performance.
:::

## RAM Requirements by Player Count

| Players | Minimum RAM | Recommended RAM |
|---------|-------------|-----------------|
| 1-5 | 2 GB | 4 GB |
| 5-10 | 4 GB | 6 GB |
| 10-20 | 6 GB | 8 GB |
| 20-30 | 8 GB | 12 GB |

## Next Steps

- [Server Installation Guide](/docs/servers/setup/installation)
- [Server Configuration](/docs/servers/setup/configuration)
- [Plugin Development](/docs/modding/plugins/overview)
- [Server Administration](/docs/servers/administration/commands)
