import { createRoot } from 'react-dom/client';
import App from './App';

// import 'semantic-ui-css/semantic.min.css';
// import '../../assets/semantic.min.css';
import 'renderer/index.scss';

const container = document.getElementById('root')!;
const root = createRoot(container);
root.render(<App />);

window.electron.ipcRenderer.sendMessage('ipc-example', 'ping');
