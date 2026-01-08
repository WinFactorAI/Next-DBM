// Fake MongoDB highlight rules for Ace Editor

export const mongoDBKeyWord = "db|use|show|show\s+dbs|show\s+collections|find|findOne|insert|update|remove|count|aggregate|create\s+index|ensureIndex|drop\s+index|drop\s+indexes|drop\s+index\s+if\s+exists|distinct";

export class CustomHighlightRules extends window.ace.acequire("ace/mode/text_highlight_rules").TextHighlightRules {
	constructor() {
		super();
        this.$rules = {
            "start": [
                // Commands
                {
                    token: "keyword",
                    regex: "\\b("+mongoDBKeyWord+")\\b"
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

export default class MongodbMode extends window.ace.acequire('ace/mode/text').Mode {
	constructor() {
		super();
		this.HighlightRules = CustomHighlightRules;
	}
}