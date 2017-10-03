const quilt = require('@quilt/quilt');
const jenkins = require('./jenkins.js');
const SCPServer = require('./scp-server');
const sshpk = require('sshpk');

const scpPort = 2222;
const releaseUser = 'releaser';

/**
 * KeyPair represents a public and private key used for authentication.
 */
class KeyPair {
  constructor(pub, priv) {
    this.pub = pub;
    this.priv = priv;
  }
}

/**
 * newKeyPair generates a random KeyPair.
 *
 * @returns {KeyPair}
 */
function newKeyPair() {
  const generatedKey = sshpk.generatePrivateKey('ecdsa');
  return new KeyPair(generatedKey.toPublic().toString(),
    generatedKey.toString());
}

/**
 * parseKey parses the provided private key into a KeyPair.
 *
 * @param {string} priv The private key.
 * @returns {KeyPair}
 */
function parseKey(priv) {
  const pub = sshpk.parsePrivateKey(priv).toPublic().toString();
  return new KeyPair(pub, priv);
}

/**
 * Tester represents our test infrastructure. It deploys a SCP server that Travis
 * pushes releases to, and a Jenkins instance that tests these releases.
 */
class Tester {
  /**
   * @param {Object} jenkinsOpts The options for running Jenkins.
   * @param {[string]} userKey The private key to allow to connect to the SCP server.
   * @param {[string]} hostKey The private key to identify the SCP server to clients.
   */
  constructor(jenkinsOpts, { userKey = '', hostKey = '' } = {}) {
    let userKeyPair;
    if (userKey !== '') {
      userKeyPair = parseKey(userKey);
    } else {
      userKeyPair = newKeyPair();
      console.log('Generated a new private key for the SCP user:');
      console.log(userKeyPair.priv);
    }

    let hostKeyPair;
    if (userKey !== '') {
      hostKeyPair = parseKey(hostKey);
    } else {
      hostKeyPair = newKeyPair();
    }

    this.scp = new SCPServer(releaseUser, scpPort, userKeyPair, hostKeyPair);
    this.jenkins = jenkins.New(jenkinsOpts, this.scp);

    this.scp.allowFrom(this.jenkins);
    this.scp.allowFrom(quilt.publicInternet);
  }

  deploy(deployment) {
    this.scp.deploy(deployment);
    this.jenkins.deploy(deployment);
  }

  /**
   * Place the encapsulated containers according to the given placement rule.
   *
   * @param {quilt.Placement} plcm The placement rule
   * @return {void}
   */
  placeOn(plcm) {
    this.scp.placeOn(plcm);
    this.jenkins.placeOn(plcm);
  }
}

module.exports = Tester;
