
var CHAT_MANAGER = {

    init: function(on_finish) {
      var redis = require('redis');
      CHAT_MANAGER.redis_client = redis.createClient();

      CHAT_MANAGER.redis_client.connect().then(on_finish).catch(function(err) { console.log("fef", err); });
      return this;
    },

    get_conversations: function (on_finish) {
      CHAT_MANAGER.redis_client.LRANGE('conversations', 0, -1).then(function(v) {
         on_finish(v);
      });
    },

    create_conversations: function(conversation_name, on_finish) {
      CHAT_MANAGER.redis_client.LPUSH('conversations', conversation_name);
      on_finish();
    },

    get_users_on_convo: function(conversation_id, on_finish) {
      CHAT_MANAGER.redis_client.LRANGE(conversation_id + '_users', 0, -1).then(function(v) {
         on_finish(v);
      }).catch(function(error) {
        console.log(error);
        on_finish([]);
      });
    },

    get_convo_history_messages: function(conversation_id, on_finish) {
      CHAT_MANAGER.redis_client.LRANGE(conversation_id + '_messages', 0, -1).then(function(v) {
         on_finish(v);
      });
    },

    join_convo: function(user_id, conversation_id, on_finish) {
      CHAT_MANAGER.redis_client.LPUSH(conversation_id + '_users', user_id);
      on_finish();

    },

    store_message: function(user_id, conversation_id, message, on_finish) {
      CHAT_MANAGER.redis.LPUSH(conversation_id + '_messages', message).then(function(v) {
        on_finish();
      });
    }
};

module.exports = {chat: CHAT_MANAGER};
