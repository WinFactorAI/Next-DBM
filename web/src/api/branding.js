import { infoLog } from "../common/logger";
import request from "../common/request";
class BrandingApi {

    getBranding = async () => {
        let result = await request.get(`/branding`);
        if (result['code'] !== 1) {
            return {};
        }

        infoLog(result['data'].banner+"\n"+"Version "+result['data'].version+"\n"+"Copyright "+result['data'].copyright+"\n"+result['data'].help);
        return result['data'];
    }
    getVersion = async () => {
        let result = await request.get(`/version`);
        if (result['code'] !== 1) {
            return {};
        }
        return result['data'];
    }
}

let brandingApi = new BrandingApi();
export default brandingApi;