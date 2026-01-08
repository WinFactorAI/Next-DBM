import request from "../common/request";
import Api from "./api";

class BuildQueueApi extends Api{
    constructor() {
        super("build-queue");
    }

    changeOwner = async (id, owner) => {
        let result = await request.post(`/${this.group}/${id}/change-owner?owner=${owner}`);
        return result['code'] === 1;
    }
    stop = async (id) => {
        let result = await request.get(`/${this.group}/${id}/stop`);
        return result['code'] === 1;
    }
}

let buildQueueApi = new BuildQueueApi();
export default buildQueueApi;