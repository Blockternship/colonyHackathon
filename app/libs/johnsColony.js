// Import the prerequisites
const ecp = require('./ecp');
const { providers, Wallet } = require('ethers');
const { default: EthersAdapter } = require('@colony/colony-js-adapter-ethers');
const { TrufflepigLoader } = require('@colony/colony-js-contract-loader-http');


// Import the ColonyNetworkClient
const { default: ColonyNetworkClient } = require('@colony/colony-js-client');

// Create an instance of the Trufflepig contract loader
const loader = new TrufflepigLoader();

// Create a provider for local TestRPC (Ganache)
const provider = new providers.JsonRpcProvider('http://localhost:8545/');

const cTasks = require('../libs/cTasks');

exports.startColony = async () => {
  // Get the private key from the first account from the ganache-accounts
  // through trufflepig
  const { privateKey } = await loader.getAccount(0);

  // Create a wallet with the private key (so we have a balance we can use)
  const wallet = new Wallet(privateKey, provider);

  // Create an adapter (powered by ethers)
  const adapter = new EthersAdapter({ loader, provider, wallet,});

  // Connect to ColonyNetwork with the adapter!
  const networkClient = new ColonyNetworkClient({ adapter });
  await networkClient.init();
  const count = await networkClient.getColonyCount.call();

  console.log('Number of colonies deployed: ' + count.count);

  if(count.count > 0){
    console.log('Default colony is launched.')
    const colonyInfo = await networkClient.getColony.call({ id:1 });

    console.log('Adding example task 1.')
    await cTasks.createTask('Pothole On Main St', 'Big FO Pothole In Main Street', 1);
    console.log('Adding example task 2.')
    await cTasks.createTask('No Linecard', 'Sergey is an arse', 2)
    console.log('Done loading')

    return {id: 1, name: 'Default Colony', address: colonyInfo.address, notes: []}
  }
  else{
    console.log('Need to create default colony.');

    const tokenAddress = await networkClient.createToken({
      name: 'Get It Done!',
      symbol: 'GID',
    });

    // Create a cool Colony!
    const {
      eventData: { colonyId, colonyAddress },
    } = await networkClient.createColony.send({ tokenAddress });

    // Congrats, you've created a Colony!
    console.log('Token address: ' + tokenAddress);
    console.log('Colony ID: ' + colonyId);
    console.log('Colony address: ' + colonyAddress);
    console.log('Adding example task 1.')
    await cTasks.createTask('Pothole On Main St', 'Big FO Pothole In Main Street', 1);
    console.log('Adding example task 2.')
    await cTasks.createTask('No Linecard', 'Sergey is an arse', 2)
    console.log('Done loading')

    return [{id: 1, name: 'Default Colony', address: colonyAddress, notes: []}];
  }
}
