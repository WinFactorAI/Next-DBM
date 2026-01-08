import { redisKeyWord } from "./redis_highlight_rules";

const customCompletions = redisKeyWord.split("|").map(command => {
    return {
      caption: command,
      value: command,
      meta: "指令"
    };
});
  
export const RedisCompleter = {
    getCompletions: function(editor, session, pos, prefix, callback) {
        callback(null, customCompletions.filter(function(completion) {
        return completion.caption.startsWith(prefix);
        }));
    }
};

  