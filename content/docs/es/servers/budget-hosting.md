---
id: alojamiento-economico
title: Guia de Alojamiento Economico
sidebar_label: Alojamiento Eco
sidebar_position: 5
description: Como alojar un servidor de Hytale con poco presupuesto - opciones gratuitas y economicas
---

# Guia de Alojamiento Economico

Alojar un servidor de Hytale no tiene que ser caro. Ya sea que quieras jugar con amigos o administrar un pequeno servidor comunitario, hay varias opciones gratuitas y economicas disponibles.

:::info Asociacion Proxima
Actualmente estamos finalizando una **asociacion exclusiva con una empresa de alojamiento francesa** para ofrecerte alojamiento de servidores Hytale de calidad a precios competitivos. ¡Estate atento al anuncio oficial!

Unete a nuestro [Discord](https://discord.gg/yAjaFBH4Y8) para ser el primero en saber cuando se lance esta asociacion.
:::

## Resumen de Opciones de Alojamiento

| Opcion | Costo Mensual | Jugadores Max | Dificultad | Control |
|--------|---------------|---------------|------------|---------|
| PC Personal | Gratis | 5-10 | Facil | Total |
| Oracle Cloud Gratis | Gratis | 10-15 | Dificil | Total |
| Raspberry Pi 5 | ~$100 (unico) | 5-8 | Medio | Total |
| Alojamiento Asociado | Proximamente | TBA | Facil | TBA |

## Opcion 1: Alojar en tu PC

La solucion mas simple y economica para jugar con amigos.

### Ventajas

- **Gratis** - Sin costos mensuales
- **Control total** - Acceso completo a todas las configuraciones
- **Configuracion facil** - No se requieren conocimientos de Linux
- **Baja latencia** - Para jugadores locales

### Desventajas

- La PC debe permanecer encendida mientras el servidor funciona
- Usa el ancho de banda de tu conexion a internet
- La direccion IP puede cambiar (IP dinamica)
- Riesgos de seguridad si no esta correctamente configurado

### Pasos de Configuracion

1. **Descarga** el servidor de Hytale desde [hytale.com](https://hytale.com)
2. **Instala Java 25** (Adoptium recomendado)
3. **Configura el reenvio de puertos** en tu router:
   - Protocolo: **UDP**
   - Puerto: **5520**
   - Reenviar a la IP local de tu PC

```bash
# Iniciar el servidor
java -Xms4G -Xmx4G -jar hytale-server.jar
```

### Cuando Elegir Esta Opcion

- Jugar con amigos cercanos
- Probar mods y configuraciones
- Uso temporal u ocasional
- Aprender administracion de servidores

:::tip DNS Dinamico
Si tu direccion IP cambia frecuentemente, usa un servicio de DNS dinamico gratuito como No-IP o DuckDNS para obtener un nombre de host constante.
:::

## Opcion 2: Oracle Cloud Free Tier (GRATIS)

Oracle Cloud ofrece un nivel gratuito generoso que puede ejecutar un servidor de Hytale indefinidamente.

### Especificaciones del Nivel Gratuito

| Recurso | Cantidad |
|---------|----------|
| CPUs ARM | 4 nucleos |
| RAM | 24 GB |
| Almacenamiento | 200 GB |
| Ancho de banda | 10 TB/mes |
| Duracion | **Gratis para siempre** |

:::warning Verificacion de Cuenta
Oracle requiere una tarjeta de credito para verificacion pero no te cobrara por los recursos del nivel gratuito. Algunos usuarios reportan dificultades para ser aprobados.
:::

### Guia de Configuracion

#### Paso 1: Crear Cuenta de Oracle Cloud

1. Ve a [cloud.oracle.com](https://cloud.oracle.com)
2. Registrate para una cuenta gratuita
3. Completa la verificacion de identidad
4. Espera la aprobacion de la cuenta (puede tomar 24-48 horas)

#### Paso 2: Crear Instancia VM

1. Navega a **Compute > Instances**
2. Haz clic en **Create Instance**
3. Configura:
   - **Shape**: VM.Standard.A1.Flex (ARM)
   - **OCPUs**: 4
   - **RAM**: 24 GB
   - **Imagen**: Ubuntu 24.04
   - **Almacenamiento**: 100 GB (nivel gratuito)

4. Descarga las claves SSH
5. Lanza la instancia

#### Paso 3: Configurar Red

1. Ve a **Networking > Virtual Cloud Networks**
2. Selecciona tu VCN > Security Lists
3. Agrega Regla de Entrada:
   - **Origen**: 0.0.0.0/0
   - **Protocolo**: UDP
   - **Puerto**: 5520

#### Paso 4: Instalar Servidor

```bash
# Conectar via SSH
ssh -i tu-clave.pem ubuntu@ip-de-tu-instancia

# Actualizar e instalar Java
sudo apt update && sudo apt upgrade -y
sudo apt install -y openjdk-25-jdk

# Crear directorio del servidor
mkdir -p ~/hytale-server
cd ~/hytale-server

# Descargar e iniciar el servidor
# (Descarga hytale-server.jar desde hytale.com)
java -Xms4G -Xmx4G -jar hytale-server.jar
```

### Consejos para Oracle Cloud

- **Disponibilidad de instancias** - Las instancias ARM gratuitas son limitadas; prueba diferentes regiones si no estan disponibles
- **Always Free** - Asegurate de seleccionar recursos elegibles para "Always Free"
- **Respalda tus datos** - Oracle puede terminar cuentas inactivas

## Opcion 3: Raspberry Pi 5

Una compra unica que proporciona alojamiento gratuito para siempre con costos minimos de electricidad.

### Requisitos de Hardware

| Componente | Recomendacion | Costo Estimado |
|------------|---------------|----------------|
| Raspberry Pi 5 (8GB) | Requerido | $80 |
| Fuente de Poder | Oficial 27W | $12 |
| Tarjeta MicroSD (64GB+) | Alta durabilidad | $15 |
| Carcasa con Enfriamiento | Enfriamiento activo recomendado | $10 |
| **Total** | | **~$117** |

### Expectativas de Rendimiento

- **Jugadores maximos**: 5-8
- **Distancia de vision**: 6-8 chunks recomendados
- **Consumo de energia**: ~5-10W (muy bajo)
- **Costo mensual de electricidad**: ~$1-2

### Guia de Instalacion

```bash
# Instalar Raspberry Pi OS (64-bit)
# Actualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Java 25
sudo apt install -y openjdk-25-jdk

# Crear directorio del servidor
mkdir ~/hytale-server
cd ~/hytale-server

# Crear script de inicio optimizado para Pi
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

### Optimizaciones para Raspberry Pi

```properties
# server.properties - Optimizado para Raspberry Pi
view-distance=6
max-players=8
simulation-distance=4
```

### Ventajas

- Costo unico, sin cuotas mensuales
- Muy bajo consumo de energia
- Operacion silenciosa
- Buena experiencia de aprendizaje

### Desventajas

- Limitado a grupos pequenos (5-8 jugadores)
- Menor rendimiento que VPS
- Complejidad de configuracion inicial
- Puede necesitar enfriamiento en ambientes calidos

## Requisitos Minimos del Servidor

### Minimos de Hardware

| Componente | Minimo | Recomendado |
|------------|--------|-------------|
| RAM | 4 GB | 6-8 GB |
| CPU | 2 vCPU | 4 vCPU |
| Almacenamiento | SSD requerido | NVMe preferido |
| Red | 100 Mbps | 1 Gbps |

### Requisitos de Red

| Requisito | Valor |
|-----------|-------|
| Protocolo | **UDP** |
| Puerto | **5520** |
| Latencia | < 100ms para buena experiencia |
| Ancho de banda | ~100 KB/s por jugador |

:::warning SSD Requerido
Los servidores de Hytale requieren almacenamiento SSD. Los discos duros tradicionales (HDD) causaran lag severo y problemas de carga de chunks. Los SSDs NVMe proporcionan el mejor rendimiento.
:::

## Requisitos de RAM por Cantidad de Jugadores

| Jugadores | RAM Minima | RAM Recomendada |
|-----------|------------|-----------------|
| 1-5 | 2 GB | 4 GB |
| 5-10 | 4 GB | 6 GB |
| 10-20 | 6 GB | 8 GB |
| 20-30 | 8 GB | 12 GB |

## Proximos Pasos

- [Guia de Instalacion del Servidor](/docs/servers/setup/installation)
- [Configuracion del Servidor](/docs/servers/setup/configuration)
- [Desarrollo de Plugins](/docs/modding/plugins/overview)
- [Administracion del Servidor](/docs/servers/administration/commands)
