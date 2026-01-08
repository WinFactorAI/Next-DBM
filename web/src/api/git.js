import request from "../common/request";
import Api from "./api";

class GitApi extends Api{
    constructor() {
        super("git");
    }

    changeOwner = async (id, owner) => {
        let result = await request.post(`/${this.group}/${id}/change-owner?owner=${owner}`);
        return result['code'] === 1;
    }

    allBranches = async (id) => {
        let result = await request.get(`/${this.group}/${id}/all-branches`);
        return result['data'];
    }
    
    allBranchesHistory = async (id) => {
        let result = await request.get(`/${this.group}/${id}/all-branches-history`);
        return result['data'];
    }
    branchHistory = async (id,branch) => {
        let result = await request.post(`/${this.group}/${id}/branch-history?branch=${branch}`);
        return result['data'];
    }

    commitFiles = async (id,commit) => {
        let result = await request.get(`/${this.group}/${id}/${commit}/files`);
        return result['data'];
    }
    commitDiffFile = async (id,commit,fileName) => {
        let result = await request.post(`/${this.group}/${id}/${commit}/ddf-file`,fileName);
        return result['data'];
    }

    makeTag = async (params) =>{
        let result = await request.post(`/${this.group}/${params.id}/make-tag`,params);
        return result['data'];
    }
    recover = async (params) =>{
        let result = await request.post(`/${this.group}/${params.id}/recover`,params);
        return result;
    }
    check = async () =>{
        let result = await request.get(`/${this.group}/check`);
        return result;
    }
}

let gitApi = new GitApi();
export default gitApi;