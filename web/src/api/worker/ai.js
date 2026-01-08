import request from "../../common/request";
import Api from "../api";

class AiApi extends Api {
    constructor() {
        super("worker/ai");
    }
    
    ask = async (data) => {
        let result = await request.put(`/${this.group}/ask`,data);
        if (result['code'] !== 1) {
            return [];
        }
        return result['data'];
    }
}
const aiApi = new AiApi();
export default aiApi;