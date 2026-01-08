import request from "../common/request";
import Api from "./api";

class BuildTriggerApi extends Api{
    constructor() {
        super("build-trigger");
    }

    changeOwner = async (id, owner) => {
        let result = await request.post(`/${this.group}/${id}/change-owner?owner=${owner}`);
        return result['code'] === 1;
    }
    stop = async (id) => {
        let result = await request.get(`/${this.group}/${id}/stop`);
        return result['code'] === 1;
    }
    getHost = async () => {
        let result = await request.get(`/${this.group}/host`);
        return result['data'];
    }
    getSecreToken = async () => {
        let result = await request.get(`/${this.group}/secre-token`);
        return result['data'];
    }
}

let buildTriggerApi = new BuildTriggerApi();
export default buildTriggerApi;