import request from "../common/request";
import Api from "./api";

class WebhookPushLogApi extends Api{
    constructor() {
        super("webhook-push-logs");
    }

    Clear = async () => {
        const result = await request.post(`/${this.group}/clear`);
        return result['code'] === 1;
    }
}

let webhookPushLogApi = new WebhookPushLogApi();
export default webhookPushLogApi;