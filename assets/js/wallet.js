// Copyright (c) 2018, The TurtleCoin Developers
//
// Please see the included LICENSE file for more information.

var show_generate = function() {
  document.getElementById("generate").style.display = "block";
  document.getElementById("restore").style.display = "none";
  document.getElementById("step2").style.display = "none";
  document.getElementById("step3").style.display = "none";
  document.getElementById("step4").style.display = "none";
};

var show_restore = function() {
  document.getElementById("restore").style.display = "block";
  document.getElementById("generate").style.display = "none";
  document.getElementById("step2").style.display = "none";
  document.getElementById("step3").style.display = "none";
  document.getElementById("step4").style.display = "none";

};

var getStringWords = function(string) {
  return string.replace(/^\s*(.*)\s*$/, '$1').replace(/\s+/, ' ').split(' ');
};

var genkeys = function(additional_entropy, lang) {
  var seed = cnUtil.sc_reduce32(poor_mans_kdf(additional_entropy + cnUtil.rand_32()));
  var keys = cnUtil.create_address(seed);
  var passPhrase = mn_encode(seed, lang);
  return {
    keys: keys,
    mnemonic: passPhrase
  }
};

var genturticon = function(address) {
  document.getElementById("identicon_widget").innerHTML = "";
  var icon = document.createElement("canvas");
  icon.width = 128;
  icon.height = 128;
  icon.setAttribute("data-jdenticon-value", address);
  document.getElementById("identicon_widget").appendChild(icon);
  jdenticon.update(icon);
};

var restore_keys = function(lang) {
  var seed_phrase = document.getElementById("seed_phrase").value;
  var seed = mn_decode(seed_phrase);
  var keys = cnUtil.create_address(seed);

  address_widget.innerHTML = keys.public_addr;
  mnemonic_widget.innerHTML = seed_phrase;
  spend_key_widget.innerHTML = keys.spend.sec;
  view_key_widget.innerHTML = keys.view.sec;

  document.getElementById("step2").style.display = "block";
  document.getElementById("step3").style.display = "block";
  document.getElementById("step4").style.display = "block";
  genturticon(keys.public_addr);

};

var genwallet = function(lang) {
  document.getElementById("step2").style.display = "block";
  document.getElementById("step3").style.display = "block";
  document.getElementById("step4").style.display = "block";

  var spend_key_widget = document.getElementById("spend_key_widget");
  var view_key_widget = document.getElementById("view_key_widget");
  var address_widget = document.getElementById("address_widget");
  var address_qr_widget = document.getElementById("address_qr_widget");
  var user_entropy_widget = document.getElementById("user_entropy_widget");



  var res = genkeys(user_entropy_widget.value, lang);
  var keys = res.keys;
  var mnemonic = res.mnemonic;

  address_widget.innerHTML = keys.public_addr;
  mnemonic_widget.innerHTML = mnemonic;
  spend_key_widget.innerHTML = keys.spend.sec;
  view_key_widget.innerHTML = keys.view.sec;

  address_widget_copy.innerHTML = keys.public_addr;
  mnemonic_widget_copy.innerHTML = mnemonic;
  spend_key_widget_copy.innerHTML = keys.spend.sec;
  view_key_widget_copy.innerHTML = keys.view.sec;

  var typeNumber = 0;
  var errorCorrectionLevel = 'L';

  var qr = qrcode(typeNumber, errorCorrectionLevel);
  qr.addData(keys.public_addr);
  qr.make();
  document.getElementById('address_qr_widget_copy').innerHTML = qr.createImgTag();


  var qr = qrcode(typeNumber, errorCorrectionLevel);
  qr.addData(keys.spend.sec);
  qr.make();
  document.getElementById('qrcodeSecret_copy').innerHTML = qr.createImgTag();

  var qr = qrcode(typeNumber, errorCorrectionLevel);
  qr.addData(keys.view.sec);
  qr.make();
  document.getElementById('qrcodeView_copy').innerHTML = qr.createImgTag();

  genturticon(keys.public_addr);

};

