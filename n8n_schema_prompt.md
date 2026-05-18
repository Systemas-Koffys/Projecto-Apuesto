# 📋 Súper Prompt de Gemini Calibrado (Scores24 Premium)

Este es el prompt final y definitivo ajustado para tu nodo de **Gemini** en n8n (`models/gemini-2.5-flash`). Une las variables de tu flujo de n8n, el contexto de tu API de Football, y la estructura de datos extendida (el nuevo JSON con los promedios y dobles paneles) que requiere el frontend de React.

---

## 1. Copia y pega este Prompt en el nodo "Message a model" de Gemini en n8n:

```text
Actúa como el algoritmo estadístico principal de la página Scores24.live. 
Analiza el enfrentamiento: {{$node["Webhook Recibir Datos"].json.body.homeName}} vs {{$node["Webhook Recibir Datos"].json.body.awayName}}.

**DATOS TÁCTICOS Y DE LA API OFICIAL:** 
{{$node["API Football Data"].json}}

**REQUERIMIENTOS DE ANÁLISIS:**
1. Crea un análisis táctico resumiendo el escenario del partido (máximo 3 líneas).
2. Genera 3 Puntos Clave contundentes basados en los datos reales del partido.
3. Obtén la Clasificación actual (e.g. "1º (15 pts)" o "15º (5 pts)") para ambos equipos basándote en la API.
4. Desarrolla las Rachas y Estadísticas recientes de los últimos 6 partidos de cada equipo. Debes proveer la racha de letras ("V", "E", "P") y las estadísticas de promedios para Victorias, Empates, Derrotas, Goles anotados/recibidos, Ambos Marcan (%), y Overs/Unders.
5. Determina los Jugadores Lesionados o Sancionados (bajas clave) para cada equipo basándote en los datos de la API (si no hay, coloca ["Plantilla completa"]).
6. Genera entre 5 y 10 Tendencias Deportivas detalladas. Cada tendencia debe ser un objeto con "text" (ej: "Sevilla ha visto menos de 2.5 goles en sus últimos 4 partidos") y "type" que debe ser estrictamente uno de los siguientes: 'goal', 'card', 'corner', 'time', 'warning', 'history'.
7. Calcula Probabilidades realistas (0-100%) para el partido (1X2, Over/Under 2.5, BTTS).
8. Determina las cuotas lógicas de mercado y mercados específicos (Hándicap, Córners, Tarjetas, Primer Gol).

**FORMATO DE RESPUESTA REQUERIDO:**
Devuelve ÚNICAMENTE un objeto JSON válido y crudo, sin bloques de código Markdown (```json ... ```) ni texto explicativo antes o después. Cumple estrictamente con esta estructura de datos:

{
  "analysis": "Tu análisis táctico corto...",
  "confidence": 85,
  "scorePrediction": "2-1",
  "mainPrediction": "Sevilla o empate + menos de 3.5 goles",
  "predictionOdds": "2.37",
  "keyPoints": [
    "Punto clave 1",
    "Punto clave 2",
    "Punto clave 3"
  ],
  "recentForm": {
    "home": {
      "form": ["V", "P", "P", "V", "V", "V"], // Array de exactamente 6 strings ('V', 'E' o 'P')
      "stats": {
        "victorias": "4/6 (67%)",
        "empates": "0/6 (0%)",
        "derrotas": "2/6 (33%)",
        "totalGoles": "2.83",
        "ambosMarcan": "67%",
        "golesMarcados": "1.5",
        "golesRecibidos": "1.33",
        "over25": "67%",
        "under25": "33%"
      }
    },
    "away": {
      "form": ["P", "V", "E", "V", "P", "V"],
      "stats": {
        "victorias": "3/6 (50%)",
        "empates": "1/6 (17%)",
        "derrotas": "2/6 (33%)",
        "totalGoles": "3.0",
        "ambosMarcan": "50%",
        "golesMarcados": "1.67",
        "golesRecibidos": "1.33",
        "over25": "33%",
        "under25": "67%"
      }
    }
  },
  "h2hSummary": "Últimos 10 partidos: 4 victorias de Sevilla, 3 del Real Madrid, 3 empates.",
  "missingPlayers": {
    "home": ["Jugador 1 (Lesión)", "Jugador 2 (Sanción)"],
    "away": ["Plantilla completa"]
  },
  "standings": {
    "home": "12º (43 pts)",
    "away": "2º (80 pts)"
  },
  "trends": [
    { "text": "Real Madrid ha marcado en sus últimos 6 partidos de visita.", "type": "goal" },
    { "text": "Sevilla promedia menos de 4.5 tarjetas amarillas.", "type": "card" }
  ],
  "probabilities": {
    "homeWin": 30,
    "draw": 20,
    "awayWin": 50,
    "over25": 60,
    "under25": 40,
    "bttsYes": 70,
    "bttsNo": 30
  },
  "markets": {
    "handicap": "-0.5 Visitante",
    "corners": "Más de 9.5",
    "cards": "Más de 4.5",
    "firstGoal": "Real Madrid",
    "bothTeamsToScore": "Sí"
  },
  "odds": {
    "local": 3.20,
    "draw": 3.40,
    "away": 2.10
  }
}
```

## 2. Configuración Crítica del Nodo "API Football Data" en n8n 🛠️

En la captura de pantalla de tu n8n, se observa que la URL de tu petición HTTP es:
`https://v3.football.api-sports.io/fixtures/headtohead`

Para que esta petición funcione y devuelva el histórico real entre los dos equipos, **DEBES enviarle los IDs correspondientes en los parámetros de consulta (Query Parameters)**. 

### Paso a paso para configurarlo:

1. **Activación de Parámetros**:
   En tu nodo **API Football Data**, activa el interruptor de **Send Query Parameters** (ponlo en verde/activo).

2. **Añadir el Parámetro H2H**:
   Haz clic en *Add Parameter* y configúralo exactamente así:
   * **Name**: `h2h`
   * **Value**: `{{ $node["Webhook Recibir Datos"].json.body.homeId }}-{{ $node["Webhook Recibir Datos"].json.body.awayId }}`

*(Nota: Para habilitar esto, acabo de actualizar el frontend de React en `Dashboard.jsx` y `mockData.js` para que ahora, además de los nombres, envíe `homeId` y `awayId` de forma nativa en el cuerpo del Webhook. ¡Ya está listo en el código!)*
