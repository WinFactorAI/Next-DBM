import '@arco-design/web-react/dist/css/arco.css';
import { useContext } from 'react';
import { VisibilityContext } from '../../Utils/visibilityProvider';
// 设计器面板
function ErPanel({tab}) {
  const {tabIndex, getTabByID } = useContext(VisibilityContext);
  return (
     <>
       <br/>请购买商业版本使用本模块 
       <br/><a href="https://license.aiputing.com/#/pricing">https://license.aiputing.com/#/pricing</a>
     </>
  );
}

export default ErPanel;