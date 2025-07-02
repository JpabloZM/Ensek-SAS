import Inventory from "../components/Inventory/Inventory";
import { useOutletContext } from "react-router-dom";

const InventoryPage = () => {
  // Obtenemos el estado del modo oscuro del contexto de AdminLayout
  const { darkMode } = useOutletContext() || { darkMode: false };

  return <Inventory darkMode={darkMode} />;
};

export default InventoryPage;
