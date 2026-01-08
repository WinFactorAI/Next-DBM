import { Toaster } from "react-hot-toast";
import 'react-tabs/style/react-tabs.css';
import MainPanel from "./components/MainPanel";
import MenuPanel from "./components/MenuPanel";
import { VisibilityProvider } from "./components/Utils/visibilityProvider";

function App() {
  // 监听编辑器容器的contextmenu事件
  const editorContainer = document.getElementById('container');
  editorContainer?.addEventListener('contextmenu', event => {
    // 允许Monaco Editor处理其内部的contextmenu事件
    event.stopPropagation();
  });
  document.addEventListener('contextmenu', event => {
    event.preventDefault();
  });
  
  return (
    <div className="flex flex-wrap justify-center items-start w-full">
      <VisibilityProvider>
        <MenuPanel />
        <MainPanel/>
      </VisibilityProvider>
      <Toaster position="top-right" gutter={8} toastOptions={{  duration: 3000, }} />  
    </div>
  );
}

export default App;
