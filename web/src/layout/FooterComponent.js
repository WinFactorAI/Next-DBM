import { Layout } from "antd";
import { useEffect, useState } from 'react';
import brandingApi from "../api/branding";
import { ND_PACKAGE } from "../utils/utils";

const {Footer} = Layout;

let _package = ND_PACKAGE();

const FooterComponent = () => {

    let [branding, setBranding] = useState({});

    useEffect(() => {
        const x = async () => {
            let branding = await brandingApi.getBranding();
            document.title = branding['name'];
            setBranding(branding);
        }
        x();
    }, []);

    return (
        <Footer style={{textAlign: 'center'}}>
            {branding['copyright']} Version:{branding['version']}
        </Footer>
    );
}

export default FooterComponent;