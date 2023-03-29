
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
      tables: {... this.tables},
      free_roaming_users: [... this.free_roaming_users]
    };

    return game_state;
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

  remove_user: function(user_id) {
    console.log(user_id);
    var user_data = this.users[user_id];

    // Check if it is in a table
    if (user_data.table != null && user_data.seat != null) {
      delete this.tables[user_data.table].seats[user_data.seat];
      delete this.users[user_id];
      return;
    }
    
    // If is free roaming, delete it there
    for(var i = 0; i < this.free_roaming_users.length; i++) {
      if (user_id == this.free_roaming_users[i].id) {
        this.free_roaming_users.splice(i, 1);
        delete this.users[user_id];
        return;
      }
    }
  },

  get_next_empty_seat: function(table){
    for(var i = 0; i < 4; i++) {
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

    this.tables[table].seats[get_seat] = obj;
    this.users[user].table = table;
    this.users[user].seat = get_seat;

    return get_seat;
  },

  move_from_table: function(user) {
    var user_data = this.users[user];

    var obj = this.tables[user_data.table].seats[user_data.seat];
    delete this.tables[user_data.table].seats[user_data.seat];

    this.free_roaming_users.push(obj);

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
  },
  get_user_ids_on_table: function(table_id) {
    var ids = [];
    for(const seat in this.tables[table_id].seats) {
      ids.push(parseInt(this.tables[table_id].seats[seat].id));
    }

    return ids;
  },

  get_players_table: function(user_id) {
    return this.users[user_id].table;
  }
  
};

module.exports = {game_server: GAME_SERVER_MANAGER};
