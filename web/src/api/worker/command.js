import request from "../../common/request";
import Api from "../api";
class WorkCommandApi extends Api{
    constructor() {
        super("worker/commands");
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

let workCommandApi = new WorkCommandApi();
export default workCommandApi;