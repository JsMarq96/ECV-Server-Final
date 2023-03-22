# Communication protocol:

## Websocket
Se connecta en el endpoint /messages

### user_declaration
El cliente envia un mensaje de user_declaration, en que contiene su usuario,
para redirijir los mensajes a ese usuario en su WebSocket.

### message
Contiene un mensaje que se envia a otodos los participantes de la conversaion
{user_id: .., message: ..., conversation_id: ...}


## API
### /conversations_list
Devuleve un objeto {result:"successs", .data:[]} con los IDs de las conversaciones activas

### /create_conversation
Anade una nueva conversacion al server

### /get_conversation_data
Devuelve toda la info de la conversacion: es decir mensajes y participantes:
{result: success, user:[...], messages: [...]}
