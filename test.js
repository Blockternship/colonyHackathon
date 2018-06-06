// Import the prerequisites
const { providers, Wallet } = require('ethers');
const { default: EthersAdapter } = require('@colony/colony-js-adapter-ethers');
const { TrufflepigLoader } = require('@colony/colony-js-contract-loader-http');

// Import the ColonyNetworkClient
const { default: ColonyNetworkClient } = require('@colony/colony-js-client');

// Create an instance of the Trufflepig contract loader
const loader = new TrufflepigLoader();

// Create a provider for local TestRPC (Ganache)
const provider = new providers.JsonRpcProvider('http://localhost:8545/');

(async () => {
  // Get the private key from the first account from the Truffle config
  const { privateKey } = await loader.getAccount(0);

  // Create a wallet with the private key (so we have a balance we can use)
  const wallet = new Wallet(privateKey, provider);

  // Create an adapter (powered by ethers)
  const adapter = new EthersAdapter({
    loader,
    provider,
    wallet,
  });

  // Connect to ColonyNetwork with the adapter!
  const networkClient = new ColonyNetworkClient({ adapter });
  await networkClient.init();

  // Create a new Token contract
  const tokenAddress = await networkClient.createToken({
    name: 'CoolonyToken',
    symbol: 'COOL',
  });
  console.log(`CoolonyToken contract address: ${tokenAddress}`);

  // Create a cool Colony!
  const { eventData: { colonyId, colonyAddress } } = await networkClient.createColony.send({
    tokenAddress,
  });

  // Congrats, you've created a Colony!
  console.log(`Colony created with ID: ${colonyId} at address: ${colonyAddress}`);

  // We can now connect to our Colony
  const colonyClient = await networkClient.getColonyClient(colonyId);

  // We can also get an instance of the Meta Colony
  const metaColonyClient = await networkClient.getMetaColonyClient();
})();
