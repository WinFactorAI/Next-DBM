import request from "../../common/request";
import Api from "../api";

class TranslationsApi extends Api{
    constructor() {
        super("worker/translations");
    }
    
    getTrans = async () => {
        let result = await request.get(`/${this.group}/trans`);
        return result['data'];
    }

    getI18n = async (key) => {
        let result = await request.get(`/${this.group}/i18n?key=${key}`);
        return result['data'];
    }

    getLangs = async () => {
        let result = await request.get(`/${this.group}/langs`);
        return result;
    }
    
 
}

let translationsApi = new TranslationsApi();
export default translationsApi;