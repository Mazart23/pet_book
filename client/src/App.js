import "animate.css";
import "/client/src/static/main.css";
import { ConfigProvider } from "./components/contexts/ConfigContext";
import { TokenProvider } from "./components/contexts/TokenContext";
import { WebsocketProvider } from "./components/contexts/WebsocketContext";
import AppRouter from "./AppRouter";


export default function App() {
  return (
    <ConfigProvider>
      <TokenProvider>
        <WebsocketProvider>
          <AppRouter />
        </WebsocketProvider>
      </TokenProvider>
    </ConfigProvider>
  );
};