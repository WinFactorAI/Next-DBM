import request from "../common/request";
import Api from "./api";

class SqlLogApi extends Api{
    constructor() {
        super("sql-logs");
    }

    Clear = async () => {
        const result = await request.post(`/${this.group}/clear`);
        return result['code'] === 1;
    }
}

let sqlLogApi = new SqlLogApi();
export default sqlLogApi;