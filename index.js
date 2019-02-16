const os = require('os');
const axios = require('axios');
const tpl = require('./template.json');


getNetworkStatus(loop);

function loop(isConnected) {
  if (isConnected) {
    const network = os.networkInterfaces();
    const args = {};
    const json = {...tpl};
    const data = json.data = {...tpl.data};

    if (network.eth0) {
      args.type = 'eth';
      args.ip = network.eth0[0].address;
    } else if (network.wlan0) {
      args.type = 'wlan'; // wifi
      args.ip = network.wlan0[0].address;
    }
    for(let k in data) {
      data[k].value = template(data[k].value, args);
    }
    data.keyword1.value = getDate();

    axios.post('http://wxmsg.dingliqc.com/send', json)
      .then(response => {
        if (response && response.code === 200) {
          console.log('local ip send success!');
        }
      });
  } else {
    setTimeout(() => getNetworkStatus(loop), 3000);
  }
}

function template(tpl, args) {
  return tpl.replace(/\{(.+?)\}/g, (v, k) => k in args ? args[k] : v);
}

function getNetworkStatus(cb) {
  require('dns').resolve('www.baidu.com', function(err) {
    if (err && err.code == 'ENOTFOUND') {
      cb(false);
    } else {
      cb(true);
    }
  });
}

function getDate() {
  const d = new Date();
  const f = str => str > 10 ? str : '0' + str;
  const dt = [d.getFullYear(), f(d.getMonth()), f(d.getDate())];
  const tm = [f(d.getHours()), f(d.getMinutes())];

  return [dt.join('-'), tm.join(':')].join(' ');
}
