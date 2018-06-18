// Import the prerequisites
//var bigNumber = require('bignumber.js');
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

exports.getAddress = async (AddressNo) => {
  const account = await loader.getAccount(AddressNo);
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
  const userColonyClient = await networkClient.getColonyClient(1);
  return userColonyClient;
}

exports.recordHole = async (UserAddress, CompanyAddress, HoleInfo) => {

  await ecp.init();

  const userColonyClient = await getNetworkClient(UserAddress);
  const councilColonyClient = await getNetworkClient(CompanyAddress);
  console.log('3')

  const specificationHash = await ecp.saveTaskSpecification(HoleInfo);          // Create a task!

  console.log('4')
  const { eventData: { taskId }} = await userColonyClient.createTask.send({ specificationHash, domainId: 1 });  // Create a task in the root domain
  console.log('5')

  const councilAccount = await loader.getAccount(1);
  await userColonyClient.setTaskRoleUser.send({ taskId: taskId, role: 'WORKER', user: councilAccount.address })

  /*
  console.log('6')
  const tokenAddress = await userColonyClient.getToken.call();
  console.log('7')
  const multiWorker = await userColonyClient.setTaskWorkerPayout.startOperation({ taskId: taskId, source: tokenAddress.address, amount: new bigNumber(1) });    // Needs Manager and Worker
  console.log('8')
  await multiWorker.sign();
  console.log('9')
  const json = multiWorker.toJSON();
  console.log('10')
  const op = await councilColonyClient.setTaskWorkerPayout.restoreOperation(json);
  console.log('11')
  await op.sign();
  console.log('Should be Signed - Missing signees:')
  console.log(op.missingSignees);
  */
  await ecp.stop();
}

exports.getTasks = async () => {

  const userAccount = await loader.getAccount(0);
  const userColonyClient = await getNetworkClient(userAccount);

  const userAccount1 = await loader.getAccount(1);
  // const userAccount2 = await loader.getAccount(2);
  // const userAccoun3 = await loader.getAccount(3);

  await userColonyClient.authority.setUserRole.send({ user: userAccount1.address, role: 'ADMIN' });
  //await userColonyClient.authority.setUserRole.send({ user: userAccount3.address, role: 'ADMIN' });

  const count = await userColonyClient.getTaskCount.call();
  // console.log('Number of tasks deployed: ' + count.count);

  var tasks = [];

  if(count.count == 0){
    tasks.push({id: uuid.v4(), location: {lat: 'No Holes Spotted', lng:''}, comment: 'Go On Be The First!', subdomain: 0, date: new Date().toLocaleString() })
  }

  await ecp.init();

  var i = 1;
  while(i < count.count + 1){
    var taskHash = await userColonyClient.getTask.call({ taskId:i });
    console.log('getTasks() DEBUG')
    console.log('ID: ' + i)
    console.log(taskHash.specificationHash)

    if(taskHash.specificationHash == null){
      // console.log('Weird science...')
      i++;
      continue;
    }

    var taskInfo = await ecp.getTaskSpecification(taskHash.specificationHash);
    var roleInfo = await userColonyClient.getTaskRole.call({ taskId: i, role: 'MANAGER' });

    tasks.push({id: i, location: taskInfo.location, comment: taskInfo.comment, subdomain: taskInfo.subdomain, date: taskInfo.date, manager: roleInfo.address });
    i++;
  }

  await ecp.stop();
  return tasks;
};

exports.updateTask = async (TaskId, HoleInfo) => {

  const userAccount = await loader.getAccount(0);
  const userColonyClient = await getNetworkClient(userAccount);

  const councilAccount = await loader.getAccount(1);
  const councilColonyClient = await getNetworkClient(councilAccount);

  const tokenAddress = await userColonyClient.getToken.call();

  await ecp.init();

  console.log('Update DEBUG')
  console.log(TaskId)
  console.log(HoleInfo)

  const specificationHash = await ecp.saveTaskSpecification(HoleInfo);
  console.log(specificationHash)
  /*
  const multiWorker = await userColonyClient.setTaskBrief.startOperation({ taskId: TaskId, specificationHash: specificationHash })
  await multiWorker.sign();

  const json = multiWorker.toJSON();
  const op = await councilColonyClient.setTaskBrief.restoreOperation(json);
  await op.sign();
  console.log('Update Brief Should be Signed - Missing signees:')
  console.log(op.missingSignees);
  */

  //const { successful } = await op.send();      // Not working for some reason??
  //console.log(successful);

  //https://docs.colony.io/colonyjs/api-colonyclient/#submittaskworkratingsend-taskid-role-ratingsecret--options
  //submitTaskWorkRating.send({ taskId, role, ratingSecret }, options)
  //submitTaskWorkRating.send({ taskId, role, ratingSecret }, options)
  /*
  Below throws error: Uncaught (in promise) Error: VM Exception while processing transaction: revert
  if(HoleInfo.isRepaired){
    const response = await councilColonyClient.submitTaskDeliverable.send({ taskId: TaskId, deliverableHash: specificationHash });
  }
  if(HoleInfo.isConfirmed){
    const response = await councilColonyClient.finalizeTask.send({ taskId: TaskId });
  }
  */
  await ecp.stop();
};

exports.getTasksOLD = async () => {   // DELETE WHEN DONE

  const userAccount = await loader.getAccount(0);
  const userColonyClient = await getNetworkClient(userAccount);

  const councilAccount = await loader.getAccount(1);
  const councilColonyClient = await getNetworkClient(councilAccount);

  const count = await userColonyClient.getTaskCount.call();

  // console.log('Number of tasks deployed: ' + count.count);
  var tasks = [];

  if(count.count == 0){
    tasks.push({id: uuid.v4(), location: {lat: 'No Holes Spotted', lng:''}, comment: 'Go On Be The First!', subdomain: 0, date: new Date().toLocaleString() })
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
    var roleInfo = await userColonyClient.getTaskRole.call({ taskId: i, role: 'MANAGER' });

    tasks.push({id: i, location: taskInfo.location, comment: taskInfo.comment, subdomain: taskInfo.subdomain, date: taskInfo.date, manager: roleInfo.address });

    if(i == 2){
    console.log('Task: ' + taskInfo.location);
    console.log('Is Finalized: ' + taskHash.finalized);

    var payout = await userColonyClient.getTaskPayout.call({ taskId: i, role: 'MANAGER', token: tokenAddress.address });
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

    const multiWorker = await userColonyClient.setTaskWorkerPayout.startOperation({ taskId: i, token: tokenAddress.address, amount: new bigNumber((payout.amount + 1)) });    // Needs Manager and Worker
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
