import qs from "qs";
import request from "../../common/request";
import Api from "../api";

class WorkAssetApi extends Api{
    constructor() {
        super("worker/assets");
    }

    getTree = async (params) => {
        let paramsStr = qs.stringify(params);
        let result = await request.get(`/${this.group}/tree?${paramsStr}`);
        if (result['code'] !== 1) {
            return {};
        }
        return result['data'];
    }
    tags = async () => {
        let result = await request.get(`/${this.group}/tags`);
        if (result['code'] !== 1) {
            return [];
        }
        return result['data'];
    }
    gateway = async (params) => {
        let result = await request.get(`/${this.group}/${params.id}/gateway`);
        if (result['code'] !== 1) {
            return [];
        }
        return result['data'];
    }

    types = async () => {
        let result = await request.get(`/${this.group}/types`);
        return result['data'];
    }

}

let workAssetApi = new WorkAssetApi();
export default workAssetApi;