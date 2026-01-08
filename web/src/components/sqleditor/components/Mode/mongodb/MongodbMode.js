import { mongoDBKeyWord } from "./mongodb_highlight_rules";

const customCompletions = mongoDBKeyWord.split("|").map(command => {
    return {
      caption: command,
      value: command,
      meta: "关键字"
    };
});
  
export const MongodbCompleter = {
    getCompletions: function(editor, session, pos, prefix, callback) {
        callback(null, customCompletions.filter(function(completion) {
        return completion.caption.startsWith(prefix);
        }));
    }
};

  