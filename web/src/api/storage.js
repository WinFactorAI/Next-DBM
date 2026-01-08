import request from "../common/request";
import Api from "./api";

class StorageApi extends Api{
    constructor() {
        super("storages");
    }
 
    rm = async (id,file) => {
        let result = await request.post(`/${this.group}/${id}/rm?file=${file}`);
        return result['code'] !== 1;
    }
}

let storageApi = new StorageApi();
export default storageApi;