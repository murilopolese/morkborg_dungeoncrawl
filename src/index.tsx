import ReactDOM from 'react-dom/client';
import Frame from './components/common/Frame';
// import Header from './components/header/Header'; // a tiny wrapper that uses TextNode
import InventoryItem from './components/inventory/InventoryItem';
import TextNode from './components/text/TextNode';
import Inventory from './components/inventory/Inventory';
import ActionPanel from './components/action/ActionPanel';
import Button from './components/button/Button';
import './styles/global.scss';

const root = ReactDOM.createRoot(document.getElementById('app')!);
console.log('yo')

root.render(
  <Frame direction="column" style={{ minHeight: '100vh', paddingBlock: '10px' }}>
    {/* Header */}
    <TextNode>The Slaughter Fort</TextNode>
    {/* <Header title="The Slaughter Fort" /> */}

    {/* Images section – just two coloured boxes in the original design */}
    <Frame className="images" direction="row" gap="10px" style={{ marginBottom: 20 }}>
      <div style={{ width: 80, height: 51, background: '#fff' }} />
      <div style={{ width: 80, height: 51, background: '#fee100' }} />
    </Frame>

    {/* Names */}
    <Frame className="names" direction="row" gap="10px" style={{ marginBottom: 20 }}>
      <TextNode>Vagal Grin</TextNode>
      <div style={{ flexGrow: 1 }} /> {/* spacer */}
      <TextNode>Hargha, the Scum</TextNode>
    </Frame>

    {/* Action panel (HP + status) */}
    <ActionPanel hp={15} maxHp={30} status={['poison', 'freeze']} />

    {/* Equipped area */}
    <Frame className="equipped" direction="row" gap="10px">
      <InventoryItem id="1" name="WEAPON" type="weapon" />
      <InventoryItem id="2" name="SWORD" type="weapon" />
      <InventoryItem id="3" name="SHIELD" type="shield" />
      <InventoryItem id="4" name="WOODEN" type="shield" />
      <InventoryItem id="5" name="ARMOR" type="armor" />
      <InventoryItem id="6" name="(2/2)" type="armor" />
    </Frame>

    {/* Bottom – fight button */}
    <Button onClick={() => alert('Fight!')}>FIGHT</Button>

    {/* Inventory list */}
    <Inventory
      items={[
        { id: 'e1', name: 'LIFE ELIXIR', type: 'elixir', quantity: 10 },
        { id: 'e2', name: 'WOODEN SHIELD', type: 'shield' },
        { id: 'e3', name: 'WOODEN SHIELD', type: 'shield' },
        { id: 'e4', name: 'ARMOR', type: 'armor', quantity: 0 },
      ]}
    />
  </Frame>
);
