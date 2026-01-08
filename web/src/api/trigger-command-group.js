import request from "../common/request";
import Api from "./api";

class CommandApi extends Api{
    constructor() {
        super("trigger-command-groups");
    }

    GetAll = async () => {
        let result = await request.get(`/${this.group}`);
        if (result['code'] !== 1) {
            return [];
        }
        return result['data'];
    }
    changeOwner = async (id, owner) => {
        let result = await request.post(`/${this.group}/${id}/change-owner?owner=${owner}`);
        return result['code'] === 1;
    }
    importCommand = async (file) => {
        const formData = new FormData();
        formData.append("file", file,);
        let result = await request.post(`/${this.group}/import`, formData, {'Content-Type': 'multipart/form-data'});
        if (result.code !== 1) {
            return [false, result.message];
        }
        return [true, result['data']];
    }
}

let commandApi = new CommandApi();
export default commandApi;