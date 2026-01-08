// redis_highlight_rules.js
// 

export const redisKeyWord = "GET|SET|DEL|INCR|DECR|EXISTS|EXPIRE|PEXPIRE|SETNX|FLUSHDB|FLUSHALL|KEYS|INFO|PING|QUIT|SELECT|BGSAVE|BGREWRITEAOF|SAVE|RESTORE|MSET|MGET|HGET|HSET|HMGET|HMSET|HGETALL|HDEL|HEXISTS|HKEYS|HVALS|LINDEX|LINSERT|LLEN|LPOP|LPUSH|LRANGE|LREM|LSET|LTRIM|BLPOP|BRPOP|BRPOPLPUSH|RPOP|RPUSH|RPUSHX|SADD|SCARD|SDIFF|SDIFFSTORE|SINTER|SINTERSTORE|SISMEMBER|SMEMBERS|SPOP|SRANDMEMBER|SREM|SUNION|SUNIONSTORE|ZADD|ZCARD|ZCOUNT|ZINCRBY|ZINTERSTORE|ZRANGE|ZRANGEBYSCORE|ZRANK|ZREM|ZREMRANGEBYRANK|ZREMRANGEBYSCORE|ZREVRANGE|ZREVRANGEBYSCORE|ZREVRANK|ZSCORE|ZUNIONSTORE";

export class CustomHighlightRules extends window.ace.acequire("ace/mode/text_highlight_rules").TextHighlightRules {
	constructor() {
		super();
        this.$rules = {
            "start": [
                // Commands
                {
                    token: "keyword",
                    regex: "\\b("+ redisKeyWord +")\\b"
                },
                // Comments
                {
                    token: "comment",
                    regex: "#.*"
                },
                // Strings
                {
                    token: "string",
                    regex: "'.*?'"
                },
                {
                    token: "string",
                    regex: '".*?"'
                },
                // Numbers
                {
                    token: "constant.numeric",
                    regex: "\\b\\d+\\b"
                },
                // Variables
                {
                    token: "variable",
                    regex: "\\$\\w+"
                },
                // Operators
                {
                    token: "punctuation.operator",
                    regex: /[=<>!~?:&|+\-*\/\^%]+/
                },
                // Parentheses
                {
                    token: "paren.lparen",
                    regex: "[[({]"
                },
                {
                    token: "paren.rparen",
                    regex: "[\\])}]"
                },
                // Whitespace
                {
                    token: "text",
                    regex: "\\s+"
                }
            ]
        };
	}
}

export default class RedisMode extends window.ace.acequire('ace/mode/text').Mode {
	constructor() {
		super();
		this.HighlightRules = CustomHighlightRules;
	}
}