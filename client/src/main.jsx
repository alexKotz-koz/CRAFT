import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { store } from "./store";

import App from "./components/App";
/*import axios from "axios";
window.axios = axios;*/

const el = document.getElementById("root");
const root = ReactDOM.createRoot(el);

root.render(
  <Provider store={store}>
    <App />
  </Provider>
);
