import request from "../common/request";
import Api from "./api";

class WebhookApi extends Api {
    constructor() {
        super("webhooks");
    }

    changeOwner = async (id, owner) => {
        let result = await request.post(`/${this.group}/${id}/change-owner?owner=${owner}`);
        return result['code'] === 1;
    }
    importCommand = async (file) => {
        const formData = new FormData();
        formData.append("file", file,);
        let result = await request.post(`/${this.group}/import`, formData, { 'Content-Type': 'multipart/form-data' });
        if (result.code !== 1) {
            return [false, result.message];
        }
        return [true, result['data']];
    }
    changeStatus = async (id, status) => {
        let result = await request.patch(`/${this.group}/${id}/status?status=${status}`);
        return result['code'] !== 1;
    }
    sendTest = async (data) => {
        let result = await request.post(`/${this.group}/test`, data);
        return result['code'] === 1;
    }
}

let webhookApi = new WebhookApi();
export default webhookApi;