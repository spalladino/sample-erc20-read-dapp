import React, { Component } from 'react';
import './App.css';
import ERC20 from './components/ERC20';
import ERC20Contract from './contracts/ERC20';
import { getWeb3 } from './eth/network';

const ERC20_ADDRESS = "0x1985365e9f78359a9B6AD760e32412f4a445E862";

class App extends Component {
  state = {
    erc20: null,
    isMainnet: null,
    loading: true
  }

  async componentDidMount() {
    const web3 = getWeb3();
    const networkId = await web3.eth.net.getId();
    const isMainnet = (networkId === 1);
    this.setState({ isMainnet });

    if (isMainnet) {
      const erc20 = await ERC20Contract(getWeb3(), ERC20_ADDRESS);
      this.setState({ erc20 });
    }

    this.setState({ loading: false });
  }

  render() {
    return (
      <div className="App">
        { this.getAppContent() }
      </div>
    );
  }

  getAppContent() {
    const { loading, isMainnet, erc20 } = this.state;

    if (loading) {
      return (<div>Connecting to network...</div>);
    } else if (!isMainnet) {
      return (<div>Please connect to Mainnet</div>);
    } else {
      return (<ERC20 contract={erc20} />);
    }
  }
}

export default App;
