import request from "../common/request";
import Api from "./api";

class WebhookServicesRefApi extends Api {
    constructor() {
        super("webhook-services-ref");
    }

    changeOwner = async (id, owner) => {
        let result = await request.post(`/${this.group}/${id}/change-owner?owner=${owner}`);
        return result['code'] === 1;
    }

    changeStatus = async (id, status) => {
        let result = await request.patch(`/${this.group}/${id}/status?status=${status}`);
        return result['code'] !== 1;
    }
   
}

let webhookServicesRefApi = new WebhookServicesRefApi();
export default webhookServicesRefApi;