import Api from "./api";

class SensitiveCommandGroupMembersApi extends Api{
    constructor() {
        super("sensitive-command-group-members");
    }
}

let sensitiveCommandGroupMembersApi = new SensitiveCommandGroupMembersApi();
export default sensitiveCommandGroupMembersApi;