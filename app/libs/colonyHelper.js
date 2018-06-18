import uuid from 'uuid';
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

exports.getAccountInfo = async (AccountNo) => {                                                                     // Returns account info for ganache account no
  const account = await loader.getAccount(AccountNo);
  return account;
}

const getNetworkClient = async (Account) => {

  // Create an instance of the Trufflepig contract loader
  const loader = new TrufflepigLoader();

  // Create a provider for local TestRPC (Ganache)
  const provider = new providers.JsonRpcProvider('http://localhost:8545/');

  const wallet = new Wallet(Account.privateKey, provider);
  const adapter = new EthersAdapter({ loader, provider, wallet,});
  // Connect to ColonyNetwork with the adapter!
  const networkClient = new ColonyNetworkClient({ adapter });
  await networkClient.init();
  // For a colony that exists already, you just need its ID:
  const colonyClient = await networkClient.getColonyClient(1);
  return colonyClient;
}

exports.recordHole = async (UserAddress, CompanyAddress, HoleInfo) => {                                                                                   // Saves a task to IPFS & Colony

  await ecp.init();

  const userColonyClient = await getNetworkClient(UserAddress);                                                                                           // Need separate clients for multi-sig
  const councilColonyClient = await getNetworkClient(CompanyAddress);

  const specificationHash = await ecp.saveTaskSpecification(HoleInfo);                                                                                    // Save Hole info to IPFS & get hash

  const { eventData: { taskId }} = await userColonyClient.createTask.send({ specificationHash, domainId: 1 });                                            // Create a task in the root domain

  const councilAccount = await loader.getAccount(1);
  await userColonyClient.setTaskRoleUser.send({ taskId: taskId, role: 'WORKER', user: councilAccount.address })                                           // Makes 'Company' the WORKER by default as they are responsible

  /*
  THE FOLLOWING WOULD SET THE PAYOUT USING MULTISIG BUT IS FAILING
  Throws error - throws: Uncaught (in promise) Error: VM Exception while processing transaction: revert
  Tried setting to ADMIN and also update to latest versions as suggested on Gitter but still not working.

  const tokenAddress = await userColonyClient.getToken.call();
  const multiWorker = await userColonyClient.setTaskWorkerPayout.startOperation({ taskId: taskId, source: tokenAddress.address, amount: new bigNumber(1) });    // Needs Manager and Worker

  await multiWorker.sign();

  const json = multiWorker.toJSON();
  const op = await councilColonyClient.setTaskWorkerPayout.restoreOperation(json);

  await op.sign();
  console.log('Should be Signed - Missing signees:')
  console.log(op.missingSignees);
  const { successful } = await op.send();      // Not working for some reason??
  console.log(successful);
  */

  await ecp.stop();
}

exports.getTasks = async () => {                                                                                                                    // Gets the existing holes/tasks stored on Colony

  const userAccount = await loader.getAccount(0);
  const userColonyClient = await getNetworkClient(userAccount);

  const count = await userColonyClient.getTaskCount.call();                                                                                         // Get number of tasks deployed
  // console.log('Number of tasks deployed: ' + count.count);

  var holes = [];

  if(count.count == 0){
    holes.push({id: uuid.v4(), manager: 'No Recorded Holes', location: {lat: 0, lng: 0}, comment: 'Go On Be The First!', subdomain: 0, date: new Date().toLocaleString() })
  }

  await ecp.init();

  var i = 1;
  while(i < count.count + 1){                                                                                                                         // Gets each task and pushes to array for GUI use
    var taskHash = await userColonyClient.getTask.call({ taskId:i });                                                                                 // Gets Task hash

    if(taskHash.specificationHash == null){
      // console.log('Weird science...')
      i++;
      continue;
    }

    var taskInfo = await ecp.getTaskSpecification(taskHash.specificationHash);                                                                          // Get IPFS data
    var roleInfo = await userColonyClient.getTaskRole.call({ taskId: i, role: 'MANAGER' });                                                             // This is the account that recorded hole

    holes.push({id: i, location: taskInfo.location, comment: taskInfo.comment, subdomain: taskInfo.subdomain, date: taskInfo.date, manager: roleInfo.address });
    i++;
  }

  await ecp.stop();
  return holes;
};

exports.updateTask = async (TaskId, HoleInfo) => {                                                                                    // Updates Hole state/info onto Colony and IPFS

  const userAccount = await loader.getAccount(0);
  const userColonyClient = await getNetworkClient(userAccount);

  const councilAccount = await loader.getAccount(1);
  const councilColonyClient = await getNetworkClient(councilAccount);

  const tokenAddress = await userColonyClient.getToken.call();

  await ecp.init();
  /*
  This should update a Hole info on IPFS then save new specHash onto Colony for the task.
  Having issues similar to above -
  Throws error - throws: Uncaught (in promise) Error: VM Exception while processing transaction: revert
  Tried setting to ADMIN and also update to latest versions as suggested on Gitter but still not working.

  const specificationHash = await ecp.saveTaskSpecification(HoleInfo);                                                                    // Saves new hole info to IPFS and gets new hash

  const multiWorker = await userColonyClient.setTaskBrief.startOperation({ taskId: TaskId, specificationHash: specificationHash })        // Updates task hash on Colony with new info hash
  await multiWorker.sign();

  const json = multiWorker.toJSON();
  const op = await councilColonyClient.setTaskBrief.restoreOperation(json);
  await op.sign();
  console.log('Update Brief Should be Signed - Missing signees:')
  console.log(op.missingSignees);

  const { successful } = await op.send();                                                                                                 // Not working for some reason??
  console.log(successful);

  if(HoleInfo.isRepaired){
    const response = await councilColonyClient.submitTaskDeliverable.send({ taskId: TaskId, deliverableHash: specificationHash });          // If the Hole is marked repaired by Company the task is delivered
  }
  if(HoleInfo.isConfirmed){
    const response = await councilColonyClient.finalizeTask.send({ taskId: TaskId });                                                       // Once work is confirmed by Evaluator the task is finalised
  }
  */
  await ecp.stop();
};
