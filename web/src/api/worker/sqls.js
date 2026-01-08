import request from "../../common/request";
import Api from "../api";

class SqlsApi extends Api{
    constructor() {
        super("worker/sqls");
    }

    getId = async () => {
        let result = await request.get(`/${this.group}/getId`);
        return result['data'];
    }   
    createOrUpdate = async (data) => {
        let result = await request.post(`/${this.group}/createOrUpdate`,data);
        return result['code'] === 1;
    }
    changeOwner = async (id, owner) => {
        let result = await request.post(`/${this.group}/${id}/change-owner?owner=${owner}`);
        return result['code'] === 1;
    }
}

let sqlsApi = new SqlsApi();
export default sqlsApi;