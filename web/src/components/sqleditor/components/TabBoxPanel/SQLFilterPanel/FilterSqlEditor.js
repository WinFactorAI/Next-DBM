import { SortAscendingOutlined, ZoomInOutlined } from '@ant-design/icons';
import React, { useContext } from "react";
import { VisibilityContext } from '../../../components/Utils/visibilityProvider';

import SQLFilterPanelOrderBy from './SQLFilterPanelOrderBy';
import SQLFilterPanelWhere from './SQLFilterPanelWhere';
  
function FilterSqlEditor({currentTab}) {
  const {tabs,tabIndex} = useContext(VisibilityContext);
  
  return (
    <div  className="aceEditor-box w-full bg-gray-200 SQLFilterPanel-FilterSqlEditor">
      <div  className="filterSqlEditor-left">
        <div className="icon"><ZoomInOutlined /></div>
        <div className="text">WHERE</div>
        <div className="input">
          <SQLFilterPanelWhere currentTab={currentTab}/>
        </div>
      </div>
      <div className='filterSqlEditor-right'>
        <div className="icon"><SortAscendingOutlined /></div>
        <div className="text">ORDER BY</div>
        <div className="input">
          <SQLFilterPanelOrderBy currentTab={currentTab}/>
        </div>
      </div>
    </div>
  );
}

export default FilterSqlEditor;
