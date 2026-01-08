import Api from "./api";

class TriggerCommandGroupMembersApi extends Api{
    constructor() {
        super("trigger-command-group-members");
    }
}

let triggerCommandGroupMembersApi = new TriggerCommandGroupMembersApi();
export default triggerCommandGroupMembersApi;