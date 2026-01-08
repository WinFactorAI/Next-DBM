import request from "../common/request";
import Api from "./api";

class BuildManagerLogApi extends Api{
    constructor() {
        super("build-log");
    }

    changeOwner = async (id, owner) => {
        let result = await request.post(`/${this.group}/${id}/change-owner?owner=${owner}`);
        return result['code'] === 1;
    }
}

let buildManagerLogApi = new BuildManagerLogApi();
export default buildManagerLogApi;