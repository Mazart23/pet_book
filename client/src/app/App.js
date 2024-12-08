import 'animate.css';
import "/client/src/static/index.css";
import { TokenProvider } from './components/contexts/TokenContext';
import { WebsocketProvider } from "./components/contexts/WebsocketContext";
// import AppRouter from "./AppRouter";


export default function App() {
  return (
    <TokenProvider>
      <WebsocketProvider/>
    </TokenProvider>
  );
};