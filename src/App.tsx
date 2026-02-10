import { MenuBarWindow } from './components/MenuBarWindow';
import './styles/App.css';

/**
 * Root application component.
 * Simply renders the MenuBarWindow component which contains all the app logic.
 */
import { Toaster } from "@/components/ui/toaster";

function App() {
  return (
    <>
      <MenuBarWindow />
      <Toaster />
    </>
  );
}

export default App;
