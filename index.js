var CHAT_MANAGER = require('./chat_logic.js').chat;
var USER_MANAGER = require('./user_manager.js').users;
var GAME_MANAGER = require('./game_logic.js').game_server;

var app_express = {};
var express_ws = {};
var chat_manager = {};

var users_conected = [];
var conversations_socket = {};
var chat_conversation_socket= {};

GAME_MANAGER.init();
USER_MANAGER.init();

function config() {

  // For the ROOM ECV
  app_express.ws('/messages', function(ws, req) {
    ws.on('message', function(msg) {
      // On message cases:
      var msg_obj = JSON.parse(msg);

      // Message types:
      // - Login
      // - Move request
      // - Send message
      // - Send close message
      // - Change room
      console.log(msg_obj, "New mesasge");

      if (msg_obj.type.localeCompare("login") == 0) {
        USER_MANAGER.login(msg_obj.data, function(result) {
          // Error login in
          if (result == -1) {
            ws.send(JSON.stringify({'type':'login_error', 'msg':'Error with user-password convo'}));
          } else {

            if (result in conversations_socket) {
              // There is already an user logged in
              ws.send(JSON.stringify({'type':'login_error', 'msg':'User already logged in'}));
            } else {
              // Success login in
              ws._user_id = result;

              var user_obj = GAME_MANAGER.add_user(result, msg_obj.style);

              var new_user_obj = JSON.stringify({'type': 'new_character',
                                                 'user': user_obj});
              // Send to the other users in the room
              for(const key in conversations_socket) {
                conversations_socket[key].send(new_user_obj);
              }

              conversations_socket[result] = ws;

              var logged_in_msg = JSON.stringify({'type':'logged_in',
                                                   'id': result,
                                                   'style':msg_obj.style, 
                                                   'room_state': GAME_MANAGER.get_state()});
              console.log(GAME_MANAGER.get_state());

              ws.send(logged_in_msg);
            }
          }
        });
      } else if (msg_obj.type.localeCompare("register") == 0) {
        USER_MANAGER.login(msg_obj.data, function(result) {
          if (result == -1) {
            USER_MANAGER.register(msg_obj.data, function(v) {
              if (v != -1) {
                // Success registering in
                ws.send(JSON.stringify({'type':'registered_in'}));
              } else {
                // Error login in
                ws.send(JSON.stringify({'type':'register_error'}));
              }

            });
          } else {
            // Error login in
            ws.send(JSON.stringify({'type':'register_error'}));
          }
        });
      } else if (msg_obj.type.localeCompare("move_to_table") == 0) {
        
        var seat_id = GAME_MANAGER.move_user_to_table(ws._user_id, msg_obj.table);

        if (seat_id != -1) {
          const result_msg = JSON.stringify({'type':'move_to_table', 'user_id': ws._user_id, 'table': msg_obj.table, 'seat': seat_id});
          
          for(const key in conversations_socket) {
            conversations_socket[key].send(result_msg);
          }
        } else {
          ws.send(JSON.stringify({'type':'full_table'})); // Error
        }
      
      } else if (msg_obj.type.localeCompare("move_out_of_table") == 0) {
        
        var new_pos = GAME_MANAGER.move_from_table(ws._user_id);

        var result_msg = JSON.stringify({'type':'outside_table', 'user_id': ws._user_id, 'new_pos': new_pos});

        for(const key in conversations_socket) {
          conversations_socket[key].send(result_msg);
        }
      } else if (msg_obj.type.localeCompare("start_moving") == 0) {
        
        GAME_MANAGER.start_moving(ws._user_id, msg_obj.start_pos, msg_obj.direction);

        var result_msg = JSON.stringify({'type':'start_moving', 'user_id': ws._user_id, 'start_pos': msg_obj.start_pos, 'direction': msg_obj.direction});

        for(const key in conversations_socket) {
          conversations_socket[key].send(result_msg);
        }
      } else if (msg_obj.type.localeCompare("stop_moving") == 0) {
        
        GAME_MANAGER.stop_moving(ws._user_id, msg_obj.end_pos);

        var result_msg = JSON.stringify({'type':'stop_moving', 'user_id': ws._user_id, 'end_pos': msg_obj.end_pos});

        for(const key in conversations_socket) {
          conversations_socket[key].send(result_msg);
        }
      } else if (msg_obj.type.localeCompare("message") == 0) {
        var user_on_table = GAME_MANAGER.get_user_ids_on_table(GAME_MANAGER.get_players_table(ws._user_id));

        var result_msg = JSON.stringify({'type':'message', 'from': ws._user_id, 'message': msg_obj.message, 'table_id': msg_obj.table_id});
        console.log(user_on_table, ws._user_id);

        // Only send the message if the user is in the table
        if (ws._user_id.includes(user_on_table)) {
          
          for(const key in user_on_table) {
            conversations_socket[user_on_table[key]].send(result_msg);
          }
        }
      }
    });
    ws.on('error', function(err) {
      console.log('Error on ws, usually disconection from teh user');
      if (ws._user_id != undefined) {
        GAME_MANAGER.remove_user(ws._user_id);
      }
    });

    ws.on('close', function(err) {
      console.log('User disconected');
      if (ws._user_id != undefined) {
        // Remove the user's stored websocket
        delete conversations_socket[ws._user_id];
        // Remove the user from the rooms
        GAME_MANAGER.remove_user(ws._user_id);
      }

      

      // Send the discoenct message to the other users on the room
      /*var user_ids = GAME_MANAGER.get_users_id_on_chatroom(GAME_MANAGER.user_room_id[ws._user_id]);
      if (user_ids != null) {
        var msg_obj = JSON.stringify({'type':'user_disconnect',
                                      'name': GAME_MANAGER.user_id_name[ws._user_id],
                                      'user_id': ws._user_id});
        for(var i = 0; i < user_ids.length; i++) {
          conversations_socket[user_ids[i]].send(msg_obj);
        }
      }*/
    });
  });

  app_express.listen(9035, function() {
    console.log("Server listening");
  });

  console.log('Server initiated');
}


function init() {
  var express = require('express');
  app_express = express();
  app_express, express_ws = require('@wll8/express-ws')(app_express);

  console.log('Activate express and websocket');

  GAME_MANAGER.init();

  // When you stablish the databases connection, launch the server
  chat_manager = CHAT_MANAGER.init(config);
}


init();
