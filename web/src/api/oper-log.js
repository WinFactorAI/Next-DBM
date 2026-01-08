import request from "../common/request";
import Api from "./api";

class OperLogApi extends Api{
    constructor() {
        super("oper-logs");
    }

    Clear = async () => {
        const result = await request.post(`/${this.group}/clear`);
        return result['code'] === 1;
    }
}

let operLogApi = new OperLogApi();
export default operLogApi;