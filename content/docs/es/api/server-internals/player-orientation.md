# Orientacion y Rotacion del Jugador

Esta guia explica como recuperar la orientacion de un jugador desde su referencia de entidad y convertirla a grados o direcciones cardinales.

## Obtener la Rotacion desde EntityRef

La rotacion de la cabeza del jugador se almacena en el componente `HeadRotation`. Los valores de rotacion se almacenan en **radianes**.

```java
// Obtener el componente HeadRotation desde la referencia de entidad
HeadRotation headRotation = store.getComponent(ref, HeadRotation.getComponentType());

// Obtener el vector de rotacion (valores en RADIANES)
Vector3f rotation = headRotation.getRotation();

float pitch = rotation.getPitch();  // Rotacion vertical (arriba/abajo)
float yaw = rotation.getYaw();      // Rotacion horizontal (N/S/E/O)
float roll = rotation.getRoll();    // Rotacion de alabeo (inclinacion)
```

## Conversion a Grados

Dado que los valores de rotacion se almacenan en radianes, usa `Math.toDegrees()` para convertir:

```java
// Convertir radianes a grados
double yawDegrees = Math.toDegrees(yaw);
double pitchDegrees = Math.toDegrees(pitch);

// Normalizar el yaw al rango 0-360
double normalizedYaw = (yawDegrees % 360 + 360) % 360;
```

### Rangos de Rotacion

| Eje | Rango (Radianes) | Rango (Grados) | Descripcion |
|-----|------------------|----------------|-------------|
| Yaw | 0 a 2π | 0° a 360° | Rotacion horizontal completa |
| Pitch | -π/2 a π/2 | -90° a 90° | Mirar hacia abajo a hacia arriba |
| Roll | -π a π | -180° a 180° | Inclinacion lateral |

## Obtener la Direccion Cardinal (N/S/E/O)

### Metodo 1: Usar getAxisDirection()

El componente `HeadRotation` proporciona un metodo que devuelve el vector de direccion redondeado:

```java
// Devuelve un Vector3i con valores de -1, 0 o 1 por eje
Vector3i axisDirection = headRotation.getAxisDirection();

// Solo para horizontal (ignora la rotacion vertical)
Vector3i horizontalDir = headRotation.getHorizontalAxisDirection();
```

### Metodo 2: Calculo Manual desde el Yaw

```java
public static String getCardinalDirection(float yawRadians) {
    double yawDegrees = Math.toDegrees(yawRadians);
    yawDegrees = (yawDegrees % 360 + 360) % 360; // Normalizar a 0-360

    if (yawDegrees >= 315 || yawDegrees < 45) {
        return "NORTE";
    } else if (yawDegrees >= 45 && yawDegrees < 135) {
        return "OESTE";
    } else if (yawDegrees >= 135 && yawDegrees < 225) {
        return "SUR";
    } else {
        return "ESTE";
    }
}
```

### Metodo 3: Ocho Direcciones (con intercardinales)

```java
public static String getDirection8(float yawRadians) {
    double yawDegrees = Math.toDegrees(yawRadians);
    yawDegrees = (yawDegrees % 360 + 360) % 360;

    if (yawDegrees >= 337.5 || yawDegrees < 22.5) return "N";
    if (yawDegrees >= 22.5 && yawDegrees < 67.5) return "NO";
    if (yawDegrees >= 67.5 && yawDegrees < 112.5) return "O";
    if (yawDegrees >= 112.5 && yawDegrees < 157.5) return "SO";
    if (yawDegrees >= 157.5 && yawDegrees < 202.5) return "S";
    if (yawDegrees >= 202.5 && yawDegrees < 247.5) return "SE";
    if (yawDegrees >= 247.5 && yawDegrees < 292.5) return "E";
    return "NE";
}
```

## Sistema de Coordenadas

Hytale utiliza el siguiente sistema de coordenadas para las direcciones:

| Direccion | Eje | Valor del Vector |
|-----------|-----|------------------|
| NORTE | Z- | (0, 0, -1) |
| SUR | Z+ | (0, 0, 1) |
| ESTE | X+ | (1, 0, 0) |
| OESTE | X- | (-1, 0, 0) |
| ARRIBA | Y+ | (0, 1, 0) |
| ABAJO | Y- | (0, -1, 0) |

## Obtener un Vector de Direccion Preciso

Para obtener la direccion exacta hacia donde mira el jugador como un vector normalizado:

```java
// Obtener el vector de direccion normalizado
Vector3d lookDirection = headRotation.getDirection();

// La formula usada internamente:
// x = cos(pitch) * (-sin(yaw))
// y = sin(pitch)
// z = cos(pitch) * (-cos(yaw))
```

## Ejemplo Completo

```java
public void mostrarOrientacionJugador(Store<EntityStore> store, Ref<EntityStore> playerRef) {
    // Obtener los componentes
    HeadRotation headRotation = store.getComponent(playerRef, HeadRotation.getComponentType());
    TransformComponent transform = store.getComponent(playerRef, TransformComponent.getComponentType());

    // Obtener los valores de rotacion
    Vector3f rotation = headRotation.getRotation();
    float yaw = rotation.getYaw();
    float pitch = rotation.getPitch();

    // Convertir a grados
    double yawDegrees = Math.toDegrees(yaw);
    double pitchDegrees = Math.toDegrees(pitch);

    // Normalizar el yaw a 0-360
    yawDegrees = (yawDegrees % 360 + 360) % 360;

    // Obtener la direccion cardinal
    Vector3i cardinalDir = headRotation.getAxisDirection();
    String cardinal = getCardinalDirection(yaw);

    // Obtener la direccion precisa de la mirada
    Vector3d lookDir = headRotation.getDirection();

    // Mostrar los resultados
    System.out.println("Yaw: " + yawDegrees + "°");
    System.out.println("Pitch: " + pitchDegrees + "°");
    System.out.println("Cardinal: " + cardinal);
    System.out.println("Mirando hacia: " + lookDir);
}
```

## Componentes Relacionados

| Componente | Descripcion |
|------------|-------------|
| `HeadRotation` | Direccion de la cabeza/mirada de la entidad |
| `TransformComponent` | Posicion y rotacion del cuerpo |
| `Transform` | Clase de datos que combina posicion + rotacion |
| `Direction` | Clase de protocolo para serializacion de red (yaw, pitch, roll) |

## Enumeraciones de Direccion

Hytale proporciona varias enumeraciones de direccion para diferentes casos de uso:

### OrthogonalDirection (6 direcciones)
```java
public enum OrthogonalDirection {
    N, S, E, W, U, D  // Norte, Sur, Este, Oeste, Arriba (Up), Abajo (Down)
}
```

### MovementDirection (Relativo al jugador)
```java
public enum MovementDirection {
    None,           // Ninguno
    Forward,        // Adelante
    Back,           // Atras
    Left,           // Izquierda
    Right,          // Derecha
    ForwardLeft,    // Adelante-Izquierda
    ForwardRight,   // Adelante-Derecha
    BackLeft,       // Atras-Izquierda
    BackRight       // Atras-Derecha
}
```

### PrefabRotation (incrementos de 90°)
```java
public enum PrefabRotation {
    ROTATION_0,    // 0°
    ROTATION_90,   // 90°
    ROTATION_180,  // 180°
    ROTATION_270   // 270°
}
```

## Ver Tambien

- [Sistema de Componentes de Entidad](./ecs.md)
- [Componente Transform](./ecs.md#transform)
- [Componente HeadRotation](./ecs.md#headrotation)
