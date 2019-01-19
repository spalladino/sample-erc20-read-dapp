import Web3 from 'web3';

let web3;

export function getWeb3() {
  if (!web3) {
    web3 = new Web3(Web3.givenProvider || process.env.REACT_APP_PROVIDER_URL);
  }
  return web3;
}

export async function getAccount() {
  const accounts = await window.ethereum.enable();
  return accounts[0];
}