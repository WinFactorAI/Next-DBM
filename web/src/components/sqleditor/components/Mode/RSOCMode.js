// Desc: Custom Ace mode for RSOC language
export class CustomHighlightRules extends window.ace.acequire("ace/mode/text_highlight_rules").TextHighlightRules {
	constructor() {
		super();
		this.$rules = {
			"start" : [
                        {
                            token : "comment",
                            regex : /^~.*$/
                        },
                        {
                            token : "variable",
                            regex : /:.*$/
                        },
                        {
                            token : "keyword",
                            regex : /(?:set|add|show|ifg)\b/,
                            caseInsensitive: true
                        },
                        {
                            token : "constant.numeric",
                            regex : /[0-9]+\b/,
                        }
                ]
		};
	}
}

export default class RSOCMode extends window.ace.acequire('ace/mode/text').Mode {
	constructor() {
		super();
		this.HighlightRules = CustomHighlightRules;
	}
}