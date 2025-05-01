import Inventory from "../components/Inventory/Inventory";
import "./Inventory.css";

const InventoryPage = () => {
  return (
    <div className="inventory-page">
      <div className="inventory-content">
        <Inventory />
      </div>
    </div>
  );
};

export default InventoryPage;
