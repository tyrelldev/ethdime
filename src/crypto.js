
var BufferWriter = require("bitcore-lib/lib/encoding/bufferwriter");
var ECDSA = require("bitcore-lib/lib/crypto/ecdsa");
var Signature = require("bitcore-lib/lib/crypto/signature");
var sha256sha256 = require("bitcore-lib/lib/crypto/hash").sha256sha256;
var Buffer = require("buffer").Buffer;
var ethutils = require("ethereumjs-util")

const MAGIC_BYTES = new Buffer('Bitcoin Signed Message:\n');

function magicHash(msg) {
  var prefix1 = BufferWriter.varintBufNum(MAGIC_BYTES.length);
  var messageBuffer = new Buffer(msg);
  var prefix2 = BufferWriter.varintBufNum(messageBuffer.length);
  var buf = Buffer.concat([prefix1, MAGIC_BYTES, prefix2, messageBuffer]);
  var hash = sha256sha256(buf);
  return hash;
};

export function recoverPubKey(msg, sig) {
  var ecdsa = new ECDSA();
  ecdsa.hashbuf = magicHash(msg);
  ecdsa.sig = Signature.fromCompact(sig);
  ecdsa.sig.compressed = false; // force it to use uncompressed format
  var pubKey = ecdsa.toPublicKey();
  return pubKey.toString();
}

export function createEthAddress(pubKey) {
  // https://kobl.one/blog/create-full-ethereum-keypair-and-address/
  var buff = new Buffer(pubKey, 'hex').slice(1)
  var addr = ethutils.toChecksumAddress(ethutils.bufferToHex(ethutils.pubToAddress(buff)))

  return addr;
}