/*
previous_button_text = "";
prefix = "";
function genwallet_prefix_worker()
{
  attempts = 0;
  while (true) {
    attempts++;
    seed = cnUtil.sc_reduce32(cnUtil.rand_32());
	var passPhrase = mn_encode(seed,current_lang);
	var words = getStringWords(passPhrase);
	seed = CryptoJS.SHA256(salt + words.join(' ')).toString();
    keys = cnUtil.create_address_if_prefix(seed,prefix);
    if (keys != null) {
      gen_prefix_widget = document.getElementById("gen_prefix_widget");
      prefix_widget = document.getElementById("prefix_widget");
      gen_prefix_widget.value = previous_button_text;
      prefix_widget.disabled = false;
      generating = false;
      break;
    }
    if (attempts == 10) {
      if (generating)
        setTimeout(genwallet_prefix_worker, 0);
      return;
    }
  }
  mnemonic = passPhrase;

  spend_key_widget = document.getElementById("spend_key_widget");
  view_key_widget = document.getElementById("view_key_widget");
  address_widget = document.getElementById("address_widget");
  // mnemonic_widget = document.getElementById("mnemonic_widget");

  spend_key_widget.innerHTML = keys.spend.sec;
  view_key_widget.innerHTML = keys.view.sec;
  address_widget.innerHTML = keys.public_addr;
  address_qr_widget.innerHTML = "";
  // mnemonic_widget.innerHTML = mnemonic;

  wallet_keys_widget.innerHTML = keys.privateKeys;

  qr=new QRCode(address_qr_widget, {correctLevel:QRCode.CorrectLevel.L});
  qr.makeCode("DERO":"+keys.public_addr);
}

var zerohex="0000000000000000000000000000000000000000000000000000000000000000";
var ffhex="ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff";
var lowest_address=cnUtil.pubkeys_to_string(zerohex,zerohex);
var highest_address=cnUtil.pubkeys_to_string(ffhex,ffhex);

function is_valid_prefix(prefix)
{
  if (prefix.length <= 0 || prefix.length >= 95)
    return false;
  var lowest=lowest_address.substr(0,prefix.length);
  var highest=highest_address.substr(0,prefix.length);
  if (prefix<lowest)
    return false;
  if (prefix>highest)
    return false;
  return true;
}

function check_prefix_validity()
{
  gen_prefix_widget = document.getElementById("gen_prefix_widget");
  prefix_widget = document.getElementById("prefix_widget");
  if (gen_prefix_widget.value == "STOP")
    return;
  prefix=prefix_widget.value;
  if (is_valid_prefix(prefix)) {
    gen_prefix_widget.value = "Generate wallet with prefix";
    gen_prefix_widget.disabled = false;
  }
  else {
    gen_prefix_widget.value = "Invalid prefix";
    gen_prefix_widget.disabled = true;
  }
}

generating = false;
function genwallet_prefix()
{
  gen_prefix_widget = document.getElementById("gen_prefix_widget");
  prefix_widget = document.getElementById("prefix_widget");
  if (generating) {
    generating = false;
    gen_prefix_widget.value = previous_button_text;
    prefix_widget.disabled = false;
  }
  else {
    prefix_widget = document.getElementById("prefix_widget");
    prefix = prefix_widget.value;
    prefix.trim();
    if (prefix.length < 5 || prefix[0] != "TRTL") {
      alert("Bad prefix "+prefix+" should start with K and be at least one extra character");
      return;
    }
    if (!is_valid_prefix(prefix)) {
      alert("Bad prefix "+prefix+" is not a valid address prefix");
      return;
    }

    generating = true;
    previous_button_text = gen_prefix_widget.value;
    gen_prefix_widget.value = "STOP";
    prefix_widget.disabled = true;
    setTimeout(genwallet_prefix_worker, 0);
  }
}
*/

// function toggle_qr()
// {
//   address_qr_widget = document.getElementById("address_qr_widget");
//   spend_key_widget = document.getElementById("spend_key_widget");
//   view_key_widget = document.getElementById("view_key_widget");
//   // mnemonic_widget = document.getElementById("mnemonic_widget");
//   if (address_qr_widget.style.display=="block") {
//     address_qr_widget.style.display="none";
//     spend_key_widget.style.display = "block";
//     view_key_widget.style.display = "block";
//     // mnemonic_widget.style.display = "block";
//   }
//   else {
//     address_qr_widget.style.display="block";
//     spend_key_widget.style.display = "none";
//     view_key_widget.style.display = "none";
//     // mnemonic_widget.style.display = "none";
//   }
// }
