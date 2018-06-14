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

exports.recordHole = async (HoleInfo) => {

  await ecp.init();
  // console.log('ecp initialised');
  // Get the private key from the first account from the ganache-accounts
  // through trufflepig
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

  // For a colony that exists already, you just need its ID:
  const colonyClient = await networkClient.getColonyClient(1);

  // Create a task!
  const specificationHash = await ecp.saveTaskSpecification(HoleInfo);

  // Unique, immutable hash on IPFS
  // .log('Specification hash', specificationHash);

  // Create a task in the root domain
  const { eventData: { taskId }} = await colonyClient.createTask.send({ specificationHash, domainId: 1 });

  // Let's take a look at the newly created task
  // const task = await colonyClient.getTask.call({ taskId })
  // console.log(task);

  // const taskInfo = await ecp.getTaskSpecification(task.specificationHash);
  // console.log(taskInfo);

  // Do some cleanup
  // console.log('Task added.')
  await ecp.stop();
}

exports.getTasks = async () => {
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

  // For a colony that exists already, you just need its ID:
  const colonyClient = await networkClient.getColonyClient(1);

  const count = await colonyClient.getTaskCount.call();

  // console.log('Number of tasks deployed: ' + count.count);
  var tasks = [];

  if(count.count == 0){
    tasks.push({id: 'noData', location: 'No Holes Spotted', comment: 'Go On Be The First!', subdomain: 0, date: new Date().toLocaleString() })
  }

  await ecp.init();
  // console.log('ecp done');

  var i = 1;
  while(i < count.count + 1){
    var taskHash = await colonyClient.getTask.call({ taskId:i });
    // console.log('Task: ' + i)
    // console.log('Hash: ' + taskHash.specificationHash)
    // console.log('domainId: ' + taskHash.domainId)
    if(taskHash.specificationHash == null){
      // console.log('Weird science...')
      i++;
      continue;
    }

    var taskInfo = await ecp.getTaskSpecification(taskHash.specificationHash);
    // console.log(taskInfo);
    tasks.push({id: i, location: taskInfo.location, comment: taskInfo.comment, subdomain: taskInfo.subdomain, date: taskInfo.date })
    i++;
  }

  // Do some cleanup
  await ecp.stop();

  return tasks;
};
