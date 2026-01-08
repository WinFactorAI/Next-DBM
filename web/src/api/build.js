import request from "../common/request";
import Api from "./api";

class BuildApi extends Api{
    constructor() {
        super("build");
    }

    changeOwner = async (id, owner) => {
        let result = await request.post(`/${this.group}/${id}/change-owner?owner=${owner}`);
        return result['code'] === 1;
    }

    start = async (id) => {
        let result = await request.get(`/${this.group}/${id}/start`);
        return result['code'] === 1;
    }
}

let buildApi = new BuildApi();
export default buildApi;