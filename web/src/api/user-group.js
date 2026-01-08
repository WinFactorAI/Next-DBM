import request from "../common/request";
import Api from "./api";

class UserGroupApi extends Api {
    constructor() {
        super("user-groups");
    }

    GetAll = async () => {
        let result = await request.get(`/${this.group}`);
        if (result['code'] !== 1) {
            return [];
        }
        return result['data'];
    }
    changeStatus = async (id, status) => {
        let result = await request.patch(`/${this.group}/${id}/status?status=${status}`);
        return result['code'] !== 1;
    }
}

const userGroupApi = new UserGroupApi();
export default userGroupApi;