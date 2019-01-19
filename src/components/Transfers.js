import React, { Component } from 'react';
import { getWeb3 } from '../eth/network';
import { getLogId } from '../utils/logs';
import Transfer from './Transfer';
import "./Transfers.css";

export default class Transfers extends Component {
  state = {
    transfers: [],
    eventSub: null,
    loading: true
  };

  async componentDidMount() {
    const { contract } = this.props;
    
    // Load current block and subscribe to transfers starting from the next
    const currentBlock = await getWeb3().eth.getBlockNumber();
    this.subscribe(contract, currentBlock + 1);
    
    // Load all transfers from the past N blocks to seed the list
    const pastEvents = await contract.getPastEvents('Transfer', {
      fromBlock: currentBlock - 1000, 
      toBlock: currentBlock 
    });

    // Load them into state at the end
    this.setState(state => ({
      ...state,
      loading: false,
      transfers: [...state.transfers, ...pastEvents]
    }));
  }

  subscribe(contract, fromBlock) {
    // Subscribe to all new transfer events
    const eventSub = contract.events.Transfer({ fromBlock })
      .on('data', (event) => {
        this.setState(state => ({
          ...state,
          transfers: [{ isNew: true, ...event }, ...state.transfers]
        }));
      })
      .on('changed', (event) => {
        this.setState(state => ({
          ...state,
          transfers: state.transfers.filter(t => 
            t.transactionHash !== event.transactionHash || t.logIndex !== event.logIndex
          )
        }))
      })
      .on('error', (error) => {
        this.setState(state => ({
          ...state,
          error
        }))
      });

    // Save the subscription in state so we can later unsubscribe
    this.setState({ eventSub });
  }

  componentWillUnmount() {
    // Unsubscribe from the event upon unmount
    const { eventSub } = this.state;
    if (eventSub) eventSub.unsubscribe();
  }

  render() {
    const { error, loading, transfers } = this.state;
    const { decimals, symbol } = this.props;

    if (loading) return "Loading...";
    if (error) return "Error retrieving transfers";
    
    return (<div className="Transfers">
      { transfers.map(transfer => (
        <Transfer 
          key={getLogId(transfer)} 
          transfer={transfer} 
          decimals={decimals}
          symbol={symbol}
          isNew={transfer.isNew} />
      )) }
    </div>)
  }
}