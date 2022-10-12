module.exports = {
  token: 'your bot token', // Put the token
  clientId: 'your bot id', // client id
  prefix: '.', // Input Of prefix
  owners: ['your id'], // place owner ids in array
  color: 'BLURPLE', // You can place any color you want to
  database: 'mongodb url', // mongodb link
  nodes: [
    {
      name: 'Alpha Lavalink', // any name can be given
      url: 'lavalink url:lavalink port', // lavalink host and port in this format host:port, ex:- alpha.xyz:6969
      auth: 'lavalink pass', // the password for your lavalink server
      secure: false, // if ssl set it to true
    },
  ],
};
