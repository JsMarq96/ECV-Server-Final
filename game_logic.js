
const FREE_ROAM_MODE = 0;
const SEATED_MODE = 1;

var GAME_SERVER_MANAGER = {

  init: function() {
    GAME_SERVER_MANAGER.tables = {
      'table_1': { 'seats':{} },
      'table_2': { 'seats':{} },
      'table_3': { 'seats':{} },
    };

    GAME_SERVER_MANAGER.free_roaming_users = [];
    GAME_SERVER_MANAGER.users = {};

    GAME_SERVER_MANAGER.starting_pos = [0,0,0];
    

    return GAME_SERVER_MANAGER;
  },

  get_state: function () {
    const game_state = {
      tables: [... this.tables],
      free_roaming_users: [... this.free_roaming_users]
    };
  },

  add_user: function(user, style) {
    var curr_user = {
      id: user,
      mode: FREE_ROAM_MODE,
      position: [... GAME_SERVER_MANAGER.starting_pos],
      direction: [0,0,0],
      table: "",
      seat: "",
      style: style
    };

    GAME_SERVER_MANAGER.users[user] = {
      table: null,
      seat: null
    };

    GAME_SERVER_MANAGER.free_roaming_users.push(curr_user);
    return curr_user;
  },

  get_next_empty_seat: function(table){
    for(var i = 0; i < 6; i++) {
      if (!(i in GAME_SERVER_MANAGER.tables[table])) {
        return i;
      }
    }

    return -1;
  },

  move_user_to_table: function(user, table) {
    var obj = null;

    for(var i = 0; i < this.free_roaming_users.length; i++) {
      if (user == this.free_roaming_users[i].id) {
        obj = this.free_roaming_users[i];
        this.free_roaming_users.splice(i, 1);
      }
    }

    var get_seat = this.get_next_empty_seat(table);

    if (get_seat == -1) {
      return -1;
    }

    this.tables[table][get_seat] = obj;
    this.users[user].table = table;
    this.usert[user].seat = get_seat;

    return get_seat;
  },

  move_from_table: function(user) {
    var user_data = this.users[user];

    var obj = this.tables[user_data.table][user_data.seat];
    this.tables[user_data.table].delete(user_data.seat);

    this.free_roaming_users.append(obj);

    user_data.table = null;
    user_data.seat = null;

    return obj.position;
  },

  start_moving: function(user, starting_pos, direction) {
    for(var i = 0; i < this.free_roaming_users.length; i++) {
      if (user == this.free_roaming_users[i].id) {
        obj = this.free_roaming_users[i];

        obj.position = [... starting_pos];
        obj.direction = [... direction];
      }
    }
  },
  stop_moving: function(user, end_pos) {
    for(var i = 0; i < this.free_roaming_users.length; i++) {
      if (user == this.free_roaming_users[i].id) {
        obj = this.free_roaming_users[i];

        obj.position = [... end_pos];
        obj.direction = [0,0,0];
      }
    }
  }
  
};

module.exports = {game_server: GAME_SERVER_MANAGER};