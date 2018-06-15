// Import the prerequisites
//var bigNumber = require('bignumber.js');
var bigNumber = require('bn.js')
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
  const userColonyClient = await networkClient.getColonyClient(1);

  // Create a task!
  const specificationHash = await ecp.saveTaskSpecification(HoleInfo);

  // Unique, immutable hash on IPFS
  // .log('Specification hash', specificationHash);

  // Create a task in the root domain
  const { eventData: { taskId }} = await userColonyClient.createTask.send({ specificationHash, domainId: 1 });

  // Let's take a look at the newly created task
  // const task = await userColonyClient.getTask.call({ taskId })
  // console.log(task);

  // const taskInfo = await ecp.getTaskSpecification(task.specificationHash);
  // console.log(taskInfo);

  // Do some cleanup
  // console.log('Task added.')
  await ecp.stop();
}

const getNetworkClient = async (Account) => {

  const wallet = new Wallet(Account.privateKey, provider);
  const adapter = new EthersAdapter({ loader, provider, wallet,});
  // Connect to ColonyNetwork with the adapter!
  const networkClient = new ColonyNetworkClient({ adapter });
  await networkClient.init();
  // For a colony that exists already, you just need its ID:
  const userColonyClient = await networkClient.getColonyClient(1);
  return userColonyClient;
}

exports.getTasks = async () => {
  /*
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
  const userColonyClient = await networkClient.getColonyClient(1);
  */
  const userAccount = await loader.getAccount(0);
  const userColonyClient = await getNetworkClient(userAccount);

  const councilAccount = await loader.getAccount(1);
  const councilColonyClient = await getNetworkClient(councilAccount);

  const count = await userColonyClient.getTaskCount.call();

  // console.log('Number of tasks deployed: ' + count.count);
  var tasks = [];

  if(count.count == 0){
    tasks.push({id: 'noData', location: 'No Holes Spotted', comment: 'Go On Be The First!', subdomain: 0, date: new Date().toLocaleString() })
  }

  await ecp.init();
  // console.log('ecp done');

  const tokenAddress = await userColonyClient.getToken.call();

  var i = 1;
  while(i < count.count + 1){
    var taskHash = await userColonyClient.getTask.call({ taskId:i });
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
    tasks.push({id: i, location: taskInfo.location, comment: taskInfo.comment, subdomain: taskInfo.subdomain, date: taskInfo.date });

    if(i == 2){
    console.log('Task: ' + taskInfo.location);
    console.log('Is Finalized: ' + taskHash.finalized);

    var payout = await userColonyClient.getTaskPayout.call({ taskId: i, role: 'MANAGER', token: tokenAddress.address });
    var roleInfo = await userColonyClient.getTaskRole.call({ taskId: i, role: 'MANAGER' });
    console.log('Manager address: ' + roleInfo.address);
    console.log('Manager rated: ' + roleInfo.rated);
    console.log('Manager rating: ' + roleInfo.rating);
    console.log('Manager Payout: ' + payout.amount);
    payout = await userColonyClient.getTaskPayout.call({ taskId: i, role: 'EVALUATOR', token: tokenAddress.address });
    roleInfo = await userColonyClient.getTaskRole.call({ taskId: i, role: 'EVALUATOR' });
    console.log('EVALUATOR address: ' + roleInfo.address);
    console.log('EVALUATOR rated: ' + roleInfo.rated);
    console.log('EVALUATOR rating: ' + roleInfo.rating);
    console.log('Evaluator Payout: ' + payout.amount);
    payout = await userColonyClient.getTaskPayout.call({ taskId: i, role: 'WORKER', token: tokenAddress.address });
    await userColonyClient.setTaskRoleUser.send({ taskId: i, role: 'WORKER', user: councilAccount.address })
    roleInfo = await userColonyClient.getTaskRole.call({ taskId: i, role: 'WORKER' });
    console.log('WORKER address: ' + roleInfo.address);
    console.log('WORKER rated: ' + roleInfo.rated);
    console.log('WORKER rating: ' + roleInfo.rating);
    console.log('Worker Payout: ' + payout.amount);

    const multiWorker = await userColonyClient.setTaskWorkerPayout.startOperation({ taskId: i, token: tokenAddress.address, amount: new bigNumber(2) });    // Needs Manager and Worker
    console.log('Required singees:')
    console.log(multiWorker.requiredSignees);
    console.log('Missing signees:')
    console.log(multiWorker.missingSignees);
    await multiWorker.sign();

    const json = multiWorker.toJSON();
    const op = await councilColonyClient.setTaskWorkerPayout.restoreOperation(json);
    console.log('Manager Signed - Missing signees:')
    console.log(op.missingSignees);
    await op.sign();
    console.log('Worker Signed - Missing signees:')
    console.log(op.missingSignees);

    console.log('Sending transaction...')
    console.log(op)
    const { successful } = await op.send();
    console.log(successful);

    payout = await userColonyClient.getTaskPayout.call({ taskId: i, role: 'WORKER', token: tokenAddress.address });
    console.log('Worker Payout: ' + payout.amount);

    //https://docs.colony.io/colonyjs/api-colonyclient/#submittaskworkratingsend-taskid-role-ratingsecret--options
    //submitTaskWorkRating.send({ taskId, role, ratingSecret }, options)
    //submitTaskWorkRating.send({ taskId, role, ratingSecret }, options)
    //const response = await councilColonyClient.submitTaskDeliverable.send({ taskId: i, "test" })
    //const response = await councilColonyClient.finalizeTask.send({ taskId: i });

  }

    i++;
  }

  // Do some cleanup
  await ecp.stop();

  return tasks;
};
