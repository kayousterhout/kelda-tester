// This file deploys a Jenkins instance running integration-tester. It shows an example
// of all paramters to `tester.New`. It uses a floating IP to automatically
// configure `jenkinsUrl`.

const { createDeployment, Machine } = require('@quilt/quilt');
const Tester = require('./tester.js');

const deployment = createDeployment();
const baseMachine = new Machine({ provider: 'Amazon' });

deployment.deploy(baseMachine.asMaster());

const worker = baseMachine.asWorker();
worker.floatingIp = '8.8.8.8';
deployment.deploy(worker);

const tester = new Tester({
  awsAccessKey: 'accessKey',
  awsSecretAccessKey: 'secret',
  gceProjectID: 'projectID',
  gcePrivateKey: 'privateKey',
  gceClientEmail: 'email',
  digitalOceanKey: 'key',
  testingNamespace: 'integration-tester',
  slackTeam: 'quilt-dev',
  slackChannel: '#testing',
  slackToken: 'secret',
  // Because of a bug with the `applyTemplate` function, dollar sign literals
  // (`$`) need to be replaced with `$$`.
  passwordHash: '#jbcrypt:$$2a$$10$$Jcwink6XXoUIp3Ieh.1QR.Mx5idVA7QNLHNcF2jQWhoCA96y5k/jS',
  jenkinsUrl: `http://${worker.floatingIp}:8080`,
});

tester.deploy(deployment);
